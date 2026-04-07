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

```bash title="Common"
databricks postgres create-branch projects/my-project feature
```

```bash title="All Options"
databricks postgres create-branch \
  projects/$PROJECT_ID \
  $BRANCH_ID \
  --json '{
    "spec": {
      "source_branch": "projects/$PROJECT_ID/branches/$SOURCE_BRANCH_ID",
      "no_expiry": true
    }
  }' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option      | Required | Description                                                                                                                                                                 |
| ----------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PARENT`    | yes      | Project resource path: `projects/{project_id}`                                                                                                                              |
| `BRANCH_ID` | yes      | Unique branch identifier (1-63 chars, lowercase)                                                                                                                            |
| `--json`    | no       | JSON spec with `source_branch` and expiration policy (`no_expiry`, `ttl`, or `expire_time`). If omitted, branches from the project's default branch with default expiration |
| `--no-wait` | no       | Return immediately with operation details                                                                                                                                   |
| `--timeout` | no       | Max time to wait for completion                                                                                                                                             |
| `--debug`   | no       | Enable debug logging                                                                                                                                                        |
| `-o json`   | no       | Output as JSON (default: text)                                                                                                                                              |
| `--target`  | no       | Bundle target to use (if applicable)                                                                                                                                        |
| `--profile` | no       | Databricks CLI profile name                                                                                                                                                 |

Each new branch automatically gets a `primary` read-write endpoint that inherits the project's `default_endpoint_settings`. Use `create-endpoint` to add read replicas (`ENDPOINT_TYPE_READ_ONLY`).

Delete when done: `databricks postgres delete-branch projects/my-project/branches/feature`

Branches require an expiration policy (`ttl`, `expire_time`, or `no_expiry: true`). See [branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) for details.

## Update masks

Update commands require an update mask specifying which fields to modify. The `--json` payload contains the new values; only masked fields change.

```bash title="Common"
databricks postgres update-branch \
  projects/my-project/branches/production \
  spec.is_protected \
  --json '{"spec": {"is_protected": true}}'
```

```bash title="All Options"
databricks postgres update-branch \
  projects/$PROJECT_ID/branches/$BRANCH_ID \
  $UPDATE_MASK \
  --json '{"spec": {"is_protected": true}}' \
  --no-wait \
  --timeout 10m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

| Option        | Required | Description                                                         |
| ------------- | -------- | ------------------------------------------------------------------- |
| `NAME`        | yes      | Branch resource path: `projects/{project_id}/branches/{branch_id}`  |
| `UPDATE_MASK` | yes      | Comma-separated list of fields to update (e.g. `spec.is_protected`) |
| `--json`      | yes      | JSON with new field values                                          |
| `--no-wait`   | no       | Return immediately with operation details                           |
| `--timeout`   | no       | Max time to wait for completion                                     |
| `--debug`     | no       | Enable debug logging                                                |
| `-o json`     | no       | Output as JSON (default: text)                                      |
| `--target`    | no       | Bundle target to use (if applicable)                                |
| `--profile`   | no       | Databricks CLI profile name                                         |

For multiple fields, use a comma-separated mask (see autoscaling example below).

## Autoscaling

Endpoints autoscale between a configured min and max compute unit (CU) range. Each CU provides approximately 2 GB of RAM. The default is 1 CU (min and max both set to 1).

| Range       | Behavior              |
| ----------- | --------------------- |
| 0.5 - 32 CU | Autoscaling supported |
| 36 - 112 CU | Fixed size only       |

The difference between max and min cannot exceed 16 CU (`max - min <= 16`).

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

| Option        | Required | Description                                                                                  |
| ------------- | -------- | -------------------------------------------------------------------------------------------- |
| `NAME`        | yes      | Endpoint resource path: `projects/{project_id}/branches/{branch_id}/endpoints/{endpoint_id}` |
| `UPDATE_MASK` | yes      | Comma-separated fields (e.g. `spec.autoscaling_limit_min_cu,spec.autoscaling_limit_max_cu`)  |
| `--json`      | yes      | JSON with new field values                                                                   |
| `--no-wait`   | no       | Return immediately with operation details                                                    |
| `--timeout`   | no       | Max time to wait for completion                                                              |
| `--debug`     | no       | Enable debug logging                                                                         |
| `-o json`     | no       | Output as JSON (default: text)                                                               |
| `--target`    | no       | Bundle target to use (if applicable)                                                         |
| `--profile`   | no       | Databricks CLI profile name                                                                  |

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

| Option        | Required | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| `NAME`        | yes      | Project resource path: `projects/{project_id}`           |
| `UPDATE_MASK` | yes      | Fields to update (e.g. `spec.default_endpoint_settings`) |
| `--json`      | yes      | JSON with new field values                               |
| `--no-wait`   | no       | Return immediately with operation details                |
| `--timeout`   | no       | Max time to wait for completion                          |
| `--debug`     | no       | Enable debug logging                                     |
| `-o json`     | no       | Output as JSON (default: text)                           |
| `--target`    | no       | Bundle target to use (if applicable)                     |
| `--profile`   | no       | Databricks CLI profile name                              |

## Pagination

`databricks postgres list-endpoints` accepts `--page-size` and `--page-token`. When you pass `--page-size`, the workspace API requires it to be **at least 10** (smaller values return an error). Omit the flag to use default paging behavior. Other `postgres list-*` commands document their own rules; see the [`postgres` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands).

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
- [`postgres` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands)
- [`psql` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/psql-command)
- [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling)
- [Scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero)
