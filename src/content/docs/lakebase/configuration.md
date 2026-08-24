---
title: Lakebase Postgres configuration
sidebar_label: Configuration
sourceOfTruth:
  skills:
    - databricks-lakebase
  docs:
    - /docs/appkit/v0/plugins/lakebase
    - https://docs.databricks.com/aws/en/oltp/projects/manage-projects
---

# Lakebase Postgres configuration

AppKit connects to Lakebase Postgres using a `postgres` resource declared in `databricks.yml` and `LAKEBASE_ENDPOINT` set in `app.yaml`.

This page covers the AppKit wiring. For Lakebase itself (projects, branches, autoscaling, scale to zero), see the [Lakebase docs](https://docs.databricks.com/aws/en/oltp/) or the [`databricks-lakebase`](/docs/tools/ai-tools/agent-skills) agent skill.

## Connection values

Databricks Apps injects most connection values at startup. `LAKEBASE_ENDPOINT` is the exception. It is declared in `app.yaml` via `valueFrom: postgres` and resolved at startup from the `postgres` resource:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

| Variable            | Description                                                        | Source                                      |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------- |
| `LAKEBASE_ENDPOINT` | Endpoint resource path (`projects/.../branches/.../endpoints/...`) | Set via `valueFrom: postgres` in `app.yaml` |
| `PGHOST`            | Lakebase Postgres host                                             | Auto-injected by the platform               |
| `PGDATABASE`        | PostgreSQL database name                                           | Auto-injected by the platform               |
| `PGSSLMODE`         | TLS mode (`require`)                                               | Auto-injected by the platform               |
| `PGPORT`            | Port (5432)                                                        | Auto-injected by the platform               |

For local development, these values come from your `.env` file. [Local setup](/docs/lakebase/development#local-setup) explains how to populate them.

## Plugin manifest

When you register the `lakebase()` plugin in `createApp`, AppKit generates `appkit.plugins.json` declaring the plugin's resource requirements. Run `npx @databricks/appkit plugin sync --write` to regenerate it after adding or changing plugins:

```bash
npx @databricks/appkit plugin sync --write
```

This runs automatically during `npm run dev` and `npm run build`. Commit it alongside your code.

The [AppKit configuration](/docs/appkit/v0/configuration) reference covers `app.yaml` plugin resource bindings in detail.

## Resource hierarchy

Lakebase Postgres organizes resources as **projects** containing **branches**, with branches containing **computes** and **databases**.

```text
projects/{project_id}
  └── branches/{branch_id}
        ├── endpoints/{endpoint_id}   (compute)
        └── databases/{database_id}
```

- **Project**: top-level container. Created with `databricks postgres create-project`.
- **Branch**: isolated database environment. New projects get a default `production` branch with a `databricks_postgres` database.
- **Compute**: provides processing power and memory for a branch. Each branch gets a `primary` read-write compute created automatically. Read-only replicas can be added for read scaling.
- **Database**: a PostgreSQL database within a branch. List with `databricks postgres list-databases <branch>`.

The CLI and API refer to computes as **endpoints** (`ENDPOINT_TYPE_READ_WRITE` for read-write, `ENDPOINT_TYPE_READ_ONLY` for read replicas). Commands and resource paths in this doc use that term.

The [`postgres` CLI reference](https://docs.databricks.com/aws/en/oltp/projects/cli) covers all `databricks postgres` commands.

## Branching

Branches create isolated database environments. When you branch, Lakebase Postgres copies the source branch's schema and data via copy-on-write. New branches are instant and you only pay for data you change.

Each new branch gets a `primary` read-write endpoint at `projects/{project_id}/branches/{branch_id}/endpoints/primary`, inheriting the project's `default_endpoint_settings`. Use `create-endpoint` to add read replicas (`ENDPOINT_TYPE_READ_ONLY`).

Branches require an expiration policy (`ttl`, `expire_time`, or `no_expiry: true`). [Branch expiration](https://docs.databricks.com/aws/en/oltp/projects/manage-branches#expiration) details all options. For CLI commands, [Feature branches](/docs/lakebase/development#feature-branches) has examples.

:::note
Project, branch, endpoint, and database IDs must be 1-63 characters, start with a lowercase letter, and contain only lowercase letters, numbers, and hyphens.
:::

## Autoscaling

Computes autoscale between a configured minimum and maximum compute unit (CU). You set the range per project or per endpoint. The default CU values, the maximum compute size, and the min/max constraint are Lakebase settings that change over time, so check [Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) for current values.

Scaling within the configured range happens without connection interruptions. Changing the minimum or maximum may cause a brief interruption.

<details>
<summary>Configure autoscaling</summary>

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

<!-- cli-options:postgres update-endpoint -->

| Option            | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `--json`          | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes)) |
| `--no-wait`       | do not wait to reach DONE state                                                            |
| `--timeout`       | maximum amount of time to reach DONE state                                                 |
| `--debug`         | enable debug logging                                                                       |
| `--output`, `-o`  | output type: text or json (default text)                                                   |
| `--profile`, `-p` | ~/.databrickscfg profile                                                                   |
| `--target`, `-t`  | bundle target to use (if applicable)                                                       |

<!-- /cli-options -->

</details>

## Scale to zero

[Scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero) suspends idle computes to eliminate costs. When a new query arrives, the compute resumes automatically (typically a few hundred milliseconds).

The default timeout is 24 hours. Set any value from 60 seconds to 7 days. For development branches, shorter timeouts (for example 30 minutes) reduce costs further. Apps connecting to a scaled-down compute will see a brief pause on the first query. Implement connection retry logic in your app.

When a compute resumes, session context resets (temporary tables, prepared statements, session settings, connection pools).

<details>
<summary>Configure scale to zero</summary>

The `300s` values below are illustrative custom timeouts, not the default (the default is 24 hours). Set any value from 60 seconds to 7 days.

**Project defaults** (new branches inherit these settings):

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

<!-- cli-options:postgres update-project -->

| Option            | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `--json`          | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes)) |
| `--no-wait`       | do not wait to reach DONE state                                                            |
| `--timeout`       | maximum amount of time to reach DONE state                                                 |
| `--debug`         | enable debug logging                                                                       |
| `--output`, `-o`  | output type: text or json (default text)                                                   |
| `--profile`, `-p` | ~/.databrickscfg profile                                                                   |
| `--target`, `-t`  | bundle target to use (if applicable)                                                       |

<!-- /cli-options -->

**Per-endpoint** (change or disable on an existing endpoint):

Use `spec.suspension` as the update mask for all suspension changes on `update-endpoint`.

```bash title="Change timeout"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"suspend_timeout_duration": "300s"}}'
```

```bash title="Disable scale to zero"
databricks postgres update-endpoint \
  projects/my-project/branches/production/endpoints/primary \
  "spec.suspension" \
  --json '{"spec": {"no_suspension": true}}'
```

:::note
Setting `no_suspension: false` is not supported and returns an error. To re-enable scale to zero after disabling it, set `suspend_timeout_duration` instead.
:::

</details>

## Where to next

See [Lakebase Postgres development](/docs/lakebase/development) for local setup, feature branches, and the full plugin API, or browse the [templates catalog](/templates) for complete patterns.
