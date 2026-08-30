# FinanceTracker

FinanceTracker is a local finance management app with a Go GraphQL backend, PostgreSQL database, and React/Vite frontend.

## Features

- Contact directory with create and edit flows
- Auto-generated contact codes
- Contact status management with `ACTIVE` and `INACTIVE`
- Loan tracking by contact
- Payment records for loans
- Dashboard and monthly cash flow views
- User registration, login, JWT-based session handling, and ownership-aware GraphQL access
- Versioned PostgreSQL migrations for setup and upgrades

## Project Structure

- `backend/` - Go backend, GraphQL schema, resolvers, services, repositories, and migration commands
- `frontend/` - React frontend built with Vite, Apollo Client, and React Router
- `database/` - Historical SQL reference scripts, including the original manual setup baseline
- `migrations/` - Versioned database migrations used by the Go migration tool
- `.env.example` - Safe local environment template

## Prerequisites

- Go 1.24+
- Node.js and npm
- PostgreSQL running locally

## Environment configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=finance_tracker
DB_SSLMODE=disable
JWT_SECRET=replace_with_a_secure_32_character_minimum_secret
INITIAL_OWNER_EMAIL=admin@example.com
INITIAL_OWNER_FULL_NAME=Finance Tracker Admin
INITIAL_OWNER_PASSWORD=change_this_admin_password
VITE_GRAPHQL_URL=http://localhost:8080/query
MIGRATIONS_DIR=./migrations
```

- Do not commit real secrets or production credentials.
- `DB_*` values are used by the Go database connection and migration tooling.
- `JWT_SECRET` must be at least 32 characters long.
- `INITIAL_OWNER_*` is only used when assigning legacy data to a starter user.

## Database setup

The project uses `golang-migrate` with SQL migrations in `migrations/`.

### Fresh database setup

Create a database and run all migrations:

```bash
createdb finance_tracker
cd backend
go run ./cmd/migrate up
```

### Existing database migration

For an existing PostgreSQL database, do not drop tables or recreate the database. Run the migrations in place:

```bash
grep -v '^#' .env > /tmp/finance-tracker.env
cd backend
go run ./cmd/migrate status
go run ./cmd/migrate up
```

If your database already contains data and contacts do not yet have an owner, assign the initial user before continuing:

```bash
INITIAL_OWNER_EMAIL=admin@example.com \
INITIAL_OWNER_FULL_NAME="Finance Tracker Admin" \
INITIAL_OWNER_PASSWORD="change_this_admin_password" \
cd backend && go run ./cmd/migrate assign-owner
```

This is the safe strategy used for legacy data: the existing contacts are assigned to one controlled admin user, and all loans and payments then inherit that ownership through the contact relationship.

## Migration commands

```bash
cd backend

go run ./cmd/migrate status

go run ./cmd/migrate up

go run ./cmd/migrate down

go run ./cmd/migrate force 5
```

- `up` applies all pending migrations.
- `down` rolls back the latest migration.
- `status` prints the current migration version and whether the database is dirty.
- `force` can recover a migration state when required during maintenance.

## Authentication and ownership

The backend uses JWTs for authentication. The user ID is loaded from the validated token and stored in the request context; all data access is then restricted to that user through ownership-aware repository queries.

The ownership model is:

- User → Contact → Loan → Payment

This means a logged-in user can only list, update, and delete data that belongs to their account. The repository layer enforces that check, and the resolver layer never trusts a client-provided user ID.

## Run locally

Start PostgreSQL and ensure the `.env` values match your local instance.

Backend:

```bash
cd backend
go run .
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- GraphQL Playground: `http://localhost:8080/`
- GraphQL endpoint: `http://localhost:8080/query`

## Register / login flow

- Public routes: `/login`, `/register`
- Protected routes: `/dashboard`, `/contacts`, `/loans`, `/cash-flow`

Users can create an account, log in, and then access only their own financial data. The frontend restores the session from the token stored in `sessionStorage` and redirects unauthenticated users to login.

## Useful commands

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend production build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
go test ./...
```

## Contacts module

Contacts support:

- Creating contacts without manually entering a contact code
- Backend-generated contact codes
- Editing contact details
- Switching status between `ACTIVE` and `INACTIVE`
- Confirmation before changing status
- Success and error messages in the UI

The status change uses the existing GraphQL mutation:

```graphql
mutation ChangeContactStatus($input: ChangeContactStatusInput!) {
  changeContactStatus(input: $input) {
    id
    status
    updatedAt
  }
}
```

## Development workflow

1. Copy `.env.example` to `.env` and set local secrets.
2. Ensure PostgreSQL is running.
3. Run `cd backend && go run ./cmd/migrate up`.
4. Start backend with `cd backend && go run .`.
5. Start frontend with `cd frontend && npm run dev`.
6. Register/login and work only within the authenticated user scope.
7. Before deploying or sharing data, review migration safety and keep the historical `database/init.sql` as a reference baseline.

## Notes

- The frontend expects the backend GraphQL endpoint from `VITE_GRAPHQL_URL`.
- The backend loads environment variables from the project root `.env` file.
- The database setup is intentionally non-destructive: migrations are applied to the existing schema without dropping historical tables or deleting data.
