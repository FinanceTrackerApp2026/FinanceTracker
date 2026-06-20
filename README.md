# FinanceTracker

A Finance Tracker prototype with a Go backend and PostgreSQL database.

## Current Status

- Backend scaffolded with `gqlgen` and a GraphQL server in `backend/server.go`
- PostgreSQL database configured via `docker-compose.yml`
- `database/init.sql` creates a sample `contacts` table
- Environment loading implemented in `backend/config/config.go`
- GraphQL schema placeholder defined in `backend/graph/schema.graphqls`
- Resolver dependency injection stub in `backend/graph/resolver.go`

## Project Structure

- `backend/` - Go server code and GraphQL schema
- `database/` - SQL initialization script
- `docker-compose.yml` - PostgreSQL service definition

## Run Locally

1. Create a `.env` file with PostgreSQL credentials used by Docker Compose.
2. Start the database:

```bash
docker compose up -d
```

3. Run the backend from the repo root:

```bash
go run ./backend
```

4. Open GraphQL Playground:

```text
http://localhost:8080/
```

## Notes

- The current GraphQL schema is an example todo/user schema and can be replaced with finance-specific types.
- The backend currently starts a GraphQL playground and exposes `/query`.
- Further development should add actual finance models, authentication, and business logic.
