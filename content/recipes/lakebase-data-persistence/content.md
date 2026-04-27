## Lakebase Data Persistence

Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.

This recipe assumes you have already completed the [Create a Lakebase Instance](/templates/app-with-lakebase#create-a-lakebase-instance) recipe and have the connection values (endpoint host, endpoint path, database resource path, and PostgreSQL database name) ready.

The code examples below use a generic `items` resource as a placeholder. Replace `items` with your domain entity (products, orders, users, etc.) and adapt the schema columns to match your data model.

### 1. New app: scaffold with the Lakebase feature

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=lakebase \
  --set 'lakebase.postgres.branch=projects/<project-name>/branches/production' \
  --set 'lakebase.postgres.database=projects/<project-name>/branches/production/databases/<db-name>' \
  --set 'lakebase.postgres.databaseName=<postgres-database-name>' \
  --set 'lakebase.postgres.endpointPath=projects/<project-name>/branches/production/endpoints/primary' \
  --set 'lakebase.postgres.host=<endpoint-host>' \
  --set 'lakebase.postgres.port=5432' \
  --set 'lakebase.postgres.sslmode=require' \
  --run none --profile <PROFILE>
```

Use the values returned by `list-databases` and `list-endpoints`. The generated template currently requires all postgres fields together during non-interactive scaffolding.

This scaffolds a complete app with Lakebase already wired up, including a sample CRUD app. Skip to step 3 to configure environment variables, then step 5 to deploy.

### Naming and routing conventions

The scaffolded Lakebase sample uses `lakebase` in route names and file paths to make plugin wiring obvious. For production apps, use domain names in user-facing code and keep `lakebase` only for infrastructure configuration:

- page components and files use domain names: `ItemsPage.tsx`, `item-routes.ts`
- routes use domain names: `/items`, `/api/items`, `/api/items/:id`
- keep `lakebase` naming for plugin/config only: `lakebase()` plugin, `LAKEBASE_ENDPOINT`, `postgres` app resource

### 2. Existing app: add Lakebase manually

The following changes match what `apps init --features=lakebase` generates. Apply them to an existing scaffolded AppKit app.

:::tip[Get the latest template code]
The code below may be outdated. To get the latest, clone `https://github.com/databricks/appkit` and look in the `template/` directory. Search for `{{if .plugins.lakebase}}` to find all lakebase-conditional files and blocks. Files entirely wrapped in that conditional are lakebase-only; shared files like `App.tsx` and `server.ts` contain conditional blocks you can extract.
:::

#### Update `server/server.ts`

Register the `lakebase` plugin and run route setup inside `onPluginsReady`. AppKit waits for that hook to resolve before the server starts accepting requests, so your schema setup completes before the first call lands:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";
import { setupRoutes } from "./routes/item-routes";

await createApp({
  plugins: [server(), lakebase()],
  async onPluginsReady(appkit) {
    await setupRoutes(appkit);
  },
});
```

#### Create `server/routes/item-routes.ts`

CRUD API that creates an `items` table and exposes REST endpoints. Adapt the table schema and routes to your domain:

```typescript
import { z } from "zod";
import { Application } from "express";

interface AppKitWithLakebase {
  lakebase: {
    query(
      text: string,
      params?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

const TABLE_EXISTS_SQL = `
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'app' AND table_name = 'items'
`;

const SETUP_SCHEMA_SQL = `CREATE SCHEMA IF NOT EXISTS app`;

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS app.items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const CreateItemBody = z.object({ name: z.string().min(1) });
const UpdateItemBody = z.object({ name: z.string().min(1) });

export async function setupRoutes(appkit: AppKitWithLakebase) {
  try {
    const { rows } = await appkit.lakebase.query(TABLE_EXISTS_SQL);
    if (rows.length > 0) {
      console.log("[lakebase] Table app.items already exists, skipping setup");
    } else {
      await appkit.lakebase.query(SETUP_SCHEMA_SQL);
      await appkit.lakebase.query(CREATE_TABLE_SQL);
      console.log("[lakebase] Created schema and table app.items");
    }
  } catch (err) {
    console.warn("[lakebase] Database setup failed:", (err as Error).message);
    console.warn("[lakebase] Routes will be registered but may return errors");
  }

  appkit.server.extend((app) => {
    app.get("/api/items", async (_req, res) => {
      try {
        const result = await appkit.lakebase.query(
          "SELECT id, name, created_at FROM app.items ORDER BY created_at DESC",
        );
        res.json(result.rows);
      } catch (err) {
        console.error("Failed to list items:", err);
        res.status(500).json({ error: "Failed to list items" });
      }
    });

    app.post("/api/items", async (req, res) => {
      try {
        const parsed = CreateItemBody.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: "name is required" });
          return;
        }
        const result = await appkit.lakebase.query(
          "INSERT INTO app.items (name) VALUES ($1) RETURNING id, name, created_at",
          [parsed.data.name.trim()],
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error("Failed to create item:", err);
        res.status(500).json({ error: "Failed to create item" });
      }
    });

    app.patch("/api/items/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          res.status(400).json({ error: "Invalid id" });
          return;
        }
        const parsed = UpdateItemBody.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: "name is required" });
          return;
        }
        const result = await appkit.lakebase.query(
          "UPDATE app.items SET name = $1 WHERE id = $2 RETURNING id, name, created_at",
          [parsed.data.name.trim(), id],
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: "Item not found" });
          return;
        }
        res.json(result.rows[0]);
      } catch (err) {
        console.error("Failed to update item:", err);
        res.status(500).json({ error: "Failed to update item" });
      }
    });

    app.delete("/api/items/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          res.status(400).json({ error: "Invalid id" });
          return;
        }
        const result = await appkit.lakebase.query(
          "DELETE FROM app.items WHERE id = $1 RETURNING id",
          [id],
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: "Item not found" });
          return;
        }
        res.status(204).send();
      } catch (err) {
        console.error("Failed to delete item:", err);
        res.status(500).json({ error: "Failed to delete item" });
      }
    });
  });
}
```

:::warning[Deploy first to avoid schema ownership errors]
Lakebase tables are owned by the identity that creates them. If you create the `app` schema locally, your user owns it and the deployed service principal gets `permission denied for schema app`.

**Recommended workflow:** Deploy the app first so the service principal creates and owns the schema. Then grant yourself access for local development:

```bash
databricks psql --project <project-name> --branch production --endpoint primary --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS databricks_auth;
  SELECT databricks_create_role('<your-email>', 'USER');
  GRANT databricks_superuser TO \"<your-email>\";
