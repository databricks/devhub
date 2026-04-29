## Lakebase Env Management for Off-Platform Apps

Define and validate the environment variables needed to connect to Lakebase from apps deployed outside Databricks App Platform (for example on AWS, Vercel, or Netlify).

### 1. Collect connection values via the Databricks CLI

Every value below can be obtained from the CLI. Run each command and record the result.

**Workspace host** (`DATABRICKS_HOST`):

```bash
databricks auth profiles
```

Use the `Host` column for your profile (e.g. `https://dbc-xxxxx.cloud.databricks.com`).

**Lakebase endpoint and Postgres host** (`LAKEBASE_ENDPOINT`, `PGHOST`):

```bash
databricks postgres list-endpoints \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json
```

- `LAKEBASE_ENDPOINT` = the `name` field (e.g. `projects/<project>/branches/production/endpoints/primary`)
- `PGHOST` = the `status.hosts.host` field

**Postgres database name** (`PGDATABASE`):

```bash
databricks postgres list-databases \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json
```

Use the `status.postgres_database` field (typically `databricks_postgres`).

**Postgres user** (`PGUSER`):

For local development with token auth, this is your Databricks email:

```bash
databricks current-user me --profile <PROFILE> -o json
```

Use the `userName` field.

For production with M2M auth, this is the service principal's application ID used for `DATABRICKS_CLIENT_ID`.

**Auth credentials:**

For local development, get a short-lived workspace token:

```bash
databricks auth token --profile <PROFILE> -o json
```

Use the `access_token` field for `DATABRICKS_TOKEN`. This token expires after about one hour; the [Token Management](/templates/lakebase-off-platform#lakebase-token-management) template covers automated refresh.

For production, use OAuth M2M credentials (`DATABRICKS_CLIENT_ID` + `DATABRICKS_CLIENT_SECRET`) from a service principal configured in your workspace.

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
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
PGHOST=<status.hosts.host from list-endpoints>
PGPORT=5432
PGDATABASE=<status.postgres_database from list-databases>
PGUSER=<your Databricks email or service principal application ID>
PGSSLMODE=require

# Option A: local dev, token auth (expires ~1h, use refresh script)
DATABRICKS_TOKEN=

# Option B: production, M2M auth (service principal)
DATABRICKS_CLIENT_ID=
DATABRICKS_CLIENT_SECRET=
```

### 4. Import `env` early in your server entry point

Import `env` at the top of your server bootstrap file. The Zod parse runs on import, so any missing or invalid variable throws before the app starts accepting requests.

#### References

- [Databricks OAuth machine-to-machine auth](https://docs.databricks.com/en/dev-tools/auth/oauth-m2m.html)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
