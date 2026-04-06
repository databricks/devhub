---
title: Development
---

# Development

## Local development

After scaffolding an app with `databricks apps init`, start the dev server:

```bash
cd my-app
npm install
npm run dev
```

This starts Vite (client hot reload) and Express (server with watch mode). AppKit reads environment variables from `.env` in the project root for local connections to workspace resources.

Example `.env` for an app with Lakebase:

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

## Deploy

```bash title="Common"
databricks apps deploy
```

```bash title="All Options"
databricks apps deploy $APP_NAME \
  --deployment-id $DEPLOYMENT_ID \
  --json @$CONFIG_FILE \
  --source-code-path $SOURCE_PATH \
  --mode SNAPSHOT \
  --skip-validation \
  --skip-tests \
  --force \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

| Option               | Required | Description                                                                                |
| -------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `APP_NAME`           | no       | App name. Omit when running from a project directory (auto-detected from `databricks.yml`) |
| `--skip-validation`  | no       | Skip project validation (build, typecheck, lint)                                           |
| `--skip-tests`       | no       | Skip running tests during validation (default: true)                                       |
| `--force`            | no       | Force-override Git branch validation                                                       |
| `--no-wait`          | no       | Return immediately instead of waiting for SUCCEEDED state                                  |
| `--timeout`          | no       | Max time to wait for completion (default: 20m)                                             |
| `--mode`             | no       | Source code mode: `AUTO_SYNC` or `SNAPSHOT`                                                |
| `--deployment-id`    | no       | Unique deployment identifier                                                               |
| `--source-code-path` | no       | Workspace file system path for source code                                                 |
| `--json`             | no       | Inline JSON or `@path/to/file.json` with request body                                      |
| `--debug`            | no       | Enable debug logging                                                                       |
| `-o json`            | no       | Output as JSON (default: text)                                                             |
| `--target`           | no       | Bundle target to use (if applicable)                                                       |
| `--var`              | no       | Set values for bundle config variables (e.g. `--var="key=value"`)                          |
| `--profile`          | no       | Databricks CLI profile name                                                                |

The CLI validates configuration, builds the project, uploads it, and starts the app. No `--source-code-path` is needed when deploying from a scaffolded AppKit project.

### Verify the deployment

Check that the app deployed successfully:

```bash title="Common"
databricks apps get my-app -o json
```

```bash title="All Options"
databricks apps get $APP_NAME \
  -o json \
  --debug \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

| Option      | Required | Description                                                       |
| ----------- | -------- | ----------------------------------------------------------------- |
| `NAME`      | yes      | App name                                                          |
| `-o json`   | no       | Output as JSON                                                    |
| `--debug`   | no       | Enable debug logging                                              |
| `--target`  | no       | Bundle target to use (if applicable)                              |
| `--var`     | no       | Set values for bundle config variables (e.g. `--var="key=value"`) |
| `--profile` | no       | Databricks CLI profile name                                       |

<details>
<summary>Example output</summary>

```json
{
  "name": "my-app",
  "url": "https://my-app-1234567890.us-west-2.databricksapps.com",
  "description": "A Databricks App powered by AppKit",
  "compute_size": "MEDIUM",
  "app_status": {
    "message": "App has status: App is running",
    "state": "RUNNING"
  },
  "compute_status": {
    "message": "App compute is running.",
    "state": "ACTIVE"
  },
  "active_deployment": {
    "deployment_id": "a1b2c3d4e5f6",
    "source_code_path": "/Workspace/Users/you@example.com/.bundle/my-app/default/files",
    "status": {
      "message": "App started successfully",
      "state": "SUCCEEDED"
    }
  },
  "resources": [
    {
      "name": "postgres",
      "postgres": {
        "branch": "projects/my-project/branches/production",
        "database": "projects/my-project/branches/production/databases/db-abc123",
        "permission": "CAN_CONNECT_AND_CREATE"
      }
    }
  ],
  "service_principal_client_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

</details>

View logs:

```bash title="Common"
databricks apps logs my-app
```

```bash title="All Options"
databricks apps logs $APP_NAME \
  --follow \
  --tail-lines 200 \
  --timeout 5m \
  --source APP \
  --search "$SEARCH_TERM" \
  --output-file $LOG_FILE \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

| Option            | Required | Description                                                         |
| ----------------- | -------- | ------------------------------------------------------------------- |
| `NAME`            | no       | App name. Omit from project directory (auto-detected)               |
| `-f` / `--follow` | no       | Stream logs until interrupted                                       |
| `--tail-lines`    | no       | Recent log lines to show before streaming (default: 200, 0 for all) |
| `--timeout`       | no       | Max streaming time with `--follow` (0 disables)                     |
| `--search`        | no       | Search term to filter logs                                          |
| `--source`        | no       | Filter by source: `APP`, `SYSTEM`, or both                          |
| `--output-file`   | no       | File path to write logs (in addition to stdout)                     |
| `--debug`         | no       | Enable debug logging                                                |
| `-o json`         | no       | Output as JSON (default: text)                                      |
| `--target`        | no       | Bundle target to use (if applicable)                                |
| `--var`           | no       | Set values for bundle config variables (e.g. `--var="key=value"`)   |
| `--profile`       | no       | Databricks CLI profile name                                         |

