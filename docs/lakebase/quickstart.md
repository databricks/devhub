---
title: Quickstart
---

# Quickstart

[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) is Databricks managed PostgreSQL for OLTP workloads that need low-latency, transactional access alongside your Lakehouse data. It supports instant branching for isolated database environments that share storage via copy-on-write, and runs co-located with your Databricks workspace.

DevHub is organized around [guides and examples](/resources). These companion docs explain Lakebase when you or your agent need platform detail beyond a guide. For how the site fits together, see [Start here](/docs/start-here).

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- `psql` (PostgreSQL client) if using `databricks psql`. Alternatively, use `generate-database-credential` with any PostgreSQL client.
- Workspace with Lakebase access enabled

## Build an app with Lakebase

The fastest path is to copy a [resource guide](/resources) into your coding agent and describe what you want to build. [Start here](/docs/start-here) for the full workflow.

| Guide                                                               | Best for                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| [App with Lakebase](/resources/app-with-lakebase)                   | CRUD apps with persistent storage                     |
| [AI Chat App](/resources/ai-chat-app)                               | Conversational AI with chat history                   |
| [Operational Data Analytics](/resources/operational-data-analytics) | Bidirectional sync between Lakebase and Unity Catalog |

Each guide includes the [Create a Lakebase Instance](/resources/lakebase-create-instance) resource, which walks through project creation and connection value collection.

To scaffold manually with the CLI, run `databricks apps init` and select the **Lakebase** plugin when prompted. See [Apps Plugins](/docs/apps/plugins) for details.

## Customize your app

After deploying a Lakebase-backed app, consider the following customizations:

- **Add tables**: Follow the [Lakebase Data Persistence](/resources/lakebase-data-persistence) guide to define schemas, generate types, and create CRUD routes.
- **Add chat persistence**: Use the [Lakebase Chat Persistence](/resources/lakebase-chat-persistence) guide to store conversations.
- **Use feature branches**: Create isolated branches for development and testing. See [Development: Feature branches](/docs/lakebase/development#feature-branches).
- **Sync data to/from Unity Catalog**: Use [Lakehouse Sync (CDC)](/resources/lakebase-change-data-feed-autoscaling) to replicate Lakebase tables into Delta, or [Sync Tables](/resources/sync-tables-autoscaling) to serve Unity Catalog data through Lakebase.
- **Deploy outside Databricks**: Use the [Lakebase Off-Platform](/resources/lakebase-off-platform) guide for apps hosted on AWS, Vercel, Netlify, and others.

To wire Lakebase into an app, see [App integration and development](/docs/lakebase/development).

## Manual provisioning

Use the following commands to provision Lakebase without a guide.

### Create a project

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

<details>
<summary>Options</summary>

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

</details>

The optional `display_name` sets a human-readable label. This creates a project with a default `production` branch, a `databricks_postgres` database, and a read-write endpoint.

### Get connection values

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

<details>
<summary>Options</summary>

| Option         | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `PARENT`       | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `-o json`      | no       | Output as JSON (default: text)                                     |
| `--page-size`  | no       | Max items per page (must be at least `10` if set)                  |
| `--page-token` | no       | Pagination token for next page                                     |
| `--debug`      | no       | Enable debug logging                                               |
| `--target`     | no       | Bundle target to use (if applicable)                               |
| `--profile`    | no       | Databricks CLI profile name                                        |

</details>

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

<details>
<summary>Options</summary>

| Option         | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `PARENT`       | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}` |
| `-o json`      | no       | Output as JSON (default: text)                                     |
| `--page-size`  | no       | Max items per page                                                 |
| `--page-token` | no       | Pagination token for next page                                     |
| `--debug`      | no       | Enable debug logging                                               |
| `--target`     | no       | Bundle target to use (if applicable)                               |
| `--profile`    | no       | Databricks CLI profile name                                        |

</details>

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

### Connect

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

<details>
<summary>Options</summary>

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

</details>

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

<details>
<summary>Options</summary>

| Option      | Required | Description                                                                                  |
| ----------- | -------- | -------------------------------------------------------------------------------------------- |
| `ENDPOINT`  | yes      | Endpoint resource path: `projects/{project_id}/branches/{branch_id}/endpoints/{endpoint_id}` |
| `--json`    | no       | Inline JSON or `@path/to/file.json` with request body                                        |
| `--debug`   | no       | Enable debug logging                                                                         |
| `-o json`   | no       | Output as JSON (default: text)                                                               |
| `--target`  | no       | Bundle target to use (if applicable)                                                         |
| `--profile` | no       | Databricks CLI profile name                                                                  |

</details>

Use the returned token as the password, with your Databricks email as the username and the endpoint host from `list-endpoints` above.

## Next steps

See [App integration and development](/docs/lakebase/development) for integrating Lakebase into your app, local development, infrastructure-as-code with Bundles, and troubleshooting.

## Further reading

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Get started with Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/get-started)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
- [`postgres` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands)
- [`psql` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/psql-command)
