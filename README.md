# api-contact

RESTful API for managing contacts and categories, with JWT authentication and multi-tenant isolation per user.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM + postgres.js
- **Validation:** Zod
- **Auth:** JWT (access + refresh token rotation)
- **Logs:** Pino

## Requirements

- Node.js 20+
- PostgreSQL 16+

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/api_contact
JWT_SECRET=<generate with: openssl rand -base64 64>
JWT_ISSUER=api-contact
JWT_AUDIENCE=api-contact-clients
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
TRUST_PROXY=false
LOG_LEVEL=info
JWT_REFRESH_EXPIRY_DAYS=7
```

**3. Run database migrations**

```bash
npm run db:migrate
```

**4. Start the server**

```bash
npm run dev
```

## Docker

Start a local PostgreSQL instance:

```bash
docker compose up -d
```

Build and run the full application:

```bash
docker build -t api-contact .
docker run -p 3000:3000 --env-file .env api-contact
```

## API Routes

### Health

| Method | Route |
|--------|-------|
| GET | `/health` |

### Auth

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/v1/auth/register` | — |
| POST | `/api/v1/auth/login` | — |
| POST | `/api/v1/auth/refresh` | — |
| POST | `/api/v1/auth/logout` | Bearer token |

### Contacts

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/v1/contacts` | Bearer token |
| GET | `/api/v1/contacts` | Bearer token |
| GET | `/api/v1/contacts/:id` | Bearer token |
| PATCH | `/api/v1/contacts/:id` | Bearer token |
| DELETE | `/api/v1/contacts/:id` | Bearer token |

### Categories

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/v1/categories` | Bearer token |
| GET | `/api/v1/categories` | Bearer token |
| GET | `/api/v1/categories/:id` | Bearer token |
| PATCH | `/api/v1/categories/:id` | Bearer token |
| DELETE | `/api/v1/categories/:id` | Bearer token |

## Authentication Flow

1. Register or login to receive an `access_token` (15 min) and a `refresh_token` (7 days)
2. Send the access token in the `Authorization: Bearer <token>` header on protected routes
3. Use `POST /api/v1/auth/refresh` with the refresh token to get a new token pair
4. Refresh tokens are rotated on every use — reusing an old token invalidates the entire token family (theft detection)

## Scripts

```bash
npm run dev            # Start in development mode (ts-node)
npm run build          # Compile TypeScript
npm start              # Start compiled output
npm test               # Run unit tests (Vitest)
npm run test:coverage  # Run tests with coverage report
npm run lint           # Run ESLint
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Apply migrations
npm run db:studio      # Open Drizzle Studio
```

## CI

GitHub Actions pipeline with 4 parallel jobs: `lint`, `build`, `security` (npm audit), and `test` (with PostgreSQL 16). Coverage report is published as an artifact on each run.