"
```

If you are the Lakebase project owner, `databricks_create_role` may fail with `role already exists` and `GRANT databricks_superuser` may fail with `permission denied to grant role`. Both errors are safe to ignore; the project owner already has the necessary access.

This gives you DML access (read/write) but not DDL (create/alter). The service principal remains the schema owner.

If you already created tables locally, drop and recreate the schema so the service principal owns it, or add tables in a separate schema (the [Chat Persistence recipe](/templates/ai-chat-app#lakebase-chat-persistence) uses a `chat` schema for this reason).
:::

#### Create `client/src/pages/ItemsPage.tsx`

List and create UI with CRUD operations against the API routes. Adapt the fields and layout to your domain:

```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Skeleton,
} from "@databricks/appkit-ui/react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Item {
  id: number;
  name: string;
  created_at: string;
}

export function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch items: ${res.statusText}`);
        return res.json() as Promise<Item[]>;
      })
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load items"),
      )
      .finally(() => setLoading(false));
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`Failed to create item: ${res.statusText}`);
      const created = (await res.json()) as Item;
      setItems((prev) => [created, ...prev]);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete item: ${res.statusText}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <Input
              placeholder="New item name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={submitting}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !newName.trim()}>
              {submitting ? "Adding..." : "Add"}
            </Button>
          </form>

          {error && (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-3">
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No items yet. Add one above to get started.
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <span className="flex-1">{item.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Delete item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Update `client/src/App.tsx`

Add the import, nav link, and route:

```tsx
// Add import at top
import { ItemsPage } from './pages/ItemsPage';

// Add nav link inside the <nav> element
<NavLink to="/items" className={navLinkClass}>
  Items
</NavLink>

// Add route in the router children array
{ path: '/items', element: <ItemsPage /> },
```

### 3. Configure environment variables

For local development, add the Postgres connection details to `.env`:

```bash
PGHOST=<endpoint-host>
PGPORT=5432
PGDATABASE=<postgres-database-name>
PGSSLMODE=require
LAKEBASE_ENDPOINT=projects/<project-name>/branches/production/endpoints/primary
```

For deployment, the platform injects Postgres connection values automatically through the app resource. Keep only the Lakebase endpoint in `app.yaml`:

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

### 4. Update `databricks.yml`

Add the postgres variables, resource, and target values:

```yaml
variables:
  postgres_branch:
    description: Lakebase Postgres branch resource name
  postgres_database:
    description: Lakebase Postgres database resource name
  postgres_databaseName:
    description: Postgres database name for local development
  postgres_endpointPath:
    description: Lakebase endpoint resource name for local development
  postgres_host:
    description: Postgres host for local development
  postgres_port:
    description: Postgres port for local development
  postgres_sslmode:
    description: Postgres SSL mode for local development

resources:
  apps:
    app:
      # Add under existing app config
      resources:
        - name: postgres
          postgres:
            branch: ${var.postgres_branch}
            database: ${var.postgres_database}
            permission: CAN_CONNECT_AND_CREATE

targets:
  default:
    variables:
      postgres_branch: projects/<project-name>/branches/production
      postgres_database: projects/<project-name>/branches/production/databases/<db-name>
      postgres_databaseName: <postgres-database-name>
      postgres_endpointPath: projects/<project-name>/branches/production/endpoints/primary
      postgres_host: <endpoint-host>
      postgres_port: 5432
      postgres_sslmode: require
```

### 5. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Verify the app once it is running by opening the app URL in your browser while signed in to Databricks, navigating to the Items page, and creating, updating, and deleting an item.

If the app does not start, check logs:

```bash
databricks apps logs <app-name> --profile <PROFILE>
```

#### References

- [Lakebase plugin docs](/docs/appkit/v0/plugins/lakebase)
- [Lakebase database permissions](/docs/appkit/v0/plugins/lakebase#database-permissions)
- [What is a Lakebase?](/solutions/what-is-a-lakebase)
