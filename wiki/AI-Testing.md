# Testing con IA

QA Master utiliza un enfoque innovador de testing que combina Playwright con GPT-4 para crear un agente de testing inteligente.

## ¿Cómo Funciona?

### Loop Agentico

A diferencia de los tests tradicionales que siguen scripts fijos, QA Master usa un **loop agentico** donde la IA:

1. **Observa** el estado actual de la página
2. **Razona** sobre qué acciones tomar
3. **Actúa** en el navegador (click, escribir, navegar)
4. **Evalúa** si se cumplieron los criterios
5. **Repite** hasta completar la validación

```
┌─────────────────────────────────────────┐
│  1. Capturar estado de la página       │
│     (HTML, elementos visibles)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Enviar a GPT-4                      │
│     - Historia de usuario               │
│     - Criterios de aceptación           │
│     - Estado actual                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. IA decide próxima acción            │
│     - fill(selector, value)             │
│     - click(selector)                   │
│     - evaluate(criteria)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Playwright ejecuta acción           │
└──────────────┬──────────────────────────┘
               │
               ▼
         ¿Evaluación final?
               │
        No ────┘     Sí
               │      │
               └──────▼
                  RESULTADO
```

## Ejemplo de Evaluación

### Historia de Usuario
```
Título: Login de Usuario
Criterios:
- Dado que estoy en la página de login
- Cuando ingreso email y contraseña válidos
- Entonces debería ser redirigido al dashboard
```

### Proceso de la IA

**Iteración 1**:
```json
{
  "action": "fill",
  "selector": "input[type='email']",
  "value": "test@example.com",
  "reasoning": "Necesito ingresar el email primero"
}
```

**Iteración 2**:
```json
{
  "action": "fill",
  "selector": "input[type='password']",
  "value": "password123",
  "reasoning": "Ahora ingreso la contraseña"
}
```

**Iteración 3**:
```json
{
  "action": "click",
  "selector": "button[type='submit']",
  "reasoning": "Envío el formulario de login"
}
```

**Iteración 4 (Evaluación)**:
```json
{
  "action": "evaluate",
  "status": "PASS",
  "reasoning": "La URL cambió a /dashboard, el usuario fue redirigido correctamente. Todos los criterios se cumplieron."
}
```

## Ventajas del Testing con IA

### 1. Adaptabilidad
- No necesita selectores exactos hardcodeados
- Se adapta a cambios en la UI
- Entiende el contexto semántico

### 2. Razonamiento
- Explica por qué pasó o falló
- Identifica problemas específicos
- Sugiere mejoras

### 3. Menos Mantenimiento
- Tests más resilientes a cambios
- No se rompen por cambios cosméticos
- Enfoque en comportamiento, no en implementación

## Limitaciones

### 1. Costo
- Cada test consume tokens de OpenAI
- Puede ser costoso para muchos tests

### 2. Velocidad
- Más lento que tests tradicionales
- Cada iteración requiere llamada a API

### 3. Determinismo
- Resultados pueden variar ligeramente
- Depende de la calidad del modelo

## Mejores Prácticas

### Escribir Buenos Criterios de Aceptación

✅ **Bueno**:
```
- Dado que estoy en la página de productos
- Cuando hago click en "Agregar al carrito"
- Entonces veo el contador del carrito incrementarse
- Y veo un mensaje de confirmación
```

❌ **Malo**:
```
- El botón debe funcionar
- El carrito debe actualizarse
```

### Criterios Específicos y Medibles

La IA funciona mejor con criterios:
- **Específicos**: "El contador muestra '1'" vs "El contador cambia"
- **Observables**: "Veo un mensaje" vs "El sistema procesa"
- **Secuenciales**: Paso a paso, no todo junto

### URLs Accesibles

Asegúrate de que:
- La URL del proyecto sea accesible públicamente o desde tu red
- No requiera autenticación compleja
- Cargue rápidamente

## Configuración Avanzada

### Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"  # Opcional, por defecto gpt-4
```

### Timeout y Límites

El sistema tiene límites de seguridad:
- **Max iteraciones**: 10 por test
- **Timeout**: 60 segundos por acción
- **Screenshot**: Capturado al final

## Código Fuente

El código del testing con IA está en:
- `src/lib/ai-testing.ts`: Loop agentico principal
- `src/app/actions/testing.ts`: Server actions para ejecutar tests

### Función Principal

```typescript
export async function evaluateStoryWithAI(
  url: string,
  storyTitle: string,
  acceptanceCriteria: string
): Promise<{
  status: 'PASS' | 'FAIL';
  logs: string;
  screenshot: string | null;
}>
```

## Próximos Pasos

- [Ejecutar Tests](Running-Tests)
- [Interpretar Reportes](Understanding-Reports)
- [Arquitectura](Architecture)
