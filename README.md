# Optima Visits

Server-side Next.js application for managing business visits. Provides REST API endpoints for authentication, user management, and visit tracking with role-based access control.

## Tech Stack

- **Next.js 15** (App Router)
- **Auth.js v5** (next-auth 5 beta) with credentials provider
- **Prisma 6** ORM
- **PostgreSQL** (Neon)
- **TypeScript 5**
- **Jest 30** for testing

## Project Structure

```
optima-visits/
├── auth.ts                          # Auth.js configuration (credentials provider, JWT callbacks)
├── jest.config.ts                   # Jest configuration
├── prisma/
│   ├── schema.prisma                # Database schema (User, Visit, Account, Session)
│   ├── seed.ts                      # Database seeder (admin + user accounts)
│   ├── migrations/                  # Prisma migration files
│   └── docs/                        # Database documentation
│       ├── migrations.md
│       └── connection-pooling.md
├── src/
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client singleton
│   │   └── get-user-from-session.ts # Shared auth helper
│   └── app/api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts   # Auth.js sign-in/sign-out handlers
│       │   ├── me/route.ts              # GET  /api/auth/me
│       │   └── change-password/route.ts # PATCH /api/auth/change-password
│       └── visits/
│           ├── route.ts                 # GET  /api/visits
│           └── [id]/route.ts            # PATCH /api/visits/:id
└── __tests__/
    ├── helpers/                     # Shared fixtures and request builder
    ├── unit/                        # Unit tests (auth, session helper)
    ├── api/                         # API route tests
    └── docs/testing.md              # Testing guide
```

## Prerequisites

- Node.js 20+
- PostgreSQL database (e.g., [Neon](https://neon.tech))

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Pooled connection URL (used at runtime)
POSTGRES_PRISMA_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require

# Direct connection URL (used for migrations)
POSTGRES_URL_NON_POOLING=postgresql://user:password@host.region.aws.neon.tech/dbname?sslmode=require

# Auth.js secret — generate with: openssl rand -base64 33
AUTH_SECRET=your-secret-here
```

If using Neon, the pooled URL contains `-pooler` in the hostname, and the non-pooling URL does not. See `prisma/docs/connection-pooling.md` for details.

### 3. Run database migrations

```bash
npx prisma migrate deploy
```

### 4. Seed the database (optional)

The seed file creates two users. To use it, first uncomment the `await seedUsers()` line in `prisma/seed.ts`, then run:

```bash
npx prisma db seed
```

Default seeded accounts:

| Email            | Password        | Role  |
|------------------|-----------------|-------|
| admin@optima.rs  | MojaLozinka123! | ADMIN |
| user@optima.rs   | MojaLozinka123! | USER  |

### 5. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint                    | Description             | Auth Required |
|--------|-----------------------------|-------------------------|---------------|
| POST   | /api/auth/callback/credentials | Sign in (handled by Auth.js) | No |
| GET    | /api/auth/me                | Get current user profile | Yes |
| PATCH  | /api/auth/change-password   | Change password          | Yes |

There is no sign-up endpoint. Users are created via the database seed or directly in the database.

### Visits

| Method | Endpoint           | Description    | Auth Required |
|--------|--------------------|----------------|---------------|
| GET    | /api/visits        | List visits    | Yes           |
| PATCH  | /api/visits/:id    | Update a visit | Yes           |

### Role-Based Access

- **ADMIN** — can view and update all visits without restrictions
- **USER** — can only view their own visits. Can only update visits that are:
  - owned by them
  - in `PENDING` status
  - with `plannedVisitDate` not in the future (null date is allowed)

### Query Parameters for GET /api/visits

| Parameter         | Description                              |
|-------------------|------------------------------------------|
| status            | Filter by visit status (PENDING, CANCELED, DONE) |
| plannedVisitDate  | Filter by date (contains, case-insensitive)       |
| businessPartner   | Filter by business partner (contains, case-insensitive) |
| page              | Page number (default: 1, page size: 10)  |

## Testing

```bash
# Run all tests (49 tests)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

See `__tests__/docs/testing.md` for a detailed testing guide including how to write new tests and the mocking strategy.

## Database Migrations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Deploy migrations to production
npx prisma migrate deploy
```

See `prisma/docs/migrations.md` for a detailed guide.
