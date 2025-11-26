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

## 🐳 Production Deployment (VPS)

This application is optimized for deployment on a VPS using Docker and Docker Compose, with Nginx as a reverse proxy.

### 1. Prerequisites

- Docker & Docker Compose installed on the VPS.
- A domain pointing to your VPS IP (e.g., `qamaster.labshub.cc`).

### 2. Setup

1.  **Clone the repository:**
    ```bash
    cd /opt
    git clone <repository-url> docker-qa-master
    cd docker-qa-master
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file based on `env.example`:
    ```bash
    cp env.example .env
    nano .env
    ```
    
    Ensure the following variables are set:
    ```env
    # Database (Internal Docker Network)
    POSTGRES_USER=qa_user
    POSTGRES_PASSWORD=your_secure_password
    POSTGRES_DB=qa_db
    
    # Application
    DATABASE_URL="postgresql://qa_user:your_secure_password@postgres:5432/qa_db?schema=public"
    JWT_SECRET="generate-a-secure-random-string-min-32-chars"
    APP_PORT=3001
    NODE_ENV=production
    ```

3.  **Nginx Configuration:**
    The project includes an `nginx.conf` file. You can use it directly or include it in your main Nginx configuration.
    
    Example `nginx.conf` provided in repo proxies `qamaster.labshub.cc` to `http://localhost:3001`.

### 3. Deployment

1.  **Build and Start Containers:**
    ```bash
    docker-compose up -d --build
    ```

2.  **Run Migrations:**
    The application container includes the Prisma CLI. Run migrations manually for the first time:
    ```bash
    docker-compose exec app npx prisma migrate deploy
    ```

3.  **Create Admin User:**
    Access the application at your domain (e.g., `https://qamaster.labshub.cc`).
    The first user registered will automatically be assigned the **ADMIN** role.

### 4. Updates

To update the application after pushing changes to the repository:

```bash
git pull origin main
docker-compose build --no-cache app
docker-compose up -d
```

## 📝 License

MIT License

Copyright (c) 2025 Jorge Aymar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
