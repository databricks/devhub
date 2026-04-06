---
title: Core Concepts
---

# Core Concepts

## App model

A Databricks App is a serverless containerized web application running inside your workspace. Each app gets a fixed URL:

```text
https://<app-name>-<workspace-id>.<region>.databricksapps.com
```

The URL is assigned at creation and cannot be changed.

## Configuration files

Apps use two configuration files:

**`app.yaml`** controls runtime behavior (startup command and environment variables):

```yaml
command: ["npm", "run", "start"]
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
```

The `command` is a sequence (array), not a shell string. Environment variable expansion is not supported in `command` except for `DATABRICKS_APP_PORT`.

**`databricks.yml`** declares Databricks resources, variables, and deployment targets:

```yaml
resources:
  apps:
    my-app:
      resources:
        - name: postgres
          postgres:
            branch: ${var.postgres_branch}
            database: ${var.postgres_database}
            permission: CAN_CONNECT_AND_CREATE
```

Variables like `${var.postgres_branch}` are resolved from the `variables` section of `databricks.yml` or from CLI flags at deploy time.

## Resources

Apps access Databricks services through declared resources. Declare resources in `databricks.yml` and bind them to environment variables in `app.yaml` using `valueFrom`. Common resource types used in AppKit templates:

| Resource      | `valueFrom` key    | What it provides               |
| ------------- | ------------------ | ------------------------------ |
| Lakebase      | `postgres`         | PostgreSQL connection          |
| SQL Warehouse | `sql-warehouse`    | SQL query execution            |
| Model Serving | `serving-endpoint` | AI model inference             |
| Genie         | `genie-space`      | Natural language data queries  |
| Job           | `job`              | Scheduled or triggered job     |
| UC Volumes    | `volume`           | File storage                   |
| Secrets       | `secret`           | Sensitive configuration values |

Additional resource types (Unity Catalog tables, connections, vector search indexes, MLflow experiments, and others) are listed in the [official resources documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources).

## Environment variables

The platform injects these variables automatically at runtime:

| Variable                   | Description                     |
| -------------------------- | ------------------------------- |
| `DATABRICKS_HOST`          | Workspace URL                   |
| `DATABRICKS_APP_PORT`      | Port your app must listen on    |
| `DATABRICKS_APP_NAME`      | App name                        |
| `DATABRICKS_CLIENT_ID`     | Service principal client ID     |
| `DATABRICKS_CLIENT_SECRET` | Service principal client secret |
| `DATABRICKS_WORKSPACE_ID`  | Workspace ID                    |

Custom variables go in `app.yaml` under `env`. Use `value` for plain values, `valueFrom` for resource bindings and secrets. Never put secrets in `value`.

## Auth model

Each app gets a dedicated **service principal** with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET` injected at runtime. The service principal is created automatically and deleted when the app is deleted.

**User authorization** (Public Preview) forwards the signed-in user's token via the `x-forwarded-access-token` HTTP header. Scopes (e.g., `sql`, `dashboards.genie`, `files.files`) are configured in the workspace UI. See [app authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) for details.

## Deploy pipeline

When you run `databricks apps deploy`, the platform:

1. Detects `package.json` and runs `npm install`
2. Installs Python dependencies via `pip` if `requirements.txt` exists, or via `uv sync` if both `pyproject.toml` and `uv.lock` exist
3. Runs `npm run build` if a `build` script is defined
4. Starts the app using the `command` from `app.yaml` (defaults to `npm run start` for Node apps)

Your app must bind to `0.0.0.0` on the port specified by `DATABRICKS_APP_PORT`.

## Compute

| Size   | vCPU    | RAM   | DBU/h |
| ------ | ------- | ----- | ----- |
| Medium | Up to 2 | 6 GB  | 0.5   |
| Large  | Up to 4 | 12 GB | 1.0   |

Medium is the default. Compute size is configured in the workspace UI (not available via CLI).

## Constraints

- No durable filesystem (use Lakebase, DBSQL, or UC Volumes for persistence)
- Files larger than 10 MB fail deployment
- SIGTERM gives 15 seconds before SIGKILL
- Runtime: Ubuntu 22.04, Node 22, Python 3.11

## App statuses

| Status    | Meaning                            |
| --------- | ---------------------------------- |
| Running   | App is healthy and serving traffic |
| Deploying | New deployment is in progress      |
| Crashed   | App failed to start or exited      |
| Stopped   | App was manually stopped           |

## Source of truth

- [App key concepts](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/key-concepts)
- [App runtime (app.yaml)](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
- [App resources](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/resources)
- [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth)
- [System environment](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/system-env)
- [Deploy](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
- [Best practices](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices)
