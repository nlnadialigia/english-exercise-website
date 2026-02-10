# English Exercise Platform

A complete platform for creating, managing, and solving English exercises, built with Next.js, Prisma, and PostgreSQL.

> 🇧🇷 [Versão em Português](docs/pt-br/README.md)

## 🚀 Features

### For Teachers
- **Exercise Management**: Create, edit, publish, and view exercises
- **Question Types**: Multiple choice, true/false, fill in the blanks
- **Student Management**: Add, edit, and track student progress
- **Detailed Reports**: View submissions and student performance
- **PDF Export**: Generate PDF reports using react-pdf
- **Email Sending**: Send results via email using MailerSend
- **Complete Dashboard**: Overview of exercises, submissions, and students

### For Students
- **Exercise Solving**: Intuitive interface to answer exercises
- **Attempt History**: Track all attempts made
- **Detailed Results**: View complete correction with explanations
- **Progress**: View open and completed exercises
- **Multiple Attempts**: Ability to redo exercises

### For Administrators
- **User Management**: Create and manage teachers and students
- **Overview**: Access to all dashboards in read-only mode
- **Full Control**: Manage the entire platform

## 🛠️ Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom system with bcryptjs
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Tables**: AG Grid
- **PDF**: @react-pdf/renderer
- **Email**: MailerSend
- **Forms**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd english-exercise-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the database

#### Option A: Local PostgreSQL

1. **Install PostgreSQL**
   - **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
   - **macOS**: `brew install postgresql`
   - **Windows**: Download from [official site](https://www.postgresql.org/download/)

2. **Start PostgreSQL service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql
   ```

3. **Create the database**
   ```bash
   # Access PostgreSQL
   sudo -u postgres psql
   
   # Create database
   CREATE DATABASE english_exercises;
   
   # Create user (optional)
   CREATE USER english_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE english_exercises TO english_user;
   
   # Exit PostgreSQL
   \q
   ```

#### Option B: Docker (Recommended)
```bash
# Create and start PostgreSQL container
docker run --name postgres-english \
  -e POSTGRES_DB=english_exercises \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Check if running
docker ps
```

#### Option C: Cloud Services
- **Supabase**: Create a free project at [supabase.com](https://supabase.com)
- **Railway**: Create a PostgreSQL database at [railway.app](https://railway.app)
- **Neon**: Create a serverless database at [neon.tech](https://neon.tech)

### 4. Configure environment variables
```bash
cp .env.example .env
```

Edit the `.env` file with your settings.

### 5. Run database migrations
```bash
npm run migrate
```

### 6. (Optional) Run seed for initial data
```bash
npm run seed
```

### 7. Start development server
```bash
npm run dev
```

Access http://localhost:3000

## 🗄️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Generate production build
- `npm run start` - Start production server
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run seed` - Run database seed

## 🔧 Database Configuration

### Main Structure

The database has the following main entities:

- **Users**: Users (admin, teacher, student)
- **Exercises**: Exercises created by teachers
- **Submissions**: Student submissions/attempts
- **TeacherStudent**: Teacher-student relationship

### Migrations

To create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

To apply migrations in production:
```bash
npm run deploy
```

## 🔐 Authentication

The system has three types of users:

- **Admin**: Full platform access
- **Teacher**: Can create exercises and manage students
- **Student**: Can solve exercises

### Default Users (after seed)
- Admin: admin@admin.com / admin

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboards by role
│   └── login/             # Login page
├── components/            # React Components
│   ├── ui/               # Base components (shadcn/ui)
│   ├── emails/           # Email templates
│   ├── pdf/              # PDF templates
│   └── teacher/          # Teacher-specific components
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema and migrations
└── docs/                 # Documentation
```

## 🚀 Deploy

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Set up a PostgreSQL database (Supabase, Railway, etc.)
4. Automatic deployment

### Docker
```bash
# Build image
docker build -t english-exercise-platform .

# Run
docker run -p 3000:3000 english-exercise-platform
```

## 📚 Additional Documentation

- [Application Overview](docs/application-overview.md)
- [Logger System](docs/logger-examples.md)
- [Magic Link System](docs/magic-link-system.md)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)