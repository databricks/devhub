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

From the project root (where `databricks.yml` lives):

```bash
databricks apps deploy --profile <PROFILE>
```

The CLI validates configuration, builds the project, uploads it, and starts the app. No `--source-code-path` is needed when deploying from a scaffolded AppKit project.

### Verify the deployment

Check app status:

```bash
databricks apps get my-app -o json --profile <PROFILE>
```

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

```bash
databricks apps logs my-app --profile <PROFILE>
```

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

Use `--tail-lines` to limit output:

```bash
databricks apps logs my-app --tail-lines 100 --profile <PROFILE>
```

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

For non-interactive deploys in CI, set `DATABRICKS_HOST` and `DATABRICKS_TOKEN` (or use OAuth with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET`):

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

Stop, start, or delete apps from the CLI:

```bash
databricks apps stop my-app --profile <PROFILE>
databricks apps start my-app --profile <PROFILE>
databricks apps delete my-app --profile <PROFILE>
```

## All app recipes

| Recipe                                                                      | Description                                          |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Databricks Local Bootstrap](/resources/databricks-local-bootstrap)         | CLI install, auth, scaffold, and agent skill setup   |
| [Lakebase Data Persistence](/resources/lakebase-data-persistence)           | Add Lakebase to an AppKit app with schema and routes |
| [Lakebase Chat Persistence](/resources/lakebase-chat-persistence)           | Persist AI chat sessions to Lakebase                 |
| [SQL Analytics Dashboard](/resources/sql-analytics-dashboard)               | Analytics dashboard with parameterized SQL queries   |
| [Genie Conversational Analytics](/resources/genie-conversational-analytics) | Natural language data queries with Genie             |
| [Streaming AI Chat](/resources/ai-chat-model-serving)                       | AI chat with Databricks Model Serving                |
| [Query AI Gateway Endpoints](/resources/foundation-models-api)              | Call model serving endpoints from AppKit             |

## Source of truth

- [Deploy a Databricks App](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
- [App runtime (app.yaml)](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
- [AppKit documentation](/docs/appkit/v0)
- [Lakebase Development](/docs/lakebase/development)
- [Best practices](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/best-practices)
