# Database Schema

QA Master uses PostgreSQL with Prisma ORM. This document describes the complete schema.

## ER Diagram

```
┌──────────────┐
│     User     │
└──────────────┘
       │
       │ (no direct relation, but auth context)
       │
       ▼
┌──────────────┐       ┌──────────────┐
│   Project    │◄──────│   Feature    │
└──────────────┘       └──────────────┘
       │                      │
       │                      │
       ├──────────────────────┤
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│  UserStory   │───────│ TestResult   │
└──────────────┘       └──────────────┘
       │                      │
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│   TestRun    │───────│              │
└──────────────┘       └──────────────┘
```

## Models

### User

System users.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String?
  image     String?  @db.Text // Base64 profile image
  language  String   @default("es") // es, en, pt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Fields**:
- `password`: Hashed with bcrypt (10 rounds)
- `image`: Stored as Base64 in Text
- `language`: User preferred language

### Project

Testing projects.

```prisma
model Project {
  id          String      @id @default(cuid())
  name        String
  baseUrl     String      // Application URL to test
  description String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  stories     UserStory[]
  testRuns    TestRun[]
  features    Feature[]
  githubRepo  String?     // Format: "owner/repo"
}
```

**Relationships**:
- `stories`: Project stories
- `testRuns`: Test executions
- `features`: Project features

### Feature

Features/Epics to organize stories.

```prisma
model Feature {
  id          String      @id @default(cuid())
  name        String
  projectId   String
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userStories UserStory[]
  order       Int         @default(0) // For drag & drop ordering
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

**Key Fields**:
- `order`: Position on the board (0, 1, 2, ...)
- `onDelete: Cascade`: When project is deleted, features are deleted

### UserStory

User stories to test.

```prisma
model UserStory {
  id                 String       @id @default(cuid())
  title              String
  acceptanceCriteria String       // Criteria evaluated by AI
  status             String       @default("PENDING") // PENDING, COMPLETED
  projectId          String
  project            Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  featureId          String?      // Optional, can be uncategorized
  feature            Feature?     @relation(fields: [featureId], references: [id])
  testResults        TestResult[]
  order              Int          @default(0) // For ordering
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}
```

**Key Fields**:
- `acceptanceCriteria`: Text evaluated by AI
- `status`: Updates to COMPLETED when test passes
- `featureId`: Nullable, allows uncategorized stories
- `order`: Position within its feature

### TestRun

Test execution (can contain multiple results).

```prisma
model TestRun {
  id          String       @id @default(cuid())
  projectId   String
  status      String       @default("RUNNING") // RUNNING, COMPLETED, FAILED
  createdAt   DateTime     @default(now())
  completedAt DateTime?
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  results     TestResult[]
}
```

**Statuses**:
- `RUNNING`: Test in progress
- `COMPLETED`: Finished successfully
- `FAILED`: Execution failed

### TestResult

Individual result of a story.

```prisma
model TestResult {
  id         String    @id @default(cuid())
  runId      String
  storyId    String
  status     String    // PASS, FAIL, SKIPPED
  logs       String?   // Logs and AI reasoning
  screenshot String?   // Base64 screenshot
  createdAt  DateTime  @default(now())
  testRun    TestRun   @relation(fields: [runId], references: [id], onDelete: Cascade)
  story      UserStory @relation(fields: [storyId], references: [id], onDelete: Cascade)
}
```

**Key Fields**:
- `logs`: Includes AI reasoning
- `screenshot`: Base64 capture
- `status`: PASS/FAIL/SKIPPED

## Indexes and Optimizations

### Automatic Indexes

Prisma creates indexes automatically for:
- `@id` fields
- `@unique` fields
- Foreign keys

### Recommended Indexes (Future)

```prisma
@@index([projectId, createdAt]) // For history queries
@@index([storyId, createdAt])   // For story history
```

## Migrations

### Apply Changes

```bash
# Development (direct push)
npx prisma db push

# Production (with migrations)
npx prisma migrate deploy
```

### View Database

```bash
npx prisma studio
```

## Common Queries

### Project with All Relationships

```typescript
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    stories: {
      include: {
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    },
    features: {
      orderBy: { order: 'asc' }
    }
  }
});
```

### Story History

```typescript
const history = await prisma.testResult.findMany({
  where: { storyId },
  orderBy: { createdAt: 'desc' },
  include: { testRun: true }
});
```

## Next Steps

- [Architecture](Architecture)
- [API Reference](API-Reference)
