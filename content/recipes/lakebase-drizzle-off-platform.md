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

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running drizzle-kit");
}

export default defineConfig({
  schema: "./src/lib/*/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
```

### 5. Verify schema generation and migration

```bash
npx drizzle-kit generate
tsx scripts/db-migrate.ts
```

If both commands succeed, your Drizzle schema and Lakebase connection are working.

#### References

- [Drizzle ORM with PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
