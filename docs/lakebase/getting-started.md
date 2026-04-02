---
title: Getting Started
---

# Getting Started

[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) is Databricks managed PostgreSQL for OLTP workloads that need low-latency, transactional access alongside your Lakehouse data.

## Prerequisites

- Databricks CLI `v0.295+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- `psql` (PostgreSQL client) if using `databricks psql`. Alternatively, use `generate-database-credential` with any PostgreSQL client.
- workspace with Lakebase access enabled

## Create a project

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Lakebase Project"}}'
```

The optional `display_name` sets a human-readable label. This creates a project with a default `production` branch, a `databricks_postgres` database, and a read-write endpoint.

## Get connection values

```bash
databricks postgres list-endpoints projects/my-project/branches/production -o json
```

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

```bash
databricks postgres list-databases projects/my-project/branches/production -o json
```

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

```bash
databricks psql --project my-project
```

This auto-selects the branch and endpoint when only one exists. To skip selection (CI, agents), specify all three:

```bash
databricks psql --project my-project --branch production --endpoint primary
```

If you don't have a `psql` client installed, generate a short-lived credential and use it with any PostgreSQL client (DBeaver, pgAdmin, DataGrip, or a language driver):

```bash
databricks postgres generate-database-credential \
  projects/my-project/branches/production/endpoints/<endpoint-id>
```

Use the returned token as the password, with your Databricks email as the username and the endpoint host from `list-endpoints` above.

## Build an app with Lakebase

The fastest path is to use a [template](/resources) with an AI coding agent. Copy a template into your agent and describe what you want to build. See [Your First App](/docs/get-started/your-first-app) for the full workflow.

| Template                                                                        | Best for                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------- |
| [Data App Template](/resources/data-app-template)                               | CRUD apps with persistent storage                  |
| [AI Chat App Template](/resources/ai-chat-app-template)                         | Conversational AI with chat history                |
| [Analytics Dashboard App Template](/resources/analytics-dashboard-app-template) | Dashboards and reporting                           |
| [AI Data Explorer Template](/resources/ai-data-explorer-template)               | Full-stack AI + data exploration                   |
| [Lakebase Off-Platform](/resources/lakebase-off-platform-template)              | Apps hosted outside Databricks (AWS, Vercel, etc.) |

Each template includes the [Create a Lakebase Instance](/resources/data-app-template#create-a-lakebase-instance) recipe, which walks through project creation and connection value collection in detail.

To scaffold manually with the CLI, run `databricks apps init` and select the **Lakebase** plugin when prompted. See [Apps Plugins](/docs/apps/plugins) for details.

## Source of truth

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Get started with Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/get-started)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
