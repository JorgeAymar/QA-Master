# Gestión de Proyectos

Los proyectos son el contenedor principal en QA Master. Cada proyecto representa una aplicación web que deseas testear.

## Crear un Proyecto

1. **Navega al Dashboard**
   - Haz click en "Projects" en el sidebar
   - Click en "Nuevo Proyecto"

2. **Completa el Formulario**
   - **Nombre**: Nombre descriptivo de tu proyecto
   - **URL Base**: URL de tu aplicación (ej: `https://mi-app.com`)
   - **Descripción** (opcional): Breve descripción del proyecto

3. **Guardar**
   - Click en "Crear Proyecto"

## Estructura de un Proyecto

```
Proyecto
├── Funcionalidades (Features)
│   ├── Feature 1
│   │   ├── Historia 1
│   │   ├── Historia 2
│   │   └── Historia 3
│   └── Feature 2
│       ├── Historia 4
│       └── Historia 5
└── Sin Categoría
    └── Historias sin feature asignada
```

## Funcionalidades (Features)

Las funcionalidades te permiten organizar historias relacionadas.

### Crear una Funcionalidad

1. En la vista del proyecto, usa el formulario lateral
2. Ingresa el nombre de la funcionalidad
3. Click en "Agregar Funcionalidad"

### Reordenar Funcionalidades

- Usa el icono de **agarre** (⋮⋮) a la izquierda del nombre
- Arrastra hacia arriba o abajo
- El orden se guarda automáticamente

### Renombrar Funcionalidad

- Haz click en el icono de **lápiz** junto al nombre
- Edita el nombre
- Presiona Enter o click en ✓

### Eliminar Funcionalidad

- Click en el icono de **papelera**
- Confirma la eliminación
- **Nota**: Las historias dentro se moverán a "Sin Categoría"

## Editar Proyecto

1. En la vista del proyecto, click en el icono de lápiz junto al nombre
2. Modifica los campos necesarios
3. Click en "Actualizar Proyecto"

## Eliminar Proyecto

⚠️ **Advertencia**: Esta acción es irreversible

1. Ve a la lista de proyectos
2. Click en el icono de papelera del proyecto
3. Confirma la eliminación
4. Se eliminarán todas las funcionalidades, historias y resultados de tests

## Mejores Prácticas

### Nombrar Proyectos

✅ **Bueno**:
- "E-commerce Frontend"
- "API de Pagos v2"
- "Dashboard Admin"

❌ **Evitar**:
- "Proyecto 1"
- "Test"
- "Mi App"

### Organizar con Funcionalidades

Agrupa historias por:
- **Módulo**: Login, Registro, Checkout
- **Épica**: Gestión de Usuarios, Reportes
- **Sprint**: Sprint 1, Sprint 2

### URL Base

- Usa la URL de producción o staging
- Asegúrate de que sea accesible
- Incluye el protocolo (`https://`)

## Próximos Pasos

- [Historias de Usuario](User-Stories)
- [Ejecutar Tests](Running-Tests)
