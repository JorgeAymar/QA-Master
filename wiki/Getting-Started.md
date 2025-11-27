# Getting Started

This guide will help you set up and start using QA Master.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ or 20+ ([Download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JorgeAymar/QA-Master.git
cd QA-Master
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Playwright, and other dependencies.

### 3. Set Up the Database

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

Verify the database is running:

```bash
docker-compose ps
```

You should see the `postgres` container running.

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://qa_user:your_password@localhost:5432/qa_db?schema=public"

# Authentication
JWT_SECRET="generate-a-secure-random-string-min-32-chars"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Application
NODE_ENV="development"
```

> 💡 **Tip**: Generate a secure JWT_SECRET using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 5. Initialize the Database

Generate Prisma Client and create database tables:

```bash
npx prisma generate
npx prisma db push
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## First Steps

### 1. Create Your Account

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click **"Sign Up"**
3. Fill in your details:
   - Name
   - Email
   - Password
4. Click **"Create Account"**

> 🎉 **First User Bonus**: The first user to register automatically becomes an ADMIN with full system access!

### 2. Set Your Language Preference

1. Click on your profile menu (top-right corner)
2. Select **"Profile"**
3. Choose your preferred language:
   - 🇪🇸 Español
   - 🇬🇧 English
   - 🇧🇷 Português

### 3. Create Your First Project

1. Click **"Projects"** in the sidebar
2. Click **"New Project"** button
3. Fill in the project details:
   - **Name**: e.g., "My Web App"
   - **Description**: Brief description of your project
   - **Base URL**: Your application URL (e.g., `https://myapp.com`)
   - **GitHub Repository** (optional): Link to your repo

4. Click **"Create Project"**

### 4. Add Features

Features help organize your user stories:

1. In your project, find the **"Features"** section
2. Enter a feature name (e.g., "User Authentication")
3. Click **"Create"**

### 5. Create User Stories

1. Click **"+ Add Story"** in a feature column
2. Fill in the story details:
   - **Title**: e.g., "User can log in"
   - **Acceptance Criteria**: Define what makes this story complete
   - **Document URL** (optional): Link to specifications

3. Click **"Create Story"**

### 6. Run Your First Test

1. Click the **"Run QA Analysis"** button on a story
2. Watch the real-time progress indicator
3. View the test results:
   - ✅ **PASS**: Story meets criteria
   - ❌ **FAIL**: Story needs attention
   - View screenshots and detailed logs

## Understanding the Dashboard

### Project Dashboard

The project dashboard shows:

- **Total Stories**: All user stories in the project
- **Passed**: Stories that passed testing
- **Failed**: Stories that failed validation
- **Untested**: Stories not yet tested

### Story Cards

Each story card displays:

- Story title and description
- Current status indicator (green/red/gray)
- Last test execution details
- Quick actions (edit, test, history)

### Test History

Click the status badge on any story to view:

- All previous test executions
- Timestamps and results
- Screenshots (for failures)
- Detailed reasoning logs

## Next Steps

Now that you're set up, explore these features:

- 📊 [Project Management](Project-Management) - Organize your projects
- 📝 [User Stories & Features](User-Stories-and-Features) - Create effective stories
- 🤖 [Running Tests](Running-Tests) - Automate your QA process
- 👥 [Team Collaboration](Team-Collaboration) - Share projects with your team

## Common Issues

### Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solution**:
```bash
# Check if Docker is running
docker ps

# Restart the database
docker-compose down
docker-compose up -d
```

### OpenAI API Errors

**Problem**: Tests fail with API errors

**Solution**:
1. Verify your API key is correct in `.env`
2. Check your OpenAI account has credits
3. Ensure you're not hitting rate limits

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Getting Help

- 📖 Check the [Wiki](Home) for detailed documentation
- 🐛 [Report issues](https://github.com/JorgeAymar/QA-Master/issues) on GitHub
- 💬 Review [Troubleshooting](Troubleshooting) guide

---

*Ready to dive deeper? Check out the [User Guide](User-Guide) for advanced features!*
