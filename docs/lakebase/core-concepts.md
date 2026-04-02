---
title: Core Concepts
---

# Core Concepts

## Resource hierarchy

Lakebase organizes resources as **projects** containing **branches**, with branches containing **endpoints** (computes).

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}
        └── databases/{database_id}
```

- **Project**: top-level container. Created with `databricks postgres create-project`.
- **Branch**: isolated database environment. New projects get a default `production` branch with a `databricks_postgres` database.
- **Endpoint**: compute attached to a branch. Each branch has a `primary` read-write endpoint (`ENDPOINT_TYPE_READ_WRITE`) created automatically. Read-only replicas (`ENDPOINT_TYPE_READ_ONLY`) can be added for read scaling.
- **Database**: a PostgreSQL database within a branch. List with `databricks postgres list-databases <branch>`. See [Getting Started](/docs/lakebase/getting-started#get-connection-values) for example output.

IDs must be 1-63 characters, start with a lowercase letter, and contain only lowercase letters, numbers, and hyphens.

## Branching

Create a branch from an existing one to copy its schema and data:

```bash
databricks postgres create-branch \
  projects/$PROJECT_ID \
  feature \
  --json '{
    "spec": {
      "source_branch": "projects/$PROJECT_ID/branches/$BRANCH_ID",
      "no_expiry": true
    }
  }'
```

Each new branch automatically gets a `primary` read-write endpoint that inherits the project's `default_endpoint_settings`. Use `create-endpoint` to add read replicas (`ENDPOINT_TYPE_READ_ONLY`).

Delete when done: `databricks postgres delete-branch projects/$PROJECT_ID/branches/feature`

Branches require an expiration policy (`ttl`, `expire_time`, or `no_expiry: true`). See [branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) for details.

## Update masks

Update commands require an update mask specifying which fields to modify. The `--json` payload contains the new values; only masked fields change.

```bash
databricks postgres update-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

For multiple fields, use a comma-separated mask (see autoscaling example below).

## Autoscaling

Endpoints autoscale between a configured min and max compute unit (CU) range. Each CU provides approximately 2 GB of RAM. The default is 1 CU (min and max both set to 1).

| Range       | Behavior              |
| ----------- | --------------------- |
| 0.5 - 32 CU | Autoscaling supported |
| 36 - 112 CU | Fixed size only       |

The difference between max and min cannot exceed 16 CU (`max - min <= 16`).

```bash
databricks postgres update-endpoint \
  projects/$PROJECT_ID/branches/$BRANCH_ID/endpoints/$ENDPOINT_ID \
  "spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu" \
  --json '{"spec": {"autoscaling_limit_min_cu": 1.0, "autoscaling_limit_max_cu": 8.0}}'
```

Scaling within the configured range happens without connection interruptions. Changing the min/max configuration may cause a brief interruption.

## Scale to zero

Scale to zero suspends idle endpoints to eliminate compute costs. When a new query arrives, the endpoint resumes automatically (typically a few hundred milliseconds).

| Setting           | Default             |
| ----------------- | ------------------- |
| Timeout           | 5 minutes           |
| Minimum timeout   | 60 seconds          |
| Production branch | Disabled by default |
| Dev branches      | Enabled by default  |

Common pattern: keep production always-on, enable scale-to-zero on development branches.

When a compute resumes, session context resets (temporary tables, prepared statements, session settings, connection pools). Applications should implement connection retry logic.

Configure at the project level so new branches inherit the settings:

```bash
databricks postgres update-project \
  projects/$PROJECT_ID \
  "spec.default_endpoint_settings" \
  --json '{
    "spec": {
      "default_endpoint_settings": {
        "autoscaling_limit_min_cu": 0.5,
        "autoscaling_limit_max_cu": 1.0,
        "suspend_timeout_duration": "300s"
      }
    }
  }'
```

## Long-running operations

Create, update, and delete commands block until complete by default. Use `--no-wait` to return immediately and poll status:

```bash
databricks postgres create-project my-project \
  --json '{"spec": {"display_name": "My Project"}}' \
  --no-wait

databricks postgres get-operation projects/my-project/operations/<operation-id>
```

## Source of truth

- [Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
- [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling)
- [Scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero)
