---
title: Quickstart
---

# Quickstart

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- `psql` (PostgreSQL client) if using `databricks psql`. Alternatively, use [`generate-database-credential`](/docs/lakebase/development#connect) with any PostgreSQL client.
- Workspace with Lakebase Postgres access enabled

## Template path

Browse the templates below, pick one for your use case, and copy it into your AI coding assistant. Each includes the [Create a Lakebase Instance](/templates/lakebase-create-instance) resource, which walks through project creation and connection value collection.

| Template                                                            | Best for                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [App with Lakebase](/templates/app-with-lakebase)                   | CRUD apps with persistent storage                              |
| [AI Chat App](/templates/ai-chat-app)                               | Conversational AI with chat history                            |
| [Operational Data Analytics](/templates/operational-data-analytics) | Bidirectional sync between Lakebase Postgres and Unity Catalog |

## Customize your app

After deploying a Lakebase Postgres-backed app, consider the following customizations:

- **Add tables**: Follow the [Lakebase Data Persistence](/templates/lakebase-data-persistence) template to define schemas, generate types, and create CRUD routes.
- **Add chat persistence**: Use the [Lakebase Chat Persistence](/templates/lakebase-chat-persistence) template to store conversations.
- **Use feature branches**: Create isolated branches for development and testing. The [Development: Feature branches](/docs/lakebase/development#feature-branches) section has CLI commands.
- **Sync data to/from Unity Catalog**: Use [Lakehouse Sync (CDC)](/templates/lakebase-change-data-feed-autoscaling) to replicate Lakebase Postgres tables into Delta, or [Sync Tables](/templates/sync-tables-autoscaling) to serve Unity Catalog data through it.
- **Deploy outside Databricks**: Use the [Lakebase Off-Platform](/templates/lakebase-off-platform) template for apps hosted on AWS, Vercel, Netlify, and others.

## Manual path

When you scaffold without a template, `databricks apps init` generates a working AppKit project.

**Interactive** (recommended for local development): run without flags and the CLI prompts for project name and feature (plugin) selection:

```bash
databricks apps init
```

```text
Project name: my-app
┃ Select features
┃   [ ] Analytics Plugin
┃   [ ] Files Plugin
┃   [ ] Genie Plugin
┃   [x] Lakebase
┃   [ ] Model Serving Plugin
```

Select **Lakebase** and the CLI walks you through selecting an existing project, branch, and database.

**Non-interactive** (for scripts and CI): pass `--name` and the required `--set` fields for each selected plugin feature. The `database` value must be the full resource path, retrieved via `databricks postgres list-databases projects/<project-id>/branches/<branch-id> -o json` (use the `name` field):

```bash
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
```

Then deploy first to create the schemas, and run locally:

```bash
cd my-app
databricks apps deploy
```

:::tip
Execute `databricks apps deploy` before `npm run dev`. Deploying sets up a managed identity (the app's service principal) that creates the database schema on first startup. If you start `npm run dev` first instead, the schema gets created under your personal credentials, and when you later deploy the app's managed identity can't access it. [Local setup](/docs/lakebase/development#local-setup) explains this further.
:::

```bash
npm install && npm run dev
```

## Next steps

[Templates](/templates) cover common Lakebase Postgres patterns. If you scaffolded manually, [Lakebase Postgres development](/docs/lakebase/development) covers local setup, feature branches, and the full plugin API. [Lakebase Postgres configuration](/docs/lakebase/configuration) has the reference for `app.yaml`, resource declarations, and connection values.
