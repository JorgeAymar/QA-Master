# Installation and Setup

This guide will help you set up QA Master in your local environment.

## Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher
- **npm** or **yarn**
- **OpenAI Account**: To get an API key

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

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/qa_master"

# OpenAI
OPENAI_API_KEY="sk-..."

# JWT Secret (generate a random one)
JWT_SECRET="your-super-secure-secret-here"
```

> **Note**: Never share your `OPENAI_API_KEY` or upload it to GitHub.

### 4. Configure Database

```bash
# Create tables
npx prisma db push

# (Optional) Populate with seed data
npx prisma db seed
```

### 5. Install Playwright

```bash
npx playwright install
```

## Run in Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Create Your First Account

1. Navigate to `http://localhost:3000/signup`
2. Create an account with your email and password
3. Log in at `/login`

## Verify Installation

To verify that everything is working correctly:

1. Create a test project
2. Add a simple user story
3. Run a test

If you see results and screenshots, everything is working! 🎉

## Troubleshooting

### Database Connection Error

Verify that PostgreSQL is running:
```bash
psql -U postgres
```

### Playwright Error

Reinstall browsers:
```bash
npx playwright install --force
```

### OpenAI API Error

Verify that your API key is valid and has available credits.

## Next Steps

- [Getting Started](Getting-Started)
- [Project Management](Project-Management)
