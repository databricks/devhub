---
title: Development
---

# Development

## On Databricks App Platform (AppKit)

The [Lakebase Data Persistence](/resources/data-app-template#lakebase-data-persistence) recipe is the canonical guide for building Lakebase-backed apps with AppKit. It covers scaffolding, schema setup, CRUD routes, environment configuration, and deployment.

Key points from the recipe:

- **Scaffold**: `databricks apps init` with the Lakebase plugin, or add it to an existing app manually
- **Connection**: AppKit's `lakebase()` plugin provides a `pg.Pool` with automatic OAuth token refresh
- **Deploy first**: the app's Service Principal creates schemas and tables on first deploy. Grant yourself `databricks_superuser` for local development afterward:

```bash
databricks psql --project <project-name> --branch production --endpoint primary --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS databricks_auth;
  SELECT databricks_create_role('<your-email>', 'USER');
  GRANT databricks_superuser TO \"<your-email>\";
"
```

- **Environment**: deployed apps get Postgres connection values injected automatically. Only `LAKEBASE_ENDPOINT` needs explicit configuration in `app.yaml`:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

For pool configuration, ORM access (`.pool`, `.getOrmConfig()`, `.getPgConfig()`), and the full plugin API, see the [AppKit Lakebase plugin docs](/docs/appkit/v0/plugins/lakebase).

## Off-platform (AWS, Vercel, Netlify, etc.)

The [Lakebase Off-Platform Template](/resources/lakebase-off-platform-template) is a complete cookbook for using Lakebase from apps hosted outside Databricks. It includes:

- [Env Management](/resources/lakebase-off-platform-template#lakebase-env-management-for-off-platform-apps): how to obtain every connection value via CLI and validate with Zod
- [Token Management](/resources/lakebase-off-platform-template#lakebase-token-management): cached workspace and Lakebase credential refresh (tokens expire in ~1 hour)
- [Drizzle ORM](/resources/lakebase-off-platform-template#drizzle--lakebase-in-an-off-platform-app): connecting Drizzle to Lakebase with `pg` password callbacks and migration-time credentials

## Feature branches

Use Lakebase branches to isolate schema changes and test migrations without affecting production:

```bash
databricks postgres create-branch projects/$PROJECT_ID feature-xyz \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$BRANCH_ID", "no_expiry": true}}'
```

A `primary` read-write endpoint is created automatically, inheriting the project's `default_endpoint_settings`.

Delete when done: `databricks postgres delete-branch projects/$PROJECT_ID/branches/feature-xyz`

## All Lakebase recipes

| Recipe                                                                                 | Description                                    |
| -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Create a Lakebase Instance](/resources/data-app-template#create-a-lakebase-instance)  | Provision a project, collect connection values |
| [Lakebase Data Persistence](/resources/data-app-template#lakebase-data-persistence)    | Schema setup, CRUD routes, deploy workflow     |
| [Lakebase Chat Persistence](/resources/ai-chat-app-template#lakebase-chat-persistence) | Chat/message schema on Lakebase                |
| [Lakehouse Sync (ETL)](/resources#etl-lakehouse-sync-autoscaling)                      | Sync Lakebase to Unity Catalog                 |
| [Reverse ETL Synced Tables](/resources#reverse-etl-synced-tables-autoscaling)          | Unity Catalog to Lakebase                      |
| [Lakebase Off-Platform Template](/resources/lakebase-off-platform-template)            | Env, tokens, and Drizzle for off-platform apps |

## Source of truth

- [AppKit Lakebase plugin](/docs/appkit/v0/plugins/lakebase)
- [AppKit `@databricks/lakebase` README](https://github.com/databricks/appkit/blob/main/packages/lakebase/README.md)
- [Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/)
