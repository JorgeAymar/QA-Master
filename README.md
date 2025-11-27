# QA Master - Automated Web Testing Platform

![Version](https://img.shields.io/badge/version-0.6.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

QA Master is a comprehensive web application designed to streamline the Quality Assurance process for web development projects. It allows teams to manage projects, define user stories grouped by features, and run automated validation tests against live URLs using AI-powered testing.

## ✨ Key Features

### 📊 Project Management
- Create and manage multiple projects with specific base URLs
- GitHub repository integration
- Project sharing with role-based access control (Owner, Editor, Viewer)
- Project duplication for quick setup

### 📝 User Stories & Features
- Define user stories with acceptance criteria
- Group stories into features for better organization
- Drag-and-drop story organization
- Import acceptance criteria from text files (.txt, .md)
- Attach reference documentation via URLs

### 🤖 AI-Powered Automated Testing
- Intelligent test execution using OpenAI GPT-4
- Visual validation with Playwright browser automation
- Screenshot capture for failed tests
- Detailed reasoning logs for each test result
- Test history tracking with timestamps

### 📈 Dashboards & Reporting
- **Global Dashboard**: Overview of all projects and aggregate metrics
- **Project Dashboard**: Detailed view with statistics (Total, Passed, Failed, Untested)
- **Test Reports**: Comprehensive test execution reports
- Real-time test status indicators

### 👥 Team Collaboration
- Multi-user support with role-based permissions
- Project sharing with granular access control
- User profile management
- Activity tracking

### 🌐 Internationalization
- Multi-language support (Spanish, English, Portuguese)
- User-specific language preferences

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Custom JWT with HTTP-only cookies
- **AI**: [OpenAI GPT-4](https://openai.com/)
- **Browser Automation**: [Playwright](https://playwright.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- Docker and Docker Compose (for database)
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JorgeAymar/QA-Master.git
   cd QA-Master
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   docker-compose up -d
   ```

4. **Configure Environment Variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
   
   # Authentication
   JWT_SECRET="your-secure-random-string-min-32-characters"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   
   # Email (Optional - for user invitations)
   EMAIL_HOST="smtp.example.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@example.com"
   EMAIL_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@example.com"
   
   # Application
   NODE_ENV="development"
   ```

5. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First User Setup

The first user to register will automatically be assigned the **ADMIN** role with full system access.

## 📂 Project Structure

```
qa-app/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── scripts/             # Utility scripts
├── src/
│   ├── app/
│   │   ├── (dashboard)/ # Authenticated routes
│   │   ├── actions/     # Server actions
│   │   ├── login/       # Login page
│   │   └── signup/      # Signup page
│   ├── components/      # React components
│   │   ├── features/    # Feature-related components
│   │   ├── layout/      # Layout components
│   │   ├── projects/    # Project components
│   │   ├── stories/     # Story components
│   │   └── ui/          # UI components
│   ├── context/         # React contexts
│   └── lib/             # Utilities and helpers
└── package.json
```

## 🧪 Running Tests

### Automated QA Tests

1. Navigate to a Project
2. Click **"Run QA Analysis"** on a story or feature
3. View real-time test execution progress
4. Review results with screenshots and detailed logs

### Test Results

- ✅ **PASS**: Story meets all acceptance criteria
- ❌ **FAIL**: Story fails validation with detailed reasoning
- ⏱️ **UNTESTED**: No tests have been run yet

## 🚀 Deployment

### Docker Production Deployment

1. **Configure production environment:**
   ```bash
   cp env.example .env
   # Edit .env with production values
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up -d --build
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Access your application:**
   Navigate to your configured domain

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@postgres:5432/DATABASE_NAME?schema=public"
JWT_SECRET="generate-secure-random-string-min-32-chars"
OPENAI_API_KEY="your-production-openai-key"
APP_PORT=3001
```

## 🔒 Security Best Practices

- Never commit `.env` files to version control
- Use strong, randomly generated JWT secrets (minimum 32 characters)
- Rotate API keys regularly
- Use environment-specific credentials
- Enable HTTPS in production
- Regularly update dependencies

## 📖 Documentation

For detailed documentation, please visit the [Wiki](https://github.com/JorgeAymar/QA-Master/wiki).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Jorge Aymar

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- UI components inspired by modern design principles
- Icons by [Lucide](https://lucide.dev/)

---

**Version:** 0.6.0  
**Last Updated:** November 2025
