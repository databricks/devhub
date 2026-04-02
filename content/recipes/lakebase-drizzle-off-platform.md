## Drizzle + Lakebase in an Off-Platform App

Connect Drizzle ORM to Lakebase in any Node.js server outside Databricks App Platform. Uses a `pg` Pool with a password callback for automatic credential refresh.

### 1. Create a Lakebase-backed `pg` pool

Create `src/lib/db/pool.ts`:

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

### 2. Initialize Drizzle with the pool

Create `src/lib/db/client.ts`. Replace the example schema imports with your own domain schemas:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { createLakebasePool } from "@/lib/db/pool";
import * as itemsSchema from "@/lib/items/schema";

const pool = createLakebasePool();
export const db = drizzle({ client: pool, schema: { ...itemsSchema } });
```

### 3. Handle drizzle-kit migrations with a temporary `DATABASE_URL`

`drizzle-kit` needs a connection string and cannot use `pg` password callbacks. Build a one-time URL with a fresh Lakebase credential in `scripts/db-migrate.ts`:

```typescript
import { execSync } from "node:child_process";
import { env } from "@/lib/env";
import { getLakebasePostgresToken } from "@/lib/lakebase/tokens";

async function runMigrations() {
  const token = await getLakebasePostgresToken();
  const encodedUser = encodeURIComponent(env.PGUSER);
  const encodedPassword = encodeURIComponent(token);

  const databaseUrl =
    `postgresql://${encodedUser}:${encodedPassword}` +
    `@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}` +
    `?sslmode=${env.PGSSLMODE}`;

  execSync("npx drizzle-kit migrate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### 4. Keep `drizzle.config.ts` minimal

Lakebase Postgres passwords are short-lived tokens, so there is no static `DATABASE_URL` to store in `.env`. The migration script from step 3 builds a temporary URL with a fresh credential and passes it as `DATABASE_URL` when it shells out to `drizzle-kit migrate`. Commands like `generate` only read schema files and never connect, so `dbCredentials` is optional:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  ...(process.env.DATABASE_URL && {
    dbCredentials: { url: process.env.DATABASE_URL },
  }),
});
```

### 5. Verify schema generation and migration

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

#### References

- [Drizzle ORM with PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
