# Esquema de Base de Datos

QA Master utiliza PostgreSQL con Prisma ORM. Este documento describe el esquema completo.

## Diagrama ER

```
┌──────────────┐
│     User     │
└──────────────┘
       │
       │ (no relación directa, pero auth context)
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

## Modelos

### User

Usuarios del sistema.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hasheado con bcrypt
  name      String?
  image     String?  @db.Text // Base64 de imagen de perfil
  language  String   @default("es") // es, en, pt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Campos clave**:
- `password`: Hasheado con bcrypt (10 rounds)
- `image`: Almacenado como Base64 en Text
- `language`: Idioma preferido del usuario

### Project

Proyectos de testing.

```prisma
model Project {
  id          String      @id @default(cuid())
  name        String
  baseUrl     String      // URL de la aplicación a testear
  description String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  stories     UserStory[]
  testRuns    TestRun[]
  features    Feature[]
}
```

**Relaciones**:
- `stories`: Historias del proyecto
- `testRuns`: Ejecuciones de tests
- `features`: Funcionalidades del proyecto

### Feature

Funcionalidades/épicas para organizar historias.

```prisma
model Feature {
  id          String      @id @default(cuid())
  name        String
  projectId   String
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userStories UserStory[]
  order       Int         @default(0) // Para ordenamiento drag & drop
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

**Campos clave**:
- `order`: Posición en el tablero (0, 1, 2, ...)
- `onDelete: Cascade`: Al eliminar proyecto, se eliminan features

### UserStory

Historias de usuario a testear.

```prisma
model UserStory {
  id                 String       @id @default(cuid())
  title              String
  acceptanceCriteria String       // Criterios de aceptación
  status             String       @default("PENDING") // PENDING, COMPLETED
  projectId          String
  project            Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  featureId          String?      // Opcional, puede estar sin feature
  feature            Feature?     @relation(fields: [featureId], references: [id])
  testResults        TestResult[]
  order              Int          @default(0) // Para ordenamiento
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}
```

**Campos clave**:
- `acceptanceCriteria`: Texto que la IA evalúa
- `status`: Se actualiza a COMPLETED cuando pasa un test
- `featureId`: Nullable, permite historias sin categorizar
- `order`: Posición dentro de su feature

### TestRun

Ejecución de tests (puede contener múltiples resultados).

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

**Estados**:
- `RUNNING`: Test en progreso
- `COMPLETED`: Terminado exitosamente
- `FAILED`: Falló la ejecución

### TestResult

Resultado individual de una historia.

```prisma
model TestResult {
  id         String    @id @default(cuid())
  runId      String
  storyId    String
  status     String    // PASS, FAIL, SKIPPED
  logs       String?   // Logs y razonamiento de la IA
  screenshot String?   // Base64 de captura de pantalla
  createdAt  DateTime  @default(now())
  testRun    TestRun   @relation(fields: [runId], references: [id], onDelete: Cascade)
  story      UserStory @relation(fields: [storyId], references: [id], onDelete: Cascade)
}
```

**Campos clave**:
- `logs`: Incluye razonamiento de la IA
- `screenshot`: Captura en Base64
- `status`: PASS/FAIL/SKIPPED

## Índices y Optimizaciones

### Índices Automáticos

Prisma crea índices automáticamente para:
- Campos `@id`
- Campos `@unique`
- Claves foráneas

### Índices Recomendados (Futuro)

```prisma
@@index([projectId, createdAt]) // Para queries de historial
@@index([storyId, createdAt])   // Para historial de historia
```

## Migraciones

### Aplicar Cambios

```bash
# Desarrollo (push directo)
npx prisma db push

# Producción (con migraciones)
npx prisma migrate deploy
```

### Ver Base de Datos

```bash
npx prisma studio
```

## Queries Comunes

### Proyecto con Todas sus Relaciones

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

### Historial de una Historia

```typescript
const history = await prisma.testResult.findMany({
  where: { storyId },
  orderBy: { createdAt: 'desc' },
  include: { testRun: true }
});
```

## Próximos Pasos

- [Arquitectura](Architecture)
- [API Reference](API-Reference)
