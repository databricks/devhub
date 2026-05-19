## Drizzle ORM with Lakebase in an Off-Platform App

Connect Drizzle ORM to Lakebase in any Node.js server outside Databricks App Platform. Uses the `@databricks/lakebase` package for automatic OAuth token refresh.

### 1. Install Drizzle and the Lakebase package

```bash
npm install drizzle-orm @databricks/lakebase
npm install -D drizzle-kit tsx
```

`drizzle-orm` and `drizzle-kit` must be on the same major version. If `drizzle-kit` errors with "This version of drizzle-kit is outdated," check that both packages share the same major (e.g. both 0.x or both 1.x).

### 2. Create a Lakebase-backed pool and Drizzle client

Create `src/lib/db/client.ts`. `createLakebasePool()` reads env vars automatically (`PGHOST`, `PGDATABASE`, `LAKEBASE_ENDPOINT`, `PGUSER`, etc.) and handles OAuth token refresh with a 2-minute buffer:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { createLakebasePool } from "@databricks/lakebase";
import * as itemsSchema from "@/lib/items/schema";

const pool = createLakebasePool();
export const db = drizzle({ client: pool, schema: { ...itemsSchema } });
```

> `@databricks/lakebase` is for **Lakebase Autoscaling only** (not compatible with Provisioned). See the manual alternative at the end if you need Provisioned support.

### 3. Define a Drizzle schema

Create `src/lib/items/schema.ts` with a starter table. Adapt the table name, columns, and types to your domain (e.g. `products`, `orders`, `users`):

```typescript
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

Add more schema files under `src/lib/<domain>/schema.ts` as your app grows. The `drizzle.config.ts` glob (`./src/lib/*/schema.ts`) picks them all up automatically.

### 4. Write the migration script

Create `scripts/db-migrate.ts`. This uses the same `createLakebasePool()` with automatic credential handling — no need to build a temporary `DATABASE_URL`:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createLakebasePool } from "@databricks/lakebase";

const pool = createLakebasePool();
const db = drizzle({ client: pool });
await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
await pool.end();
console.log("Migrations applied successfully");
```

### 5. Keep `drizzle.config.ts` minimal

Commands like `generate` only read schema files and never connect, so no `dbCredentials` are needed:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
});
```

### 6. Verify schema generation and migration

Generate reads schema files locally (no database connection):

```bash
npx drizzle-kit generate
```

Migrate fetches a fresh Lakebase credential and applies the generated SQL:

```bash
npx dotenv -e .env.local -- npx tsx scripts/db-migrate.ts
```

`tsx` does not load `.env.local` automatically (that is a Next.js-specific behavior), so use `dotenv-cli` or your framework's env-loading mechanism to inject the variables.

If both commands succeed, your Drizzle schema and Lakebase connection are working.

### Manual alternative (Provisioned or full control)

If you cannot use `@databricks/lakebase` (e.g. Lakebase Provisioned, or you need full control over SSL and token refresh), build a manual `pg.Pool` with a password callback:

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg tsx
```

```typescript
import { Pool, type PoolConfig } from "pg";
import { env } from "@/lib/env";
import { getLakebasePostgresToken } from "@/lib/lakebase/tokens";

function sslConfig(mode: "require" | "prefer" | "disable"): PoolConfig["ssl"] {
  switch (mode) {
    case "require":
      return { rejectUnauthorized: true };
    case "prefer":
      return { rejectUnauthorized: false };
    case "disable":
      return false;
  }
}

export function createLakebasePool(): Pool {
  return new Pool({
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: () => getLakebasePostgresToken(),
    ssl: sslConfig(env.PGSSLMODE),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}
```

For the migration script with this approach, build a temporary `DATABASE_URL` with a fresh credential and pass it to `drizzle-kit migrate` via `execSync`.

#### References

- [Drizzle ORM with PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [`@databricks/lakebase` README](https://github.com/databricks/appkit/tree/main/packages/lakebase)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
