---
title: Getting started
---

# Getting started

[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) is Databricks managed PostgreSQL for OLTP workloads that need low-latency, transactional access alongside your Lakehouse data.

DevHub centers on [templates and recipes](/resources). These companion docs explain Lakebase when you need platform detail beyond a template. For how the site fits together, see [Start here](/docs/start-here).

## Prerequisites

- Databricks CLI `v0.295+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- `psql` (PostgreSQL client) if using `databricks psql`. Alternatively, use `generate-database-credential` with any PostgreSQL client.
- Workspace with Lakebase access enabled

## Create a project

```bash title="Common"
databricks postgres create-project my-project
```

```bash title="All Options"
databricks postgres create-project $PROJECT_ID \
  --json '{"spec": {
    "display_name": "My Lakebase Project",
    "pg_version": 17,
    "history_retention_duration": "172800s",
    "default_endpoint_settings": {
      "autoscaling_limit_min_cu": 0.5,
      "autoscaling_limit_max_cu": 1.0,
      "suspend_timeout_duration": "300s"
    }
  }}' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option       | Required | Description                                                                                                                                     |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROJECT_ID` | yes      | Unique project identifier (1-63 chars, lowercase letter start, lowercase/numbers/hyphens)                                                       |
| `--json`     | no       | Inline JSON or `@path/to/file.json` with project spec (`display_name`, `pg_version`, `history_retention_duration`, `default_endpoint_settings`) |
| `--no-wait`  | no       | Return immediately with operation details instead of waiting for completion                                                                     |
| `--timeout`  | no       | Max time to wait for completion (for example, `10m`). Ignored with `--no-wait`                                                                  |
| `--debug`    | no       | Enable debug logging                                                                                                                            |
| `-o json`    | no       | Output as JSON (default: text)                                                                                                                  |
| `--target`   | no       | Bundle target to use (if applicable)                                                                                                            |
| `--profile`  | no       | Databricks CLI profile name                                                                                                                     |

The optional `display_name` sets a human-readable label. This creates a project with a default `production` branch, a `databricks_postgres` database, and a read-write endpoint.

## Get connection values

```bash title="Common"
databricks postgres list-endpoints projects/my-project/branches/production -o json
```

```bash title="All Options"
databricks postgres list-endpoints \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  -o json \
  --page-size 100 \
  --page-token "$PAGE_TOKEN" \
  --debug \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option         | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `PARENT`       | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `-o json`      | no       | Output as JSON (default: text)                                     |
| `--page-size`  | no       | Max items per page (must be at least `10` if set)                  |
| `--page-token` | no       | Pagination token for next page                                     |
| `--debug`      | no       | Enable debug logging                                               |
| `--target`     | no       | Bundle target to use (if applicable)                               |
| `--profile`    | no       | Databricks CLI profile name                                        |

<details>
<summary>Example response</summary>

```json
[
  {
    "create_time": "2026-01-15T10:30:00Z",
    "name": "projects/my-project/branches/production/endpoints/primary",
    "parent": "projects/my-project/branches/production",
    "status": {
      "autoscaling_limit_max_cu": 1,
      "autoscaling_limit_min_cu": 1,
      "current_state": "ACTIVE",
      "disabled": false,
      "endpoint_type": "ENDPOINT_TYPE_READ_WRITE",
      "group": {
        "enable_readable_secondaries": false,
        "max": 1,
        "min": 1
      },
      "hosts": {
        "host": "ep-cool-breeze-abc123.database.cloud.databricks.com"
      },
      "settings": {}
    },
    "uid": "ep-cool-breeze-abc123",
    "update_time": "2026-01-15T10:31:00Z"
  }
]
```

</details>

```bash title="Common"
databricks postgres list-databases projects/my-project/branches/production -o json
```

```bash title="All Options"
databricks postgres list-databases \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  -o json \
  --page-size 100 \
  --page-token "$PAGE_TOKEN" \
  --debug \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option         | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `PARENT`       | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `-o json`      | no       | Output as JSON (default: text)                                     |
| `--page-size`  | no       | Max items per page                                                 |
| `--page-token` | no       | Pagination token for next page                                     |
| `--debug`      | no       | Enable debug logging                                               |
| `--target`     | no       | Bundle target to use (if applicable)                               |
| `--profile`    | no       | Databricks CLI profile name                                        |

<details>
<summary>Example response</summary>

```json
[
  {
    "create_time": "2026-01-15T10:30:00Z",
    "name": "projects/my-project/branches/production/databases/db-abc123",
    "parent": "projects/my-project/branches/production",
    "status": {
      "postgres_database": "databricks_postgres",
      "role": "projects/my-project/branches/production/roles/rol-xyz789"
    },
    "update_time": "2026-01-15T10:30:05Z"
  }
]
```

</details>

Key values from the output:

| Value                    | JSON path                    | Used for                     |
| ------------------------ | ---------------------------- | ---------------------------- |
| Endpoint host            | `status.hosts.host`          | `PGHOST`                     |
| Endpoint resource path   | `name`                       | `LAKEBASE_ENDPOINT`          |
| Database resource path   | `name` (from list-databases) | `lakebase.postgres.database` |
| PostgreSQL database name | `status.postgres_database`   | `PGDATABASE`                 |

