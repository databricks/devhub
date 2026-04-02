## Lakebase Env Management for Off-Platform Apps

Define and validate the environment variables needed to connect to Lakebase from apps deployed outside Databricks App Platform (for example on AWS, Vercel, or Netlify).

### 1. Required environment variables

Use the same set of variables for local development and production. All names follow standard Postgres conventions (`PG*`) plus Databricks-specific auth variables:

Connection:

- `DATABRICKS_HOST`
- `LAKEBASE_ENDPOINT`
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`

Auth options:

- local/dev token flow: `DATABRICKS_TOKEN`
- machine-to-machine flow: `DATABRICKS_CLIENT_ID` + `DATABRICKS_CLIENT_SECRET`

### 2. Validate env at startup with Zod

Create `src/lib/env.ts`. Parsing `process.env` through a Zod schema on import ensures the app fails fast with a clear error when a variable is missing:

```typescript
import { z } from "zod";

const baseSchema = z.object({
  DATABRICKS_HOST: z.string().min(1),
  LAKEBASE_ENDPOINT: z.string().min(1),
  PGHOST: z.string().min(1),
  PGPORT: z.coerce.number().default(5432),
  PGDATABASE: z.string().min(1),
  PGUSER: z.string().min(1),
  PGSSLMODE: z.enum(["require", "prefer", "disable"]).default("require"),
  DATABRICKS_TOKEN: z.string().optional(),
  DATABRICKS_CLIENT_ID: z.string().optional(),
  DATABRICKS_CLIENT_SECRET: z.string().optional(),
});

type AppEnv = z.infer<typeof baseSchema>;

function validateAuth(env: AppEnv): AppEnv {
  const hasToken = Boolean(env.DATABRICKS_TOKEN);
  const hasM2M =
    Boolean(env.DATABRICKS_CLIENT_ID) && Boolean(env.DATABRICKS_CLIENT_SECRET);
  if (!hasToken && !hasM2M) {
    throw new Error(
      "Set DATABRICKS_TOKEN or both DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET",
    );
  }
  return env;
}

export const env = validateAuth(baseSchema.parse(process.env));
```

### 3. Commit an `.env.example`

Commit this file so every developer (and CI) knows which variables are required. Set the same keys in your hosting platform's secret/env configuration:

```bash
DATABRICKS_HOST=https://<workspace-host>
LAKEBASE_ENDPOINT=projects/<project>/branches/<branch>/endpoints/<endpoint>
PGHOST=<lakebase-host>
PGPORT=5432
PGDATABASE=<database-name>
PGUSER=<db-user-or-service-principal-id>
PGSSLMODE=require

# Option A: local token auth
DATABRICKS_TOKEN=

# Option B: machine-to-machine auth
DATABRICKS_CLIENT_ID=
DATABRICKS_CLIENT_SECRET=
```

### 4. Import `env` early in your server entry point

Import `env` at the top of your server bootstrap file. The Zod parse runs on import, so any missing or invalid variable throws before the app starts accepting requests.

#### References

- [Databricks OAuth machine-to-machine auth](https://docs.databricks.com/en/dev-tools/auth/oauth-m2m.html)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
