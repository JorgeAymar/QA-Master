# QA Master - Web QA Automation Tool

QA Master is a comprehensive web application designed to streamline the Quality Assurance process for web development projects. It allows teams to manage projects, define user stories grouped by features, and run automated validation tests against live URLs.

## 🚀 Features

- **Project Management**: Create and manage multiple projects with specific base URLs.
- **User Stories & Features**: 
  - Define user stories with specific acceptance criteria.
  - Group stories into "Features" for better organization.
- **Automated Testing Engine**: 
  - Runs tests against project URLs.
  - Validates content presence based on story keywords and acceptance criteria.
  - Generates pass/fail results with detailed logs.
- **Dashboards**:
  - **Global Dashboard**: Overview of all projects and aggregate metrics.
  - **Project Dashboard**: Detailed view of project progress, feature breakdown, and test history.
- **Reporting**: Generate and print detailed test reports.
- **Authentication**: Secure user access with Login/Signup functionality (JWT-based).
- **User Profile**: Manage user session and details.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Custom JWT with HTTP-only cookies (Jose + Bcrypt)
- **Containerization**: Docker support included

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Docker (for the database)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd qa-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    Ensure Docker is running, then start the PostgreSQL container:
    ```bash
    docker-compose up -d
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (or use the existing one) with:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/qa_db?schema=public"
    JWT_SECRET="your-secure-secret-key"
    ```

5.  **Initialize the Database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

6.  **Seed Initial Data (Optional):**
    To create a demo user (`jorge.s.aymar@gmail.com` / `demo100`):
    ```bash
    npx ts-node prisma/seed.ts
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Project Structure

- `src/app/(dashboard)`: Authenticated routes (Projects, Profile, Dashboard).
- `src/app/login` & `src/app/signup`: Public authentication routes.
- `src/app/actions`: Server Actions for backend logic.
- `src/lib`: Utilities (Database, Session, Auth).
- `src/components`: Reusable UI components.
- `prisma`: Database schema and seed scripts.

## 🧪 Running Tests

To run the internal QA tests defined in your projects:
1. Navigate to a Project.
2. Click **"Run Tests"**.
3. View results in the dashboard or the **"Report"** page.

## 📝 License

This project is proprietary and confidential.
