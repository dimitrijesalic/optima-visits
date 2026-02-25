# Neon Connection Pooling: Pooled vs Direct URLs

## The Two URLs

When using Neon with Prisma, you configure two different connection strings:

```env
# Pooled connection (via PgBouncer)
POSTGRES_PRISMA_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Direct connection (no pooler)
POSTGRES_URL_NON_POOLING=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

The only visible difference is `-pooler` in the hostname.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")       // pooled — used at runtime
  directUrl = env("POSTGRES_URL_NON_POOLING")  // direct — used by Prisma CLI
}
```

---

## What is Connection Pooling?

A database can only handle a limited number of simultaneous connections. Each connection consumes memory and resources on the database server.

**Without pooling:** Every serverless function invocation (every API request on Vercel) opens a new direct connection to the database. In a serverless environment, this can quickly exhaust the connection limit because:
- Functions spin up and down constantly
- Multiple functions run in parallel
- Each function opens its own connection
- Connections may not close immediately when the function ends

**With pooling (PgBouncer):** A connection pooler sits between your app and the database. It maintains a pool of reusable connections and distributes them to incoming requests. Instead of 100 serverless functions each opening their own connection, they all share a pool of, say, 20 connections.

```
Without pooling:
  Function 1 ──→ DB Connection 1 ──→ PostgreSQL
  Function 2 ──→ DB Connection 2 ──→ PostgreSQL
  Function 3 ──→ DB Connection 3 ──→ PostgreSQL
  ...
  Function 100 ──→ DB Connection 100 ──→ PostgreSQL  ← connection limit hit!

With pooling:
  Function 1 ──→                              ──→ DB Connection 1
  Function 2 ──→  PgBouncer (connection pool)  ──→ DB Connection 2  ──→ PostgreSQL
  Function 3 ──→                              ──→ DB Connection 3
  ...
  Function 100 ──→  (waits for available connection)
```

---

## When to Use Each URL

### Pooled URL (`POSTGRES_PRISMA_URL`)

**Used for: Application runtime queries (reading/writing data)**

- All Prisma Client queries (`findMany`, `create`, `update`, `delete`, etc.)
- API route handlers
- Server components
- Any code that runs during a user request

**Why:** Serverless functions on Vercel are ephemeral — they start, handle a request, and may shut down. Without pooling, each invocation opens a new connection. Under load (many concurrent requests), you'd quickly exceed Neon's connection limit. The pooler prevents this.

### Direct URL (`POSTGRES_URL_NON_POOLING`)

**Used for: Prisma CLI operations (migrations, schema push, introspection)**

- `npx prisma migrate dev`
- `npx prisma migrate deploy`
- `npx prisma db push`
- `npx prisma db pull`
- `npx prisma db seed`

**Why:** Migrations require features that PgBouncer's transaction mode doesn't support:
- **Advisory locks** — Prisma uses these to prevent concurrent migrations. PgBouncer in transaction mode doesn't support session-level advisory locks.
- **Temporary tables / prepared statements** — Some migration operations use features that require a persistent, dedicated connection.
- **Schema changes (DDL)** — `CREATE TABLE`, `ALTER TABLE`, etc. are safer over a direct connection where there's no risk of the pooler reassigning the connection mid-operation.

The `directUrl` in `schema.prisma` tells Prisma: "Use the pooled URL for runtime queries, but switch to the direct URL when running CLI commands."

---

## What Happens If You Use the Wrong One?

### Using direct URL for runtime (no pooler)
- Works fine at low traffic
- Under load, connections pile up and you'll get errors like:
  ```
  Error: too many connections for role "neondb_owner"
  ```
- Each serverless function holds a connection until it finishes, and Neon's free tier allows only ~100 concurrent connections

### Using pooled URL for migrations
- Migrations may fail with errors like:
  ```
  Error: prepared statement "s0" already exists
  ```
  or
  ```
  Error: advisory lock acquisition timed out
  ```
- PgBouncer in transaction mode doesn't guarantee the same underlying connection across multiple statements, which migrations depend on

---

## Neon Free Tier Limits

| Resource | Limit |
|----------|-------|
| Max concurrent connections (direct) | ~100 |
| Max concurrent connections (pooled) | ~10,000 |
| Connection pooler | PgBouncer (transaction mode) |

This is why pooling matters — it increases your effective connection capacity by ~100x.

---

## Summary

| | Pooled URL | Direct URL |
|---|---|---|
| **Hostname** | `ep-xxx-pooler.region...` | `ep-xxx.region...` |
| **Goes through** | PgBouncer | Directly to PostgreSQL |
| **Used by** | Prisma Client (app code) | Prisma CLI (migrations) |
| **Configured as** | `url` in schema.prisma | `directUrl` in schema.prisma |
| **Handles concurrency** | Yes (thousands of connections) | No (limited by DB max) |
| **Supports migrations** | No (advisory locks fail) | Yes |
| **Use in Vercel** | Runtime queries | Build step (migrations) |