<details>
<summary>Example log output</summary>

```text
[SYSTEM] [INFO] Starting Databricks Apps runtime...
[SYSTEM] [INFO] Starting deployment a1b2c3d4e5f6...
[SYSTEM] [INFO] Downloading source code from /Workspace/Users/.../src/a1b2c3d4e5f6
[SYSTEM] [INFO] Installing dependencies...
[BUILD] added 899 packages, and audited 900 packages in 21s
[SYSTEM] [INFO] Dependencies installed successfully.
[SYSTEM] [INFO] Running build script npm run build:server && npm run build:client
[BUILD] ✔ Build complete in 30ms
[BUILD] ✓ built in 2.80s
[SYSTEM] [INFO] Build completed successfully.
[SYSTEM] [INFO] Starting app with command: [npm run start]
[APP] [appkit:lakebase] Lakebase pool initialized
[APP] [appkit:server] Server running on http://0.0.0.0:8000
[APP] [appkit:server] Mode: production (static)
```

</details>

## Environment configuration

**Local** (`npm run dev`): variables from `.env` in the project root.

**Deployed**: variables from `app.yaml` `env` entries. Use `value` for plain strings and `valueFrom` for resource bindings:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

Resources referenced by `valueFrom` must be declared in `databricks.yml`. See [Core Concepts](/docs/apps/core-concepts#resources) for the full resource list.

## Database permissions (Lakebase)

When using Lakebase locally, grant the `databricks_superuser` role so your local session has the same permissions as the deployed service principal:

```sql
GRANT databricks_superuser TO "<your-email>";
```

See [Lakebase Development](/docs/lakebase/development#local-access) for the full local access workflow.

## Pre-deploy checklist

Before deploying to production:

- App binds to `0.0.0.0` on `DATABRICKS_APP_PORT`
- `app.yaml` command uses array syntax (no shell strings)
- No files larger than 10 MB in the project
- Secrets use `valueFrom` (never `value`)
- `databricks.yml` declares all required resources
- `npm run build` succeeds locally

## CI/CD

For automated deploys in CI, set `DATABRICKS_HOST` and `DATABRICKS_TOKEN` (or use OAuth with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET`):

```bash
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com \
DATABRICKS_TOKEN=dapi... \
databricks apps deploy
```

Or use a pre-configured profile:

```bash
databricks apps deploy --profile ci-profile
```

See the [Databricks CLI authentication guide](/docs/tools/databricks-cli#authenticate) for all auth methods.

## Managing apps

```bash title="Common"
databricks apps stop my-app
databricks apps start my-app
databricks apps delete my-app
```

```bash title="All Options"
databricks apps stop $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps start $APP_NAME \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE

databricks apps delete $APP_NAME \
  --auto-approve \
  --force-lock \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

| Option           | Required | Description                                                       |
| ---------------- | -------- | ----------------------------------------------------------------- |
| `NAME`           | no       | App name. Omit from project directory (auto-detected)             |
| `--no-wait`      | no       | Return immediately (stop/start only)                              |
| `--timeout`      | no       | Max time to wait for completion (default: 20m, stop/start only)   |
| `--auto-approve` | no       | Skip confirmation prompts (delete only)                           |
| `--force-lock`   | no       | Force acquisition of deployment lock (delete only)                |
| `--debug`        | no       | Enable debug logging                                              |
| `-o json`        | no       | Output as JSON (default: text)                                    |
| `--target`       | no       | Bundle target to use (if applicable)                              |
| `--var`          | no       | Set values for bundle config variables (e.g. `--var="key=value"`) |
| `--profile`      | no       | Databricks CLI profile name                                       |

`apps delete` prompts for confirmation. Pass `--auto-approve` in CI to skip the prompt.

## All app recipes

| Recipe                                                                      | Description                                          |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Databricks Local Bootstrap](/resources/databricks-local-bootstrap)         | CLI install, auth, scaffold, and agent skill setup   |
| [Lakebase Data Persistence](/resources/lakebase-data-persistence)           | Add Lakebase to an AppKit app with schema and routes |
| [Lakebase Chat Persistence](/resources/lakebase-chat-persistence)           | Persist AI chat sessions to Lakebase                 |
| [Genie Conversational Analytics](/resources/genie-conversational-analytics) | Natural language data queries with Genie             |
| [Streaming AI Chat](/resources/ai-chat-model-serving)                       | AI chat with Databricks Model Serving                |
| [Query AI Gateway Endpoints](/resources/foundation-models-api)              | Call model serving endpoints from AppKit             |

## Source of truth

- [Deploy a Databricks App](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
- [App runtime (app.yaml)](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
- [AppKit documentation](/docs/appkit/v0)
- [Lakebase Development](/docs/lakebase/development)
- [Best practices](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices)
