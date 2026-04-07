---
title: Development
---

# Development

## On Databricks App Platform (AppKit)

The [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence) recipe is the canonical guide for building Lakebase-backed apps with AppKit. It covers scaffolding, schema setup, CRUD routes, environment configuration, and deployment.

Key points from the recipe:

- **Scaffold**: `databricks apps init` with the Lakebase plugin, or add it to an existing app manually
- **Connection**: AppKit's `lakebase()` plugin provides a `pg.Pool` with automatic OAuth token refresh
- **Deploy first**: the app's Service Principal creates schemas and tables on first deploy. Grant yourself `databricks_superuser` for local development afterward:

```bash title="Common"
databricks psql --project my-project
# After connecting, grant yourself superuser for local development:
# GRANT databricks_superuser TO "<your-email>";
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch production \
  --endpoint primary \
  --debug \
  -o json \
  --target $TARGET \
  --autoscaling \
  --max-retries 3 \
  --profile $DATABRICKS_PROFILE \
  -- -c "
    CREATE EXTENSION IF NOT EXISTS databricks_auth;
    SELECT databricks_create_role('$USER_EMAIL', 'USER');
    GRANT databricks_superuser TO \"$USER_EMAIL\";
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

The [Lakebase Off-Platform](/resources/lakebase-off-platform) cookbook is a complete guide for using Lakebase from apps hosted outside Databricks. It includes:

- [Env Management](/resources/lakebase-off-platform#lakebase-env-management-for-off-platform-apps): how to obtain every connection value via CLI and validate with Zod
- [Token Management](/resources/lakebase-off-platform#lakebase-token-management): cached workspace and Lakebase credential refresh (tokens expire in ~1 hour)
- [Drizzle ORM](/resources/lakebase-off-platform#drizzle--lakebase-in-an-off-platform-app): connecting Drizzle to Lakebase with `pg` password callbacks and migration-time credentials

## Feature branches

Use Lakebase branches to isolate schema changes and test migrations without affecting production:

```bash title="Common"
databricks postgres create-branch projects/my-project feature-xyz
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{"spec": {"source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID", "no_expiry": true}}' \
  --debug \
  -o json \
  --target $TARGET \
  --no-wait \
  --timeout 10m \
  --profile $DATABRICKS_PROFILE
```

A `primary` read-write endpoint is created automatically, inheriting the project's `default_endpoint_settings`.

Delete when done:

```bash title="Common"
databricks postgres delete-branch projects/my-project/branches/feature-xyz
```

```bash title="All Options"
databricks postgres delete-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option      | Required | Description                                                        |
| ----------- | -------- | ------------------------------------------------------------------ |
| `NAME`      | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `--no-wait` | no       | Return immediately with operation details                          |
| `--timeout` | no       | Max time to wait for completion                                    |
| `--debug`   | no       | Enable debug logging                                               |
| `-o json`   | no       | Output as JSON (default: text)                                     |
| `--target`  | no       | Bundle target to use (if applicable)                               |
| `--profile` | no       | Databricks CLI profile name                                        |

## All Lakebase recipes

| Recipe                                                                                         | Description                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [Create a Lakebase Instance](/resources/app-with-lakebase#create-a-lakebase-instance)          | Provision a project, collect connection values |
| [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence)            | Schema setup, CRUD routes, deploy workflow     |
| [Lakebase Chat Persistence](/resources/ai-chat-app#lakebase-chat-persistence)                  | Chat/message schema on Lakebase                |
| [Lakehouse Sync (Lakebase Change Data Feed)](/resources#lakebase-change-data-feed-autoscaling) | Sync Lakebase to Unity Catalog                 |
| [Sync Tables](/resources#sync-tables-autoscaling)                                              | Unity Catalog to Lakebase                      |
| [Lakebase Off-Platform](/resources/lakebase-off-platform)                                      | Env, tokens, and Drizzle for off-platform apps |

## Source of truth

- [AppKit Lakebase plugin](/docs/appkit/v0/plugins/lakebase)
- [AppKit `@databricks/lakebase` README](https://github.com/databricks/appkit/blob/main/packages/lakebase/README.md)
- [Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/)
