# English Exercise Platform - Application Overview

## Overview

Complete web system for creating and solving English exercises, built with Next.js 16, TypeScript, Tailwind CSS, and Prisma ORM. The system allows creating **Exercise Books** containing multiple exercises of different types, with automatic correction, attempt history, and progress tracking.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui (Button, Card, Input, RadioGroup, Badge, etc.)
- **Tables**: AG Grid (v35+)
- **Validation**: Zod
- **Authentication**: Session-based with cookies
- **Notifications**: Sonner (toast notifications)
- **PDF**: @react-pdf/renderer
- **Email**: MailerSend

## Database Structure

### `users` Table
```sql
- id: UUID (PK)
- email: TEXT (UNIQUE)
- passwordHash: TEXT
- fullName: TEXT
- role: TEXT ('admin' | 'teacher' | 'student')
- level: TEXT (A1, A2, B1, etc.)
- isGeneral: BOOLEAN (true = Private, false = Bela Lira)
- status: TEXT ('active' | 'inactive')
- teacherId: UUID (FK -> users.id) -- Teacher-student link
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### `sessions` Table
```sql
- id: UUID (PK)
- userId: UUID (FK -> users.id)
- expiresAt: TIMESTAMP
```

### `exercises` Table (Exercise Books)
```sql
- id: UUID (PK)
- teacherId: UUID (FK -> users.id)
- title: TEXT (Book name)
- description: TEXT
- exercises: JSONB (Array of exercises)
- difficulty: TEXT ('easy' | 'medium' | 'hard')
- tags: JSONB (Array of tags)
- role: TEXT ('teacher' | 'student')
- level: TEXT (A1, A2, B1, etc.)
- isGeneral: BOOLEAN
- isPublished: BOOLEAN
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### `submissions` Table
```sql
- id: UUID (PK)
- exerciseId: UUID (FK -> exercises.id)
- studentId: UUID (FK -> users.id)
- answers: JSONB (Student answers)
- corrections: JSONB (Correction results)
- score: INTEGER (Correct answers)
- totalQuestions: INTEGER
- attempt: INTEGER (Attempt number)
- createdAt: TIMESTAMP
```

### `student_exercise_access` Table
```sql
- id: UUID (PK)
- studentId: UUID (FK -> users.id)
- exerciseId: UUID (FK -> exercises.id)
- assignedBy: UUID (FK -> users.id)
- assignedAt: TIMESTAMP
- dueDate: TIMESTAMP (optional)
- isActive: BOOLEAN
```

## Exercise Types

### 1. Multiple Choice
```typescript
{
  type: "multiple_choice",
  prompt: "Question text",
  content: {
    options: [
      { id: "uuid", text: "Option A", correct: false },
      { id: "uuid", text: "Option B", correct: true },
      { id: "uuid", text: "Option C", correct: false }
    ],
    allowMultiple: false,
    explanation: "Explanation text"
  }
}
```

### 2. Fill in the Blanks
```typescript
{
  type: "fill_blank",
  prompt: "Complete the sentence",
  content: {
    text: "She {{verb}} studying English for {{time}}.",
    blanks: {
      "verb": ["is", "has been"],
      "time": ["years", "months"]
    },
    caseSensitive: false
  }
}
```

### 3. Import from Word
```typescript
{
  type: "import_word",
  prompt: "Imported exercises",
  content: {
    rawText: "Original text",
    parsedExercises: [
      // Array of multiple_choice or fill_blank exercises
    ]
  }
}
```

## User Roles

### Admin
- Full platform access
- Create and manage teachers and students
- View all dashboards (read-only)
- System configuration

### Teacher
- Create and manage exercises
- Add and manage students
- View student submissions
- Generate reports and PDFs
- Send results via email
- Assign exercises to students

### Student
- Solve assigned exercises
- View results and corrections
- Track progress
- Multiple attempts per exercise
- Access via magic link (no password required)

## Key Features

### Exercise Management
- Create exercise books with multiple questions
- Three question types: multiple choice, fill blanks, import from Word
- Publish/unpublish exercises
- Duplicate exercises
- Edit exercises (only if no submissions)
- Delete exercises (only if no submissions)

### Student Management
- Add students manually
- Generate magic links for passwordless access
- Assign exercises to specific students
- Track student progress
- View submission history

### Automatic Correction
- Instant feedback
- Detailed explanations
- Score calculation
- Blank-by-blank correction for fill-in exercises
- Multiple accepted answers support

### Reports and Export
- PDF generation with react-pdf
- Email sending with MailerSend
- Detailed submission reports
- Progress tracking
- Attempt history

### Magic Link System
- Passwordless authentication for students
- Secure token-based access
- Automatic session creation
- Configurable expiration

## Project Structure

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── admin/             # Admin endpoints
│   │   ├── exercises/         # Exercise CRUD
│   │   ├── submissions/       # Submission handling
│   │   ├── teacher/           # Teacher endpoints
│   │   └── student/           # Student endpoints
│   ├── dashboard/             # Dashboards
│   │   ├── admin/            # Admin dashboard
│   │   ├── teacher/          # Teacher dashboard
│   │   └── student/          # Student dashboard
│   └── login/                # Login page
├── components/
│   ├── exercises/            # Exercise components
│   │   ├── editors/         # Exercise editors
│   │   ├── ExerciseRenderer.tsx
│   │   └── DetailedCorrection.tsx
│   ├── pdf/                 # PDF templates
│   ├── teacher/             # Teacher components
│   └── ui/                  # Base UI components
├── lib/
│   ├── actions/             # Server actions
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   └── utils/               # Utilities
└── prisma/
    ├── schema.prisma        # Database schema
    └── migrations/          # Database migrations
```

## Authentication Flow

1. User enters email and password
2. System validates credentials
3. Creates session with expiration
4. Stores session in database
5. Sets secure HTTP-only cookie
6. Redirects to appropriate dashboard

### Magic Link Flow (Students)
1. Teacher generates magic link
2. Link contains secure token
3. Student clicks link
4. System validates token
5. Creates session automatically
6. Redirects to student dashboard

## Correction Algorithm

### Multiple Choice
```typescript
const isCorrect = userAnswer === correctOption.id;
```

### Fill in the Blanks
```typescript
for (const [blankKey, acceptedAnswers] of Object.entries(blanks)) {
  const userAnswer = userAnswers[blankKey];
  const isCorrect = acceptedAnswers.some(accepted => 
    caseSensitive 
      ? accepted === userAnswer
      : accepted.toLowerCase() === userAnswer.toLowerCase()
  );
}
```

## Security

- Password hashing with bcryptjs
- Session-based authentication
- HTTP-only cookies
- CSRF protection
- Role-based access control
- Secure token generation for magic links
- SQL injection prevention (Prisma)

## Performance

- Server-side rendering (SSR)
- Static generation where possible
- Optimistic UI updates
- React Query for caching
- AG Grid for large datasets
- Lazy loading of components

## Best Practices

- TypeScript for type safety
- Zod for runtime validation
- Server actions for mutations
- API routes for complex operations
- Component composition
- Separation of concerns
- Error handling
- Loading states
- Toast notifications

## Future Enhancements

- Real-time collaboration
- Audio/video exercises
- Gamification
- Analytics dashboard
- Mobile app
- AI-powered suggestions
- Bulk operations
- Advanced reporting
