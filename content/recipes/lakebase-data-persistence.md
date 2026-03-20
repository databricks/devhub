## Lakebase Data Persistence

Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers Lakebase project creation, schema setup, and full CRUD REST API routes.

### 1. Create a Lakebase project

Create a new Lakebase Postgres project. This provisions a managed Postgres cluster with a default branch and endpoint:

```bash
databricks postgres create-project <project-name> --profile <PROFILE>
```

Verify the project, branch, and endpoint were created:

```bash
databricks postgres list-branches \
  projects/<project-name> \
  --profile <PROFILE> -o json

databricks postgres list-endpoints \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json

databricks postgres list-databases \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json
```

Note these values from the output:

- endpoint host (`...status.hosts.host`) for `lakebase.postgres.host`
- endpoint path (`...name`) for `lakebase.postgres.endpointPath`
- database resource path (`...name`) for `lakebase.postgres.database`
- PostgreSQL database name (`...status.postgres_database`) for `lakebase.postgres.databaseName` and `PGDATABASE`

### 2. New app: scaffold with the Lakebase feature

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

This scaffolds a complete app with Lakebase already wired up, including a sample todo CRUD app. Skip to step 4 to configure environment variables, then step 5 to deploy.

### Production naming and routing conventions

The scaffolded Lakebase sample uses `lakebase` in route names and file paths to make plugin wiring obvious. For real apps, use domain names in user-facing code and keep `lakebase` only for infrastructure configuration.

Use these conventions:

- frontend pages and routes should use domain names (for example, `/` or `/todos`), not `/lakebase`
- API routes should use domain names (for example, `/api/todos`), not `/api/lakebase/todos`
- component and file names should use domain names (for example, `TodosPage.tsx`, `todo-routes.ts`)
- keep `lakebase` naming for plugin/config only (`lakebase()` plugin, `LAKEBASE_ENDPOINT`, `postgres` app resource)

For a todo app, prefer:

- `client/src/pages/TodosPage.tsx`
- route: `/` or `/todos`
- `server/routes/todos/todo-routes.ts`
- API endpoints:
  - `GET /api/todos`
  - `POST /api/todos`
  - `PATCH /api/todos/:id`
  - `DELETE /api/todos/:id`

Agent checklist after scaffolding:

- rename `LakebasePage` to your domain page component (for example, `TodosPage`)
- rename `setupSampleLakebaseRoutes` to a domain-specific route setup function
- rename `/lakebase` and `/api/lakebase/*` paths to domain-specific paths
- update navigation labels to domain language (for example, `Todos`), not `Lakebase`

### 3. Existing app: add Lakebase manually

The following changes match what `apps init --features=lakebase` generates. Apply them to an existing scaffolded AppKit app.

:::tip[Get the latest template code]
The code below may be outdated. To get the latest, clone `https://github.com/databricks/appkit` and look in the `template/` directory. Search for `{{if .plugins.lakebase}}` to find all lakebase-conditional files and blocks. Files entirely wrapped in that conditional are lakebase-only; shared files like `App.tsx` and `server.ts` contain conditional blocks you can extract.
:::

#### Update `server/server.ts`

Use `autoStart: false` on the server plugin so database setup runs before accepting requests. Import and register the `lakebase` plugin, then call route setup in the `.then()` handler:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";
import { setupSampleLakebaseRoutes } from "./routes/lakebase/todo-routes";

