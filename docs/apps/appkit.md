---
title: AppKit
---

# AppKit

AppKit is the TypeScript SDK for building full-stack Databricks Apps with a plugin-based architecture. It provides built-in Databricks authentication, type-safe database queries, and pre-built UI components. For full control over your stack, or if you already have an app framework, deploy any Python or Node.js app directly to Apps without AppKit. See [Apps Getting Started](/docs/apps/getting-started).

## When to use AppKit

Choose AppKit when your app benefits from the following:

- **Plugin composition**: Add capabilities (Lakebase, Genie, analytics, file storage) through a declarative plugin system.
- **Type-safe data access**: Generate TypeScript types from SQL queries and access Lakebase with an ORM.
- **Built-in authentication**: OAuth and service principal handling for both local development and deployed apps.
- **Pre-built UI components**: Data tables, charts, dialogs, and layout components from `@databricks/appkit-ui`.

Skip AppKit if you're building a Python app, using your own framework, or don't need plugin composition.

## Scaffold an AppKit app

```bash
databricks apps init --name my-app --features lakebase,analytics
```

Pass `--features` for the plugins your app needs. Use `databricks apps manifest` to inspect available plugins and their required resource fields before scaffolding.

For the full `databricks apps init` option table, see [Apps Getting Started](/docs/apps/getting-started#scaffold-an-app).

## Docs CLI

Access API reference, component docs, and plugin guides from the terminal:

```bash
npx @databricks/appkit docs
npx @databricks/appkit docs --full
npx @databricks/appkit docs "<query-or-doc-path>"
```

Run without arguments to browse the index.

## Architecture and plugins

AppKit uses a three-layer architecture (client, server, data) with plugins that register capabilities at each layer. The following guides cover the design in detail:

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
