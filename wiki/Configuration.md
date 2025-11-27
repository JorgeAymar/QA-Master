# Configuration

This guide covers all configuration options for QA Master.

## Environment Variables

QA Master uses environment variables for configuration. Create a `.env` file in the root directory.

### Required Variables

#### Database Configuration
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
```

**Example for local development:**
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/qa_db?schema=public"
```

**Example for Docker:**
```env
DATABASE_URL="postgresql://qa_user:secure_password@postgres:5432/qa_db?schema=public"
```

#### Authentication
```env
JWT_SECRET="your-secure-random-string-minimum-32-characters"
```

> ⚠️ **Security**: Generate a strong random string for JWT_SECRET. Never use default values in production.

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### OpenAI API
```env
OPENAI_API_KEY="sk-proj-..."
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### Optional Variables

#### Email Configuration (for user invitations)
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

> 📧 **Note**: Email configuration is optional. If not configured, user invitation features will be disabled.

#### Application Settings
```env
NODE_ENV="development"  # or "production"
APP_PORT="3001"         # Port for the application (default: 3000)
```

## Database Setup

### PostgreSQL with Docker

The easiest way to run PostgreSQL locally is using Docker Compose:

```bash
docker-compose up -d
```

This starts a PostgreSQL container with the configuration from `docker-compose.yml`.

### Manual PostgreSQL Setup

If you prefer to install PostgreSQL manually:

1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE qa_db;
   CREATE USER qa_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE qa_db TO qa_user;
   ```
3. Update your `DATABASE_URL` accordingly

### Initialize Database Schema

After configuring the database connection:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy
```

## User Roles

QA Master has three user roles:

### ADMIN
- Full system access
- Can manage all projects
- Can access admin panel
- First registered user becomes ADMIN automatically

### USER (Default)
- Can create projects
- Can be added to other projects
- Access based on project membership

### Project-Level Roles

Within each project, users have specific roles:

- **OWNER**: Full control, can delete project, manage members
- **FULL** (Editor): Can edit stories, run tests, view reports
- **READ** (Viewer): Can only view project and test results

## Language Configuration

Users can set their preferred language in their profile:

- 🇪🇸 Spanish (Español)
- 🇬🇧 English
- 🇧🇷 Portuguese (Português)

The interface will automatically display in the selected language.

## OpenAI Configuration

### Model Selection

QA Master uses GPT-4 for test analysis. The model is configured in the codebase:

```typescript
// Default configuration
model: "gpt-4"
```

### Rate Limits

Be aware of OpenAI API rate limits:
- Free tier: Limited requests per minute
- Paid tier: Higher limits based on your plan

### Cost Management

Each test execution makes API calls to OpenAI. Monitor your usage:
- Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up billing alerts
- Consider implementing rate limiting for large test suites

## Security Best Practices

### Environment Variables

✅ **DO:**
- Use strong, random values for `JWT_SECRET`
- Keep `.env` file in `.gitignore`
- Use different credentials for development and production
- Rotate secrets regularly

❌ **DON'T:**
- Commit `.env` files to version control
- Share credentials in documentation
- Use default or weak passwords
- Reuse secrets across environments

### Database Security

- Use strong database passwords
- Limit database access to application only
- Enable SSL for database connections in production
- Regular backups

### API Keys

- Never expose API keys in client-side code
- Use environment variables only
- Rotate keys if compromised
- Monitor API usage for anomalies

## Troubleshooting Configuration

### Database Connection Issues

**Error:** `Can't reach database server`

**Solutions:**
1. Verify PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL format
3. Ensure database credentials are correct
4. Check network connectivity

### JWT Authentication Issues

**Error:** `Invalid token`

**Solutions:**
1. Verify JWT_SECRET is set correctly
2. Clear browser cookies
3. Check token expiration settings

### OpenAI API Issues

**Error:** `Invalid API key`

**Solutions:**
1. Verify OPENAI_API_KEY is correct
2. Check API key hasn't been revoked
3. Ensure billing is set up on OpenAI account

---

*For more help, see [Troubleshooting](Troubleshooting) guide.*
