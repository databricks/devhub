## Lakebase Data Persistence

Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers Lakebase project creation, schema setup, table creation, and full CRUD REST API routes.

### 1. Create a Lakebase project

Create a new Lakebase Postgres project. This provisions a managed Postgres cluster with a default branch and endpoint:

```bash
databricks postgres create-project <project-name> --profile <PROFILE>
```

Verify the project, branch, and endpoint were created:

```bash
databricks postgres list-branches projects/<project-name> --profile <PROFILE> -o json
databricks postgres list-endpoints projects/<project-name>/branches/production --profile <PROFILE> -o json
```

Note the endpoint host from the output — you will need it for configuration.

### 2. Scaffold with the Lakebase feature

When scaffolding your app, enable the `lakebase` feature and provide the Postgres connection details:

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=lakebase \
  --set 'lakebase.postgres.branch=projects/<project-name>/branches/production' \
  --set 'lakebase.postgres.database=projects/<project-name>/branches/production/databases/<db-name>' \
  --set 'lakebase.postgres.host=<endpoint-host>' \
  --set 'lakebase.postgres.databaseName=<db-name>' \
  --set 'lakebase.postgres.endpointPath=projects/<project-name>/branches/production/endpoints/primary' \
  --set 'lakebase.postgres.port=5432' \
  --set 'lakebase.postgres.sslmode=require' \
  --run none --profile <PROFILE>
```

### 3. Configure app.yaml for deployment

The Lakebase connection is configured via environment variables in `app.yaml`. Update it with your endpoint details:

```yaml
command: ["npm", "run", "start"]
env:
  - name: PGHOST
    value: "<endpoint-host>"
  - name: PGPORT
    value: "5432"
  - name: PGDATABASE
    value: "databricks_postgres"
  - name: PGSSLMODE
    value: "require"
  - name: LAKEBASE_ENDPOINT
    value: "projects/<project-name>/branches/production/endpoints/primary"
```

### 4. Enable the Lakebase plugin

The scaffolded server entry point includes the lakebase plugin. Use `autoStart: false` on the server plugin so you can run database setup before accepting requests:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";

createApp({ plugins: [server({ autoStart: false }), lakebase()] })
  .then(async (appkit) => {
    await setupSchema(appkit);
    registerRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
```

### 5. Define your database schema

Create a schema and table using raw SQL. Lakebase provides a Postgres-compatible interface through `appkit.lakebase.query()`:

```typescript
const SETUP_SCHEMA = `CREATE SCHEMA IF NOT EXISTS app`;

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS app.items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await appkit.lakebase.query(SETUP_SCHEMA);
await appkit.lakebase.query(CREATE_TABLE);
```

### 6. Create CRUD API routes

Use `appkit.server.extend()` to register Express routes that call `appkit.lakebase.query()` with parameterized SQL:

```typescript
appkit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await appkit.lakebase.query(
      "SELECT * FROM app.items ORDER BY created_at DESC",
    );
    res.json(rows);
  });

  app.post("/api/items", async (req, res) => {
    const { rows } = await appkit.lakebase.query(
      "INSERT INTO app.items (title) VALUES ($1) RETURNING *",
      [req.body.title],
    );
    res.status(201).json(rows[0]);
  });

  app.patch("/api/items/:id", async (req, res) => {
    const { rows } = await appkit.lakebase.query(
      "UPDATE app.items SET completed = NOT completed WHERE id = $1 RETURNING *",
      [req.params.id],
    );
    res.json(rows[0]);
  });

  app.delete("/api/items/:id", async (req, res) => {
    await appkit.lakebase.query("DELETE FROM app.items WHERE id = $1", [
      req.params.id,
    ]);
    res.status(204).send();
  });
});
```

### 7. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Verify the endpoints with curl once the app is running:

```bash
curl -X POST https://<app-url>/api/items \
  -H 'Content-Type: application/json' \
  -d '{"title":"My first item"}'

curl https://<app-url>/api/items
```

#### References

- [Lakebase plugin docs](https://databricks.github.io/appkit/docs/plugins/lakebase)
- [Lakebase database permissions](https://databricks.github.io/appkit/docs/plugins/lakebase#database-permissions)
- [What is a Lakebase?](/solutions/what-is-a-lakebase)