## Connect

The simplest way to connect is with `databricks psql`:

```bash title="Common"
databricks psql --project my-project
```

```bash title="All Options"
databricks psql \
  --project $PROJECT_ID \
  --branch $BRANCH_ID \
  --endpoint $ENDPOINT_ID \
  --autoscaling \
  --max-retries 3 \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE \
  -- -c "SELECT 1"
```

| Option          | Required | Description                                                                                       |
| --------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `--project`     | no       | Project ID. With a TTY, omit to choose from prompts. In CI or scripts, set explicitly when needed |
| `--branch`      | no       | Branch ID (default: auto-select when only one exists)                                             |
| `--endpoint`    | no       | Endpoint ID (default: auto-select when only one exists)                                           |
| `--autoscaling` | no       | Only show Lakebase Autoscaling projects                                                           |
| `--provisioned` | no       | Only show Lakebase Provisioned instances                                                          |
| `--max-retries` | no       | Connection retries, 0 to disable (default: 3)                                                     |
| `--debug`       | no       | Enable debug logging                                                                              |
| `-o json`       | no       | Output as JSON (default: text)                                                                    |
| `--target`      | no       | Bundle target to use (if applicable)                                                              |
| `--profile`     | no       | Databricks CLI profile name                                                                       |
| `-- PSQL_ARGS`  | no       | Additional arguments passed through to `psql`                                                     |

Without a TTY (for example in CI), the CLI auto-selects when only one branch or endpoint exists. When multiple exist, specify `--project`, `--branch`, and `--endpoint` explicitly so the command does not block on prompts.

If you don't have a `psql` client installed, generate a short-lived credential and use it with any PostgreSQL client (DBeaver, pgAdmin, DataGrip, or a language driver):

```bash title="Common"
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/primary
```

```bash title="All Options"
databricks postgres generate-database-credential \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  --json '{}' \
  --debug \
  --target $TARGET \
  -o json \
  --profile $DATABRICKS_PROFILE
```

| Option      | Required | Description                                                                                  |
| ----------- | -------- | -------------------------------------------------------------------------------------------- |
| `ENDPOINT`  | yes      | Endpoint resource path: `projects/{project_id}/branches/{branch_id}/endpoints/{endpoint_id}` |
| `--json`    | no       | Inline JSON or `@path/to/file.json` with request body                                        |
| `--debug`   | no       | Enable debug logging                                                                         |
| `-o json`   | no       | Output as JSON (default: text)                                                               |
| `--target`  | no       | Bundle target to use (if applicable)                                                         |
| `--profile` | no       | Databricks CLI profile name                                                                  |

Use the returned token as the password, with your Databricks email as the username and the endpoint host from `list-endpoints` above.

## Build an app with Lakebase

The fastest path is to use a [template](/resources) with an AI coding agent. Copy a template into your agent and describe what you want to build. [Start here](/docs/start-here) for the full workflow.

| Template                                                  | Best for                                                 |
| --------------------------------------------------------- | -------------------------------------------------------- |
| [App with Lakebase](/resources/app-with-lakebase)         | CRUD apps with persistent storage                        |
| [AI Chat App](/resources/ai-chat-app)                     | Conversational AI with chat history                      |
| [Lakebase Off-Platform](/resources/lakebase-off-platform) | Apps hosted outside Databricks (AWS, Vercel, and others) |

Each cookbook includes the [Create a Lakebase Instance](/resources/app-with-lakebase#create-a-lakebase-instance) recipe, which walks through project creation and connection value collection in detail.

To scaffold manually with the CLI, run `databricks apps init` and select the **Lakebase** plugin when prompted. See [Apps Plugins](/docs/apps/plugins) for details.

## Customize the template

After deploying a Lakebase-backed app, consider the following customizations:

- **Add tables**: Follow the [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence) recipe to define schemas, generate types, and create CRUD routes.
- **Add chat persistence**: Use the [Lakebase Chat Persistence](/resources/ai-chat-app#lakebase-chat-persistence) recipe to store conversations.
- **Use feature branches**: Create isolated branches for development and testing. See [Development: Feature branches](/docs/lakebase/development#feature-branches).
- **Sync data to/from Unity Catalog**: Use [Lakehouse Sync](/resources/app-with-lakebase#lakehouse-sync-change-data-feed-from-lakebase-autoscaling) or [Sync Tables](/resources/app-with-lakebase#sync-tables-to-lakebase-autoscaling).

## Related cookbooks

| Cookbook                                                  | Description                         |
| --------------------------------------------------------- | ----------------------------------- |
| [App with Lakebase](/resources/app-with-lakebase)         | CRUD app with Lakebase persistence  |
| [AI Chat App](/resources/ai-chat-app)                     | Conversational AI with chat history |
| [Lakebase Off-Platform](/resources/lakebase-off-platform) | Apps hosted outside Databricks      |

## Further reading

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Get started with Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/get-started)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
- [`postgres` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands)
- [`psql` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/psql-command)
