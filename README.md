# FinanceTracker

FinanceTracker is a local finance management app with a Go GraphQL backend, PostgreSQL database, and React/Vite frontend.

## Features

- Contact directory with create and edit flows
- Auto-generated contact codes
- Contact status management with `ACTIVE` and `INACTIVE`
- Loan tracking by contact
- Payment records for loans
- Dashboard and monthly cash flow views
- GraphQL Playground for running queries and mutations manually

## Project Structure

- `backend/` - Go backend, GraphQL schema, resolvers, services, and PostgreSQL repositories
- `frontend/` - React frontend built with Vite, Apollo Client, and Tailwind CSS
- `database/` - PostgreSQL initialization script
- `.env.example` - Example local environment variables

## Prerequisites

- Go
- Node.js and npm
- PostgreSQL running locally

## Environment

Create a `.env` file in the project root. You can copy the example values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Run Locally

Make sure PostgreSQL is running and the values in `.env` match your local database.

If this is a fresh database, run the SQL in `database/init.sql` to create the required tables.

Start the backend:

```bash
cd backend
go run .
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Frontend: `http://localhost:5173`
- GraphQL Playground: `http://localhost:8080/`
- GraphQL endpoint: `http://localhost:8080/query`

## Useful Commands

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

## Contacts Module

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

## Notes

- The frontend expects the backend GraphQL endpoint from `VITE_GRAPHQL_URL`.
- The backend loads environment variables from `.env`.