createApp({
  plugins: [server({ autoStart: false }), lakebase()],
})
  .then(async (appkit) => {
    await setupSampleLakebaseRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
```

#### Create `server/routes/lakebase/todo-routes.ts`

Sample CRUD API that creates a `todos` table and exposes REST endpoints:

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
  WHERE table_schema = 'app' AND table_name = 'todos'
`;

const SETUP_SCHEMA_SQL = `CREATE SCHEMA IF NOT EXISTS app`;

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS app.todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const CreateTodoBody = z.object({ title: z.string().min(1) });

export async function setupSampleLakebaseRoutes(appkit: AppKitWithLakebase) {
  try {
    const { rows } = await appkit.lakebase.query(TABLE_EXISTS_SQL);
    if (rows.length > 0) {
      console.log("[lakebase] Table app.todos already exists, skipping setup");
    } else {
      await appkit.lakebase.query(SETUP_SCHEMA_SQL);
      await appkit.lakebase.query(CREATE_TABLE_SQL);
      console.log("[lakebase] Created schema and table app.todos");
    }
  } catch (err) {
    console.warn("[lakebase] Database setup failed:", (err as Error).message);
    console.warn("[lakebase] Routes will be registered but may return errors");
  }

  appkit.server.extend((app) => {
    app.get("/api/lakebase/todos", async (_req, res) => {
      try {
        const result = await appkit.lakebase.query(
          "SELECT id, title, completed, created_at FROM app.todos ORDER BY created_at DESC",
        );
        res.json(result.rows);
      } catch (err) {
        console.error("Failed to list todos:", err);
        res.status(500).json({ error: "Failed to list todos" });
      }
    });

    app.post("/api/lakebase/todos", async (req, res) => {
      try {
        const parsed = CreateTodoBody.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: "title is required" });
          return;
        }
        const result = await appkit.lakebase.query(
          "INSERT INTO app.todos (title) VALUES ($1) RETURNING id, title, completed, created_at",
          [parsed.data.title.trim()],
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        console.error("Failed to create todo:", err);
        res.status(500).json({ error: "Failed to create todo" });
      }
    });

    app.patch("/api/lakebase/todos/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          res.status(400).json({ error: "Invalid id" });
          return;
        }
        const result = await appkit.lakebase.query(
          "UPDATE app.todos SET completed = NOT completed WHERE id = $1 RETURNING id, title, completed, created_at",
          [id],
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: "Todo not found" });
          return;
        }
        res.json(result.rows[0]);
      } catch (err) {
        console.error("Failed to update todo:", err);
        res.status(500).json({ error: "Failed to update todo" });
      }
    });

    app.delete("/api/lakebase/todos/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          res.status(400).json({ error: "Invalid id" });
          return;
        }
        const result = await appkit.lakebase.query(
          "DELETE FROM app.todos WHERE id = $1 RETURNING id",
          [id],
        );
        if (result.rows.length === 0) {
          res.status(404).json({ error: "Todo not found" });
          return;
        }
        res.status(204).send();
      } catch (err) {
        console.error("Failed to delete todo:", err);
        res.status(500).json({ error: "Failed to delete todo" });
      }
    });
  });
}
```

:::warning[Deploy first to avoid schema ownership errors]
Lakebase tables are owned by the identity that creates them. If you create the `app` schema locally, your user owns it and the deployed service principal gets `permission denied for schema app`.

**Recommended workflow:** Deploy the app first so the service principal creates and owns the schema. Then grant yourself access for local development:

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS databricks_auth;
  SELECT databricks_create_role('<your-email>', 'USER');
  GRANT databricks_superuser TO \"<your-email>\";
"
```

This gives you DML access (read/write) but not DDL (create/alter). The service principal remains the schema owner.

If you already created tables locally, drop and recreate the schema so the SP owns it, or add tables in a separate schema (the [Chat Persistence recipe](/resources/ai-chat-app-template#lakebase-chat-persistence) uses a `chat` schema for this reason).
:::

#### Create `client/src/pages/lakebase/LakebasePage.tsx`

Todo list UI with CRUD operations against the API routes:

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
import { Check, X } from "lucide-react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export function LakebasePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/lakebase/todos")
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch todos: ${res.statusText}`);
        return res.json() as Promise<Todo[]>;
      })
      .then(setTodos)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load todos"),
      )
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/lakebase/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(`Failed to create todo: ${res.statusText}`);
      const created = (await res.json()) as Todo;
      setTodos((prev) => [created, ...prev]);
      setNewTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const res = await fetch(`/api/lakebase/todos/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error(`Failed to update todo: ${res.statusText}`);
      const updated = (await res.json()) as Todo;
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const res = await fetch(`/api/lakebase/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete todo: ${res.statusText}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A simple CRUD example powered by Databricks Lakebase (PostgreSQL).
          </p>

          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <Input
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={submitting}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !newTitle.trim()}>
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
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          )}

          {!loading && todos.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No todos yet. Add one above to get started.
            </p>
          )}

          {!loading && todos.length > 0 && (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodo(todo.id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      todo.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary"
                    }`}
                    aria-label={
                      todo.completed ? "Mark as incomplete" : "Mark as complete"
                    }
                  >
                    {todo.completed && <Check className="h-3 w-3" />}
                  </button>

                  <span
                    className={`flex-1 ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {todo.title}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Delete todo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <p className="text-xs text-muted-foreground pt-2">
                {completedCount} of {todos.length} completed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

> **Note**: The scaffolded component may trigger `@typescript-eslint/no-misused-promises` warnings on async `onSubmit` and `onClick` handlers. These are pre-existing in the AppKit template. Wrap handlers with `void` (e.g., `onClick={() => void toggleTodo(todo.id)}`) or add `// eslint-disable-next-line` comments to suppress.

#### Update `client/src/App.tsx`

Add the import, nav link, and route:

```tsx
// Add import at top
import { LakebasePage } from './pages/lakebase/LakebasePage';

// Add nav link inside the <nav> element
<NavLink to="/lakebase" className={navLinkClass}>
  Lakebase
</NavLink>

// Add route in the router children array
{ path: '/lakebase', element: <LakebasePage /> },
```

### 4. Configure environment variables

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

### 5. Update `databricks.yml`

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

### 6. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Verify the app once it is running by opening the app URL in your browser while signed in to Databricks, navigating to the `Lakebase` page, and creating/completing/deleting a todo item.

If the app does not start, check logs:

```bash
databricks apps logs <app-name> --profile <PROFILE>
```

#### References

- [Lakebase plugin docs](https://databricks.github.io/appkit/docs/plugins/lakebase)
- [Lakebase database permissions](https://databricks.github.io/appkit/docs/plugins/lakebase#database-permissions)
- [What is a Lakebase?](/solutions/what-is-a-lakebase)
