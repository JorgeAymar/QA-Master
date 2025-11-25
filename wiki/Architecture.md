# Arquitectura del Sistema

QA Master está construido con una arquitectura moderna de Next.js 16 utilizando el App Router y Server Components.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  React UI   │  │  Drag & Drop │  │  i18n (ES/EN/PT) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
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

## Capas de la Aplicación

### 1. Capa de Presentación (UI)

**Ubicación**: `src/components/`, `src/app/(dashboard)/`

- **Componentes React**: Interfaz de usuario moderna con TailwindCSS
- **Client Components**: Interactividad (formularios, drag & drop, modales)
- **Server Components**: Renderizado del lado del servidor para mejor rendimiento
- **Internacionalización**: Sistema de diccionarios multiidioma

**Tecnologías**:
- React 19 (Server Components)
- TailwindCSS 4
- @dnd-kit (Drag & Drop)
- Lucide React (Iconos)

### 2. Capa de Lógica de Negocio (Server Actions)

**Ubicación**: `src/app/actions/`

Server Actions de Next.js que manejan:
- Autenticación (`auth.ts`)
- Gestión de proyectos (`projects.ts`)
- Historias de usuario (`stories.ts`)
- Funcionalidades (`features.ts`)
- Testing (`testing.ts`)
- Perfil de usuario (`profile.ts`)

**Ventajas**:
- Type-safe (TypeScript)
- No necesita API REST separada
- Optimistic updates
- Revalidación automática

### 3. Capa de Datos (Prisma ORM)

**Ubicación**: `prisma/schema.prisma`, `src/lib/prisma.ts`

**Modelos principales**:
- `User`: Usuarios del sistema
- `Project`: Proyectos de testing
- `Feature`: Funcionalidades/épicas
- `UserStory`: Historias de usuario
- `TestRun`: Ejecuciones de tests
- `TestResult`: Resultados individuales

**Características**:
- Type-safe queries
- Migraciones automáticas
- Relaciones bien definidas
- Cascade deletes

### 4. Capa de Testing con IA

**Ubicación**: `src/lib/ai-testing.ts`

**Flujo de Testing**:

```
1. Recibir historia de usuario
2. Abrir navegador (Playwright)
3. Navegar a URL del proyecto
4. Capturar estado inicial
5. Enviar a GPT-4 para análisis
6. IA decide acciones (click, fill, etc.)
7. Ejecutar acciones en navegador
8. Repetir hasta evaluación final
9. Capturar screenshot
10. Generar reporte con razonamiento
```

**Componentes**:
- **Playwright**: Automatización de navegador
- **OpenAI GPT-4**: Evaluación inteligente
- **Loop Agentico**: La IA puede interactuar con la página

## Flujo de Datos

### Autenticación

```
Usuario → Login Form → Server Action (auth.ts)
  → bcrypt.compare → JWT Token → Cookie
  → Middleware verifica en cada request
```

### Ejecución de Test

```
Usuario → Click "Play" → Server Action (testing.ts)
  → Create TestRun → Playwright abre navegador
  → AI Testing Loop → Captura screenshot
  → Save TestResult → Revalidate UI
```

### Drag & Drop

```
Usuario arrastra → DndContext (client)
  → onDragEnd → Optimistic update (local state)
  → Server Action (reorderStories/reorderFeatures)
  → Update DB → Revalidate path
```

## Seguridad

### Autenticación
- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT tokens firmados con secret
- HttpOnly cookies

### Autorización
- Middleware verifica token en rutas protegidas
- Server Actions validan usuario autenticado
- Queries filtran por usuario actual

### Validación
- Validación en cliente (formularios)
- Validación en servidor (Server Actions)
- Prisma schema constraints

## Rendimiento

### Optimizaciones
- Server Components por defecto (menos JS al cliente)
- Streaming SSR
- Optimistic updates
- Revalidación granular con `revalidatePath`
- Imágenes optimizadas con Next.js Image

### Caching
- Next.js cache automático
- Prisma connection pooling
- Static generation donde es posible

## Escalabilidad

### Horizontal
- Stateless (JWT en cookies)
- Database connection pooling
- Puede desplegarse en múltiples instancias

### Vertical
- Playwright puede ejecutarse en paralelo
- Background jobs para tests largos (futuro)
- Queue system para tests (futuro)

## Próximos Pasos

- [Estructura del Proyecto](Project-Structure)
- [Base de Datos](Database-Schema)
- [API Reference](API-Reference)
