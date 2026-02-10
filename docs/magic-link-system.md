# Magic Link System

## Overview

The Magic Link system provides passwordless authentication for students. Teachers can generate secure links that allow students to access the platform without needing to create or remember passwords.

## How It Works

### 1. Link Generation (Teacher)
```typescript
// Teacher generates a magic link for a student
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

await prisma.studentToken.create({
  data: {
    studentId: student.id,
    token,
    expiresAt
  }
});

const magicLink = `${process.env.NEXT_PUBLIC_URL}/student/access/${token}`;
```

### 2. Link Access (Student)
```typescript
// Student clicks the magic link
// System validates the token
const tokenData = await prisma.studentToken.findUnique({
  where: { token },
  include: { student: true }
});

if (!tokenData || tokenData.expiresAt < new Date()) {
  return { error: "Invalid or expired link" };
}

// Create session automatically
const session = await createSession(tokenData.studentId);
```

### 3. Automatic Login
- No password required
- Session created automatically
- Redirects to student dashboard
- Token can be reused until expiration

## Database Schema

### `student_tokens` Table
```sql
- id: UUID (PK)
- studentId: UUID (FK -> users.id)
- token: TEXT (UNIQUE)
- expiresAt: TIMESTAMP (nullable)
- createdAt: TIMESTAMP
```

## Features

### For Teachers
- **Generate Links**: Create magic links from student management page
- **Copy to Clipboard**: One-click copy functionality
- **Share via Email**: Send links directly to students (future feature)
- **No Expiration Option**: Links can be set to never expire
- **Regenerate**: Create new links if needed

### For Students
- **Passwordless Access**: No need to remember passwords
- **One-Click Login**: Simply click the link to access
- **Persistent Sessions**: Stay logged in across visits
- **Mobile Friendly**: Works on any device

## Security

### Token Generation
```typescript
// Cryptographically secure random token
const token = crypto.randomUUID();
// Example: "550e8400-e29b-41d4-a716-446655440000"
```

### Validation
```typescript
// Check token exists
if (!tokenData) {
  return { error: "Invalid link" };
}

// Check expiration
if (tokenData.expiresAt && tokenData.expiresAt < new Date()) {
  return { error: "Link expired" };
}

// Check student status
if (tokenData.student.status !== 'active') {
  return { error: "Account inactive" };
}
```

### Best Practices
- ✅ Tokens are unique and unpredictable
- ✅ Tokens are stored securely in database
- ✅ Expiration dates are enforced
- ✅ Used tokens are not deleted (can be reused)
- ✅ HTTPS required in production
- ✅ Rate limiting on token validation

## Usage Flow

### Teacher Workflow
1. Navigate to student management page
2. Click "Generate Access Link" for a student
3. Link is generated and copied to clipboard
4. Share link with student via email, WhatsApp, etc.

### Student Workflow
1. Receive magic link from teacher
2. Click the link
3. Automatically logged in
4. Redirected to dashboard
5. Can start solving exercises immediately

## API Endpoints

### Generate Magic Link
```typescript
POST /api/teacher/students/magic-link
Body: { studentId: string }
Response: { magicLink: string }
```

### Validate and Login
```typescript
GET /student/access/[token]
Redirects to: /dashboard/student (if valid)
Redirects to: /login?error=invalid-token (if invalid)
```

## Implementation Example

### Generate Link (Teacher)
```typescript
// components/teacher/StudentManagement.tsx
const generateMagicLink = async (studentId: string) => {
  try {
    const response = await fetch("/api/teacher/students/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId })
    });
    
    const { magicLink } = await response.json();
    
    // Copy to clipboard
    await navigator.clipboard.writeText(magicLink);
    
    toast.success("Link copied to clipboard!");
  } catch (error) {
    toast.error("Failed to generate link");
  }
};
```

### Validate Token (Student)
```typescript
// app/student/access/[token]/page.tsx
export default async function MagicLinkPage({ params }: { params: { token: string } }) {
  const { token } = params;
  
  // Validate token
  const tokenData = await prisma.studentToken.findUnique({
    where: { token },
    include: { student: true }
  });
  
  if (!tokenData || (tokenData.expiresAt && tokenData.expiresAt < new Date())) {
    redirect("/login?error=invalid-token");
  }
  
  // Create session
  const session = await createSession(tokenData.studentId);
  
  // Set cookie
  cookies().set("session", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt
  });
  
  // Redirect to dashboard
  redirect("/dashboard/student");
}
```

## Configuration

### Environment Variables
```env
# Base URL for magic links
NEXT_PUBLIC_URL=http://localhost:3000

# Token expiration (in days)
MAGIC_LINK_EXPIRATION_DAYS=7
```

### Expiration Options
```typescript
// 7 days (default)
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// 30 days
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// No expiration
const expiresAt = null;
```

## Error Handling

### Invalid Token
```typescript
if (!tokenData) {
  return (
    <div>
      <h1>Invalid Link</h1>
      <p>This access link is invalid or has been revoked.</p>
      <Link href="/login">Go to Login</Link>
    </div>
  );
}
```

### Expired Token
```typescript
if (tokenData.expiresAt && tokenData.expiresAt < new Date()) {
  return (
    <div>
      <h1>Link Expired</h1>
      <p>This access link has expired. Please contact your teacher for a new link.</p>
      <Link href="/login">Go to Login</Link>
    </div>
  );
}
```

### Inactive Student
```typescript
if (tokenData.student.status !== 'active') {
  return (
    <div>
      <h1>Account Inactive</h1>
      <p>Your account has been deactivated. Please contact your teacher.</p>
    </div>
  );
}
```

## Advantages

### For Students
- ✅ No password to remember
- ✅ Quick and easy access
- ✅ Works on any device
- ✅ No registration process
- ✅ Immediate access to exercises

### For Teachers
- ✅ Easy student onboarding
- ✅ No password reset requests
- ✅ Full control over access
- ✅ Can revoke access by deactivating student
- ✅ Simple link sharing

### For Platform
- ✅ Reduced support burden
- ✅ Better user experience
- ✅ Higher adoption rate
- ✅ Secure authentication
- ✅ Audit trail of access

## Future Enhancements

- [ ] Email integration for automatic link sending
- [ ] SMS integration for link delivery
- [ ] Link usage analytics
- [ ] One-time use tokens
- [ ] Custom expiration per link
- [ ] Link regeneration from student view
- [ ] QR code generation for links
- [ ] Bulk link generation for multiple students

## Troubleshooting

### Link Not Working
1. Check if link is complete (no truncation)
2. Verify token hasn't expired
3. Confirm student account is active
4. Check if student has correct teacher assignment

### Session Issues
1. Clear browser cookies
2. Try incognito/private mode
3. Check session expiration settings
4. Verify database connection

### Security Concerns
1. Always use HTTPS in production
2. Set appropriate expiration times
3. Monitor for suspicious access patterns
4. Implement rate limiting
5. Log all magic link usage
