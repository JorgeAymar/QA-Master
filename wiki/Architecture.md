# System Architecture

QA Master is built with a modern Next.js 16 architecture using the App Router and Server Components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  React UI   │  │  Drag & Drop │  │  i18n (ES/EN/PT) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
13: └────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Next.js 16    │
                    │   App Router    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Server Actions │  │ Server Components│  │   Middleware   │
│  (API Layer)   │  │  (SSR/Streaming) │  │  (Auth Guard)  │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Prisma ORM     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │   Playwright    │  │   OpenAI API   │
│   (Database)   │  │  (Automation)   │  │   (AI Tests)   │
└────────────────┘  └─────────────────┘  └────────────────┘
```

## Application Layers

### 1. Presentation Layer (UI)

**Location**: `src/components/`, `src/app/(dashboard)/`

- **React Components**: Modern UI with TailwindCSS
- **Client Components**: Interactivity (forms, drag & drop, modals)
- **Server Components**: Server-side rendering for better performance
- **Internationalization**: Multi-language dictionary system

**Technologies**:
- React 19 (Server Components)
- TailwindCSS 4
- @dnd-kit (Drag & Drop)
- Lucide React (Icons)

### 2. Business Logic Layer (Server Actions)

**Location**: `src/app/actions/`

Next.js Server Actions handling:
- Authentication (`auth.ts`)
- Project management (`projects.ts`)
- User stories (`stories.ts`)
- Features (`features.ts`)
- Testing (`testing.ts`)
- User profile (`profile.ts`)

**Advantages**:
- Type-safe (TypeScript)
- No separate REST API needed
- Optimistic updates
- Automatic revalidation

### 3. Data Layer (Prisma ORM)

**Location**: `prisma/schema.prisma`, `src/lib/prisma.ts`

**Main Models**:
- `User`: System users
- `Project`: Testing projects
- `Feature`: Features/Epics
- `UserStory`: User stories
- `TestRun`: Test executions
- `TestResult`: Individual results

**Features**:
- Type-safe queries
- Automatic migrations
- Well-defined relationships
- Cascade deletes

### 4. AI Testing Layer

**Location**: `src/lib/ai-testing.ts`

**Testing Flow**:

```
1. Receive user story
2. Open browser (Playwright)
3. Navigate to project URL
4. Capture initial state
5. Send to GPT-4 for analysis
6. AI decides actions (click, fill, etc.)
7. Execute actions in browser
8. Repeat until final evaluation
9. Capture screenshot
10. Generate report with reasoning
```

**Components**:
- **Playwright**: Browser automation
- **OpenAI GPT-4**: Intelligent evaluation
- **Agentic Loop**: AI can interact with the page

## Data Flow

### Authentication

```
User → Login Form → Server Action (auth.ts)
  → bcrypt.compare → JWT Token → Cookie
  → Middleware verifies on each request
```

### Test Execution

```
User → Click "Play" → Server Action (testing.ts)
  → Create TestRun → Playwright opens browser
  → AI Testing Loop → Capture screenshot
  → Save TestResult → Revalidate UI
```

### Drag & Drop

```
User drags → DndContext (client)
  → onDragEnd → Optimistic update (local state)
  → Server Action (reorderStories/reorderFeatures)
  → Update DB → Revalidate path
```

## Security

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with secret
- HttpOnly cookies

### Authorization
- Middleware verifies token on protected routes
- Server Actions validate authenticated user
- Queries filter by current user

### Validation
- Client-side validation (forms)
- Server-side validation (Server Actions)
- Prisma schema constraints

## Performance

### Optimizations
- Server Components by default (less JS to client)
- Streaming SSR
- Optimistic updates
- Granular revalidation with `revalidatePath`
- Optimized images with Next.js Image

### Caching
- Next.js automatic cache
- Prisma connection pooling
- Static generation where possible

## Scalability

### Horizontal
- Stateless (JWT in cookies)
- Database connection pooling
- Can be deployed on multiple instances

### Vertical
- Playwright can run in parallel
- Background jobs for long tests (future)
- Queue system for tests (future)

## Next Steps

- [Project Structure](Project-Structure)
- [Database Schema](Database-Schema)
- [API Reference](API-Reference)
