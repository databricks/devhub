---
title: Projects, branches, and computes
sidebar_label: Projects, branches & computes
---

# Projects, branches, and computes

## Resource hierarchy

Lakebase organizes resources as **projects** containing **branches**, with branches containing **computes** and **databases**.

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

- **Project**: top-level container. Created with `databricks postgres create-project`.
- **Branch**: isolated database environment. New projects get a default `production` branch with a `databricks_postgres` database.
- **Compute**: provides processing power and memory for a branch. Each branch gets a `primary` read-write compute created automatically. Read-only replicas can be added for read scaling.
- **Database**: a PostgreSQL database within a branch. List with `databricks postgres list-databases <branch>`. See [Quickstart](/docs/lakebase/quickstart#get-connection-values) for example output.

The CLI and API refer to computes as **endpoints** (`ENDPOINT_TYPE_READ_WRITE` for read-write, `ENDPOINT_TYPE_READ_ONLY` for read replicas). Commands and resource paths in this doc use that term.

IDs must be 1-63 characters, start with a lowercase letter, and contain only lowercase letters, numbers, and hyphens.

## Branching

Branches create isolated database environments. When you branch, Lakebase copies the source branch's schema and data via copy-on-write. New branches are instant and you only pay for data you change.

Each new branch gets a `primary` read-write endpoint at `projects/{project_id}/branches/{branch_id}/endpoints/primary`, inheriting the project's `default_endpoint_settings`. Use `create-endpoint` to add read replicas (`ENDPOINT_TYPE_READ_ONLY`).

Branches require an expiration policy (`ttl`, `expire_time`, or `no_expiry: true`). See [branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) for details. For CLI commands, see [Feature branches](/docs/lakebase/development#feature-branches).

## Autoscaling

Computes autoscale between a configured min and max compute unit (CU) range. Each CU provides approximately 2 GB of RAM. Default settings by branch type when created via API or CLI:

- **Production branch**: 1 CU (min and max), scale to zero disabled.
- **Child branches**: 1 CU (min and max), scale to zero enabled (5-minute default).

The Lakebase UI sets higher defaults: 8–16 CU for production and 2–4 CU for child branches.

Autoscaling is supported from 0.5 to 32 CU; computes from 36 to 112 CU are fixed size. The difference between max and min cannot exceed 16 CU (`max - min <= 16`).

```bash title="Common"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" \
  --json '{"spec": {"autoscaling_limit_min_cu": 1.0, "autoscaling_limit_max_cu": 8.0}}'
```

```bash title="All Options"
databricks postgres update-endpoint \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  $UPDATE_MASK \
  --json '{"spec": {
    "autoscaling_limit_min_cu": 1.0,
    "autoscaling_limit_max_cu": 8.0
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

| Option        | Required | Description                                                                                         |
| ------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `NAME`        | yes      | Endpoint resource path: `projects/{project_id}/branches/{branch_id}/endpoints/{endpoint_id}`        |
| `UPDATE_MASK` | yes      | Comma-separated fields (for example, `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`) |
| `--json`      | yes      | JSON with new field values                                                                          |
| `--no-wait`   | no       | Return immediately with operation details                                                           |
| `--timeout`   | no       | Max time to wait for completion                                                                     |
| `--debug`     | no       | Enable debug logging                                                                                |
| `-o json`     | no       | Output as JSON (default: text)                                                                      |
| `--target`    | no       | Bundle target to use (if applicable)                                                                |
| `--profile`   | no       | Databricks CLI profile name                                                                         |

</details>

Scaling within the configured range happens without connection interruptions. Changing the min/max configuration may cause a brief interruption.

## Scale to zero

Scale to zero suspends idle computes to eliminate costs. When a new query arrives, the compute resumes automatically (typically a few hundred milliseconds).

| Setting         | Default    |
| --------------- | ---------- |
| Timeout         | 5 minutes  |
| Minimum timeout | 60 seconds |

When a compute resumes, session context resets (temporary tables, prepared statements, session settings, connection pools). Applications should implement connection retry logic.

Configure at the project level so new branches inherit the settings:

```bash title="Common"
databricks postgres update-project \
  projects/my-project \
  "spec.default_endpoint_settings" \
  --json '{"spec": {"default_endpoint_settings": {"suspend_timeout_duration": "300s"}}}'
```

```bash title="All Options"
databricks postgres update-project \
  projects/$PROJECT_ID \
  $UPDATE_MASK \
  --json '{
    "spec": {
      "default_endpoint_settings": {
        "autoscaling_limit_min_cu": 0.5,
        "autoscaling_limit_max_cu": 1.0,
        "suspend_timeout_duration": "300s"
      }
    }
  }' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option        | Required | Description                                                      |
| ------------- | -------- | ---------------------------------------------------------------- |
| `NAME`        | yes      | Project resource path: `projects/{project_id}`                   |
| `UPDATE_MASK` | yes      | Fields to update (for example, `spec.default_endpoint_settings`) |
| `--json`      | yes      | JSON with new field values                                       |
| `--no-wait`   | no       | Return immediately with operation details                        |
| `--timeout`   | no       | Max time to wait for completion                                  |
| `--debug`     | no       | Enable debug logging                                             |
| `-o json`     | no       | Output as JSON (default: text)                                   |
| `--target`    | no       | Bundle target to use (if applicable)                             |
| `--profile`   | no       | Databricks CLI profile name                                      |

</details>

## Long-running operations

Create, update, and delete commands block until complete by default. Use `--no-wait` to return immediately and poll status:

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```

## Related guides

| Guide                                                                         | Description                                             |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Sync Tables to Lakebase](/resources/sync-tables-autoscaling)                 | Sync Unity Catalog tables into Lakebase Autoscaling     |
| [Lakehouse Sync (CDC)](/resources/lakebase-change-data-feed-autoscaling)      | Change data feed from Lakebase to Unity Catalog         |
| [Medallion Architecture from CDC](/resources/medallion-architecture-from-cdc) | Bronze/silver/gold pipeline from Lakehouse Sync history |

## Further reading

- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
- [Command references: `postgres`](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands) and [`psql`](https://docs.databricks.com/aws/en/dev-tools/cli/reference/psql-command)
- [About Lakebase](https://docs.databricks.com/aws/en/oltp/projects/about)
- [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling)
- [Scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero)
