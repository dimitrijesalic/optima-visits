# Prisma Migrations Guide

## Overview

Migrations are SQL files that track database schema changes over time. Each migration represents a set of changes (creating tables, adding columns, etc.) and lives in `prisma/migrations/` with a timestamped folder name.

```
prisma/migrations/
├── migration_lock.toml
├── 20260224203705_init/
│   ├── migration.sql    # Up migration (apply changes)
│   └── down.sql         # Down migration (revert changes)
└── 20260301120000_add_phone_to_user/
    ├── migration.sql
    └── down.sql
```

---

## When to Create a Migration

Create a new migration **every time you change `prisma/schema.prisma`**. Examples:

- Adding a new model (table)
- Adding, removing, or renaming a field (column)
- Changing a field type
- Adding or removing an enum value
- Adding or modifying indexes, unique constraints, or relations

**Do NOT** manually edit the database schema. Always go through Prisma migrations so that the migration history stays in sync with the actual database.

---

## How to Create a Migration

### 1. Edit the schema

Make your changes in `prisma/schema.prisma`. For example, adding a phone field:

```prisma
model User {
  id    String  @id @default(uuid()) @db.Uuid
  email String  @unique
  phone String?  // <-- new field
}
```

### 2. Generate the migration

```bash
npx prisma migrate dev --name <descriptive_name>
```

Example:

```bash
npx prisma migrate dev --name add_phone_to_user
```

This will:
- Compare your schema to the current database
- Generate a new `migration.sql` file in `prisma/migrations/<timestamp>_<name>/`
- Apply the migration to your development database
- Regenerate the Prisma Client

### 3. Create the down migration (manually)

Prisma does not auto-generate down migrations. After each `migrate dev`, manually create a `down.sql` in the same folder that reverses the changes.

Example for the above:

```sql
-- down.sql
ALTER TABLE "User" DROP COLUMN IF EXISTS "phone";
```

### 4. Commit both files

Always commit `migration.sql` and `down.sql` together to version control.

---

## How to Apply Migrations

### Development

```bash
npx prisma migrate dev
```

Applies all pending migrations and regenerates the Prisma Client. If there are unapplied migrations, they will be applied in order.

### Production / CI (Vercel)

```bash
npx prisma migrate deploy
```

Applies all pending migrations **without** generating the client or prompting for confirmations. This is safe for automated environments. Used in the `build` script for Vercel deployments.

---

## How to Revert a Migration (Down Migration)

Prisma does not have a built-in `migrate down` command. To revert:

### Option 1: Run the down.sql manually

```bash
npx prisma db execute --file prisma/migrations/<timestamp>_<name>/down.sql
```

Then remove the migration record from the `_prisma_migrations` table:

```sql
DELETE FROM "_prisma_migrations" WHERE migration_name = '<timestamp>_<name>';
```

### Option 2: Reset the database (development only)

```bash
npx prisma migrate reset
```

This drops the entire database, re-applies all migrations from scratch, and re-runs the seed script. **Never use this in production.**

---

## Common Commands Reference

| Command | Purpose | Environment |
|---------|---------|-------------|
| `npx prisma migrate dev --name <name>` | Create and apply a new migration | Development |
| `npx prisma migrate deploy` | Apply pending migrations | Production / CI |
| `npx prisma migrate reset` | Drop DB, re-apply all migrations, re-seed | Development only |
| `npx prisma migrate status` | Check which migrations have been applied | Any |
| `npx prisma db push` | Sync schema without migration files (prototyping) | Development only |
| `npx prisma generate` | Regenerate Prisma Client from schema | Any |
| `npx prisma db execute --file <path>` | Run a raw SQL file against the database | Any |

---

## Best Practices

1. **Always use `migrate dev`** in development — avoid `db push` once you have migration history, as it doesn't create migration files.

2. **Use descriptive migration names** — `add_phone_to_user` is better than `update` or `fix`.

3. **Always write a `down.sql`** — even if you think you won't need it. Reverting a broken migration in production without one is painful.

4. **Never edit an already-applied migration** — if you need to change something, create a new migration.

5. **Review generated SQL before applying** — Prisma may generate destructive operations (dropping columns) if you rename fields. Always check `migration.sql` before confirming.

6. **Test migrations on a branch database** — Neon supports database branching. Create a branch, test your migration there, then apply to production.

7. **Keep migrations small and focused** — one logical change per migration makes reverting easier.
