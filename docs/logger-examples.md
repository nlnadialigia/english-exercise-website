# Logger System - Usage Examples

## Overview

The application uses a custom logger system that provides structured logging with different levels and contexts. The logger is located at `lib/logger.ts` and is used throughout the application for debugging, monitoring, and auditing.

## Logger Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

## Logger Contexts

- **AUTH**: Authentication and authorization
- **MIDDLEWARE**: Middleware operations
- **DATABASE**: Database operations
- **API**: API route handling
- **SESSION**: Session management

## Basic Usage

### Import the Logger
```typescript
import logger from "@/lib/logger";
```

### Log Messages

#### Debug
```typescript
logger.debug("Detailed debug information", "CONTEXT", { data: "value" });
```

#### Info
```typescript
logger.info("Operation completed successfully", "API", { userId: "123" });
```

#### Warning
```typescript
logger.warn("Potential issue detected", "DATABASE", { query: "SELECT *" });
```

#### Error
```typescript
logger.error("Operation failed", "AUTH", error);
```

## Context-Specific Methods

### Authentication
```typescript
logger.auth("User logged in", { userId: "123", email: "user@example.com" });
logger.auth("Login failed", { email: "user@example.com", reason: "Invalid password" });
```

### Middleware
```typescript
logger.middleware("Request received", { path: "/api/exercises", method: "GET" });
logger.middleware("Response sent", { statusCode: 200, duration: "45ms" });
```

### Database
```typescript
logger.database("Query executed", { table: "users", operation: "SELECT" });
logger.database("Migration completed", { version: "20240101_initial" });
```

### API
```typescript
logger.api("API route called", { route: "/api/exercises", method: "POST" });
logger.api("API response", { statusCode: 201, data: { id: "123" } });
```

### Session
```typescript
logger.session("Session created", { userId: "123", expiresAt: "2024-12-31" });
logger.session("Session expired", { sessionId: "abc123" });
```

## Real-World Examples

### Authentication Flow
```typescript
// Login attempt
logger.auth("Login attempt", { email: user.email });

try {
  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    logger.auth("Login failed - invalid password", { email: user.email });
    return { error: "Invalid credentials" };
  }
  
  const session = await createSession(user.id);
  logger.auth("Login successful", { userId: user.id, sessionId: session.id });
  
  return { success: true };
} catch (error) {
  logger.error("Login error", "AUTH", error);
  return { error: "Internal server error" };
}
```

### Database Operations
```typescript
// Creating a record
logger.database("Creating exercise", { teacherId: user.id, title: data.title });

try {
  const exercise = await prisma.exercise.create({
    data: exerciseData
  });
  
  logger.database("Exercise created", { exerciseId: exercise.id });
  return exercise;
} catch (error) {
  logger.error("Failed to create exercise", "DATABASE", error);
  throw error;
}
```

### API Route
```typescript
export async function POST(request: Request) {
  logger.api("POST /api/exercises", { timestamp: new Date().toISOString() });
  
  try {
    const session = await getSession();
    
    if (!session) {
      logger.warn("Unauthorized access attempt", "API", { path: "/api/exercises" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    logger.api("Request data received", { dataKeys: Object.keys(data) });
    
    const exercise = await createExercise(data);
    logger.api("Exercise created successfully", { exerciseId: exercise.id });
    
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    logger.error("API error", "API", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Submission Processing
```typescript
logger.info("Processing submission", "API", { 
  exerciseId, 
  studentId, 
  questionCount: exercise.exercises.length 
});

// Correct answers
const corrections = exercise.exercises.map((question, index) => {
  const userAnswer = answers[`q_${index}`];
  const correction = correctAnswer(question, userAnswer);
  
  logger.debug("Question corrected", "API", {
    questionIndex: index,
    isCorrect: correction.isCorrect,
    questionType: question.type
  });
  
  return correction;
});

logger.info("Submission corrected", "API", {
  score: totalScore,
  totalQuestions,
  percentage: Math.round((totalScore / totalQuestions) * 100)
});
```

### Magic Link Generation
```typescript
logger.info("Generating magic link", "AUTH", { studentId });

try {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await prisma.studentToken.create({
    data: { studentId, token, expiresAt }
  });
  
  const magicLink = `${process.env.NEXT_PUBLIC_URL}/student/access/${token}`;
  
  logger.auth("Magic link generated", { 
    studentId, 
    expiresAt: expiresAt.toISOString() 
  });
  
  return magicLink;
} catch (error) {
  logger.error("Failed to generate magic link", "AUTH", error);
  throw error;
}
```

## Best Practices

### 1. Use Appropriate Levels
```typescript
// ✅ Good
logger.debug("Variable value", "CONTEXT", { value });
logger.info("Operation completed", "CONTEXT");
logger.warn("Deprecated feature used", "CONTEXT");
logger.error("Operation failed", "CONTEXT", error);

// ❌ Bad
logger.error("User logged in", "AUTH"); // Should be info
logger.debug("Database connection failed", "DATABASE"); // Should be error
```

### 2. Include Relevant Context
```typescript
// ✅ Good
logger.info("Exercise created", "DATABASE", { 
  exerciseId: exercise.id,
  teacherId: exercise.teacherId,
  questionCount: exercise.exercises.length
});

// ❌ Bad
logger.info("Exercise created", "DATABASE"); // Missing context
```

### 3. Don't Log Sensitive Data
```typescript
// ✅ Good
logger.auth("Login attempt", { email: user.email });

// ❌ Bad
logger.auth("Login attempt", { 
  email: user.email, 
  password: password // Never log passwords!
});
```

### 4. Use Structured Data
```typescript
// ✅ Good
logger.api("Request received", { 
  method: request.method,
  path: request.url,
  userId: session.userId
});

// ❌ Bad
logger.api(`Request received: ${request.method} ${request.url} by ${session.userId}`);
```

### 5. Log Errors Properly
```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error("Operation failed", "CONTEXT", error);
  throw error;
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  logger.error("Error", "CONTEXT"); // Missing error object
}
```

## Output Format

The logger outputs messages in the following format:

```
[TIMESTAMP] [LEVEL] [CONTEXT] Message { data }
```

Example:
```
[2024-01-15T10:30:45.123Z] [INFO] [AUTH] User logged in { userId: "123", email: "user@example.com" }
[2024-01-15T10:30:46.456Z] [ERROR] [DATABASE] Query failed { table: "users", error: "Connection timeout" }
```

## Environment Configuration

The logger behavior can be configured via environment variables:

```env
# Log level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=INFO

# Enable/disable logging
ENABLE_LOGGING=true
```

## Production Considerations

In production, consider:
- Setting `LOG_LEVEL=WARN` or `LOG_LEVEL=ERROR`
- Integrating with external logging services (e.g., Datadog, Sentry)
- Implementing log rotation
- Storing logs in a centralized location
- Setting up alerts for error logs
