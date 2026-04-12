---
title: AppKit SDK
---

# AppKit SDK

AppKit is the TypeScript SDK for building full-stack Databricks Apps with a plugin-based architecture. It provides built-in Databricks authentication, type-safe database queries, and pre-built UI components. For full control over your stack, or if you already have an app framework, deploy any Python or Node.js app directly to Apps without AppKit. See [Apps quickstart](/docs/apps/quickstart).

## When to use AppKit

Choose AppKit when your app benefits from the following:

- **Plugin composition**: Add capabilities (Lakebase, Genie, analytics, file storage) through a declarative plugin system.
- **Type-safe data access**: Generate TypeScript types from SQL queries and access Lakebase with an ORM.
- **Built-in authentication**: OAuth and service principal handling for both local development and deployed apps.
- **Pre-built UI components**: Data tables, charts, dialogs, and layout components from `@databricks/appkit-ui`.

:::tip[Building with Python?]

AppKit targets TypeScript on Node.js. It does not apply to Python. Databricks Apps supports Python with frameworks such as Gradio, Streamlit, and Dash. Start from a [workspace template](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/create-app-template) or the [get-started tutorial](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started).

:::

## Scaffold an AppKit app

```bash
databricks apps init --name my-app --features lakebase,analytics
```

Pass `--features` for the plugins your app needs. Use `databricks apps manifest` to inspect available plugins and their required resource fields before scaffolding.

For the full `databricks apps init` option table, see [Apps quickstart](/docs/apps/quickstart#scaffold-an-app).

## Validate before deploy

From your app project directory:

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

See [Pre-deploy checklist](/docs/apps/development#pre-deploy-checklist) for options such as `--skip-tests` and how validation fits with `databricks apps deploy`.

## Docs CLI

Access API reference, component docs, and plugin guides from the terminal:

```bash
npx @databricks/appkit docs
npx @databricks/appkit docs --full
npx @databricks/appkit docs "<query-or-doc-path>"
```

Run without arguments to browse the index.

## How it works

AppKit uses a three-layer architecture with plugins that register capabilities at each layer:

- **Client**: React frontend served by Vite. The `@databricks/appkit-ui` package provides data tables, charts, dialogs, and layout components.
- **Server**: Express HTTP server with Databricks OAuth baked in. Plugins attach routes and middleware at this layer.
- **Data**: Plugin-based access to Databricks resources. Each plugin wraps a resource type (Lakebase, SQL Warehouse, Genie, UC Volumes) and exposes a typed API.

A minimal app with a Lakebase plugin looks like this:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";

const appkit = await createApp({
  plugins: [server(), lakebase()],
});

appkit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await appkit.lakebase.query("SELECT * FROM items");
    res.json(rows);
  });
});
```

## Built-in plugins

| Plugin        | What it adds                                                              |
| ------------- | ------------------------------------------------------------------------- |
| **server**    | Express HTTP server, static file serving, Vite dev mode (always included) |
| **lakebase**  | Postgres connection pool for Lakebase with automatic OAuth token refresh  |
| **analytics** | SQL query execution against Databricks SQL Warehouses                     |
| **genie**     | AI/BI Genie space integration for natural language queries                |
| **files**     | File operations against Unity Catalog Volumes                             |

See [Built-in plugins](/docs/apps/plugins) for setup and configuration for each plugin, or [AppKit plugins](/docs/appkit/v0/plugins) for the full API reference.

## Architecture and plugins

The following guides cover the design in detail:

- [Architecture](/docs/appkit/v0/architecture): Plugin-based model, client/server/data layers.
- [Core Principles](/docs/appkit/v0/core-principles): The design principles behind AppKit.
- [Plugins](/docs/appkit/v0/plugins): Built-in plugins for analytics, caching, files, Genie, Lakebase, and more.
- [Development](/docs/appkit/v0/development): Local dev, remote bridge, type generation, AI-assisted development.
- [API Reference](/docs/appkit/v0/api): `@databricks/appkit` and `@databricks/appkit-ui` component docs.

## Further reading

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [App runtime (app.yaml)](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
- [Apps Plugins](/docs/apps/plugins)
- [Creating custom plugins](/docs/appkit/v0/plugins/custom-plugins)
