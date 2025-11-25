# Instalación y Configuración

Esta guía te ayudará a configurar QA Master en tu entorno local.

## Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: v14 o superior
- **npm** o **yarn**
- **Cuenta OpenAI**: Para obtener API key

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/JorgeAymar/QA-Master.git
cd QA-Master
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/qa_master"

# OpenAI
OPENAI_API_KEY="sk-..."

# JWT Secret (genera uno aleatorio)
JWT_SECRET="tu-secreto-super-seguro-aqui"
```

> **Nota**: Nunca compartas tu `OPENAI_API_KEY` ni la subas a GitHub.

### 4. Configurar Base de Datos

```bash
# Crear las tablas
npx prisma db push

# (Opcional) Poblar con datos de ejemplo
npx prisma db seed
```

### 5. Instalar Playwright

```bash
npx playwright install
```

## Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Crear tu Primera Cuenta

1. Navega a `http://localhost:3000/signup`
2. Crea una cuenta con tu email y contraseña
3. Inicia sesión en `/login`

## Verificar Instalación

Para verificar que todo funciona correctamente:

1. Crea un proyecto de prueba
2. Añade una historia de usuario simple
3. Ejecuta un test

Si ves resultados y capturas de pantalla, ¡todo está funcionando! 🎉

## Solución de Problemas

### Error de Conexión a Base de Datos

Verifica que PostgreSQL esté ejecutándose:
```bash
psql -U postgres
```

### Error de Playwright

Reinstala los navegadores:
```bash
npx playwright install --force
```

### Error de OpenAI API

Verifica que tu API key sea válida y tenga créditos disponibles.

## Próximos Pasos

- [Primeros Pasos](Getting-Started)
- [Gestión de Proyectos](Project-Management)
