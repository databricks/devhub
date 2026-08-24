---
title: App development
sidebar_label: Development
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# App development

This page is the CLI and workflow reference for Databricks Apps and AppKit. It covers adding plugins, scaffolding, deploying, managing, and troubleshooting your app.

Each command below shows a common invocation, its full set of flags, and a table describing each. Run `databricks <command> --help` for current flag behavior, since the CLI is the source of truth.

## Local setup

Copy `.env.example` to `.env` and fill in your workspace URL and resource IDs before running `npm run dev`. AppKit reads these for local connections to Databricks resources.

Example `.env` for an app with [Lakebase Postgres](/docs/lakebase/quickstart):

```text
DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
```

If your app uses Lakebase, also grant your local user the `databricks_superuser` role before running locally. The app's service principal creates schemas and tables on first deploy and owns them. Without this grant, your local identity cannot access those objects:

```sql
GRANT databricks_superuser TO "<your-email>";
```

See [Lakebase Development](/docs/lakebase/development#local-database-access) for the full local access workflow.

For testing against production data without redeploying, see the [remote bridge](/docs/appkit/v0/development/remote-bridge).

## Add a plugin

To add a plugin to an existing app, import and register it in `createApp` in `server/server.ts`:

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

Then regenerate `appkit.plugins.json` with the updated resource requirements:

```bash
npx @databricks/appkit plugin sync --write
```

This runs automatically during `npm run dev` and `npm run build`. Commit the updated `appkit.plugins.json` alongside your code. It tells the deployment pipeline which resources to provision.

See the [AppKit plugins reference](/docs/appkit/v0/plugins) for configuration options for each plugin, or [Creating custom plugins](/docs/appkit/v0/plugins/custom-plugins) to add your own.

## Discover plugins

List available plugins and their required resource fields:

```bash title="Common"
databricks apps manifest
```

```bash title="All Options"
databricks apps manifest \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps manifest -->

| Option            | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `--branch`        | Git branch or tag (for GitHub templates, mutually exclusive with --version)       |
| `--template`      | Template path (local directory or GitHub URL)                                     |
| `--version`       | AppKit version for default template (default: main, use 'latest' for main branch) |
| `--debug`         | enable debug logging                                                              |
| `--output`, `-o`  | output type: text or json (default text)                                          |
| `--profile`, `-p` | ~/.databrickscfg profile                                                          |
| `--target`, `-t`  | bundle target to use (if applicable)                                              |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value"     |

<!-- /cli-options -->

## Scaffold options

Use `databricks apps init` to scaffold a new AppKit project. The [Apps Quickstart](/docs/apps/quickstart) shows the fast path. Use these options for non-interactive or advanced scaffolding.

```bash title="Common"
databricks apps init --name my-app
```

```bash title="All Options"
databricks apps init \
  --name $APP_NAME \
  --features lakebase,analytics \
  --set lakebase.postgres.project=projects/$PROJECT_ID \
  --set lakebase.postgres.branch=projects/$PROJECT_ID/branches/production \
  --set lakebase.postgres.database=projects/$PROJECT_ID/branches/production/databases/$DB_NAME \
  --set analytics.sql-warehouse.id=$WAREHOUSE_ID \
  --description "My App" \
  --output-dir $OUTPUT_DIR \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --deploy \
  --run none \
  --skip-install \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps init -->

| Option            | Description                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `--branch`        | Git branch or tag (for GitHub templates, mutually exclusive with --version)                       |
| `--deploy`        | Deploy the app after creation                                                                     |
| `--description`   | App description                                                                                   |
| `--features`      | Features/plugins to enable (comma-separated, as defined in template manifest)                     |
| `--output-dir`    | Directory to write the project to                                                                 |
| `--run`           | Run the app after creation (none, dev, dev-remote)                                                |
| `--set`           | Set resource values (format: plugin.resourceKey.field=value, can specify multiple)                |
| `--skip-install`  | Skip installing project dependencies (e.g. npm install / uv sync). Cannot be combined with --run. |
| `--template`      | Template path (local directory or GitHub URL)                                                     |
| `--version`       | AppKit version to use (default: auto-detected, use 'latest' for main branch)                      |
| `--debug`         | enable debug logging                                                                              |
| `--output`, `-o`  | output type: text or json (default text)                                                          |
| `--profile`, `-p` | ~/.databrickscfg profile                                                                          |
| `--target`, `-t`  | bundle target to use (if applicable)                                                              |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value"                     |

<!-- /cli-options -->

Passing `--name` suppresses prompts and uses defaults for unspecified options. App names must be lowercase, hyphenated, and 26 characters or fewer. Run `databricks apps manifest` to see available plugins and their `--set` keys.

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

Resources referenced by `valueFrom` must be declared in `databricks.yml`. See [App configuration](/docs/apps/configuration#resources) for the full resource list.

## Pre-deploy checklist

Before deploying to production:

- App binds to `0.0.0.0` on `DATABRICKS_APP_PORT`
- `app.yaml` command uses array syntax (no shell strings)
- No files larger than 10 MB in the project
- Secrets use `valueFrom` (never `value`)
- `databricks.yml` declares all required resources
- `databricks apps validate` succeeds (`--skip-tests` skips tests for a faster run)
- `npm run build` succeeds locally

## Validate

Run validation from your app project directory before deploying:

```bash
databricks apps validate --profile $DATABRICKS_PROFILE
```

Validation runs a build, typecheck, and lint. Pass `--skip-tests` for a faster run.

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
  --auto-approve \
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

<!-- cli-options:apps deploy -->

| Option               | Description                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `--auto-approve`     | Skip interactive approvals that might be required for deployment.                                     |
| `--deployment-id`    | The unique id of the deployment.                                                                      |
| `--force`            | Force-override Git branch validation.                                                                 |
| `--json`             | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes))            |
| `--mode`             | The mode of which the deployment will manage the source code. Supported values: [AUTO_SYNC, SNAPSHOT] |
| `--no-wait`          | do not wait to reach SUCCEEDED state                                                                  |
| `--skip-tests`       | Skip running tests during validation (default true)                                                   |
| `--skip-validation`  | Skip project validation (build, typecheck, lint)                                                      |
| `--source-code-path` | The workspace file system path of the source code used to create the app deployment.                  |
| `--timeout`          | maximum amount of time to reach SUCCEEDED state (default 20m0s)                                       |
| `--debug`            | enable debug logging                                                                                  |
| `--output`, `-o`     | output type: text or json (default text)                                                              |
| `--profile`, `-p`    | ~/.databrickscfg profile                                                                              |
| `--target`, `-t`     | bundle target to use (if applicable)                                                                  |
| `--var`              | set values for variables defined in bundle config. Example: --var="key=value"                         |

<!-- /cli-options -->

The CLI validates configuration, builds the project, uploads it, and starts the app. By default it runs the same project validation as `databricks apps validate` (build, typecheck, lint). Pass `--skip-validation` to skip that step. No `--source-code-path` is needed when deploying from a scaffolded AppKit project.

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

<!-- cli-options:apps get -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--debug`         | enable debug logging                                                          |
| `--output`, `-o`  | output type: text or json (default text)                                      |
| `--profile`, `-p` | ~/.databrickscfg profile                                                      |
| `--target`, `-t`  | bundle target to use (if applicable)                                          |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value" |

<!-- /cli-options -->

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

<!-- cli-options:apps logs -->

| Option            | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `--follow`, `-f`  | Continue streaming logs until interrupted.                                                      |
| `--tail-lines`    | Number of recent log lines to show before streaming. Set to 0 to show everything. (default 200) |
| `--timeout`       | Maximum time to stream when --follow is set. 0 disables the timeout.                            |
| `--search`        | Send a search term to the log service before streaming.                                         |
| `--source`        | Restrict logs to APP and/or SYSTEM sources.                                                     |
| `--output-file`   | Optional file path to write logs in addition to stdout.                                         |
| `--debug`         | enable debug logging                                                                            |
| `--output`, `-o`  | output type: text or json (default text)                                                        |
| `--profile`, `-p` | ~/.databrickscfg profile                                                                        |
| `--target`, `-t`  | bundle target to use (if applicable)                                                            |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value"                   |

<!-- /cli-options -->

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

#### `apps stop` options

<!-- cli-options:apps stop -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | do not wait to reach STOPPED state                                            |
| `--timeout`       | maximum amount of time to reach STOPPED state (default 20m0s)                 |
| `--debug`         | enable debug logging                                                          |
| `--output`, `-o`  | output type: text or json (default text)                                      |
| `--profile`, `-p` | ~/.databrickscfg profile                                                      |
| `--target`, `-t`  | bundle target to use (if applicable)                                          |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value" |

<!-- /cli-options -->

#### `apps start` options

<!-- cli-options:apps start -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--no-wait`       | do not wait to reach ACTIVE state                                             |
| `--timeout`       | maximum amount of time to reach ACTIVE state (default 20m0s)                  |
| `--debug`         | enable debug logging                                                          |
| `--output`, `-o`  | output type: text or json (default text)                                      |
| `--profile`, `-p` | ~/.databrickscfg profile                                                      |
| `--target`, `-t`  | bundle target to use (if applicable)                                          |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value" |

<!-- /cli-options -->

#### `apps delete` options

<!-- cli-options:apps delete -->

| Option            | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| `--auto-approve`  | Skip interactive approvals for deleting resources and files                   |
| `--force-lock`    | Force acquisition of deployment lock.                                         |
| `--debug`         | enable debug logging                                                          |
| `--output`, `-o`  | output type: text or json (default text)                                      |
| `--profile`, `-p` | ~/.databrickscfg profile                                                      |
| `--target`, `-t`  | bundle target to use (if applicable)                                          |
| `--var`           | set values for variables defined in bundle config. Example: --var="key=value" |

<!-- /cli-options -->

`apps delete` prompts for confirmation. Pass `--auto-approve` in CI to skip the prompt.

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

See the [Databricks CLI authentication docs](/docs/tools/databricks-cli#authenticate) for all auth methods.

## Troubleshooting

For additional troubleshooting, see [Deploy apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) and the [AppKit remote bridge](/docs/appkit/v0/development/remote-bridge) for local connection issues.

- **App fails to deploy**: Check logs for error messages, validate `app.yaml` syntax, and verify that secrets and environment variables in the `env` section resolve properly. Confirm all dependencies are included or installed.
- **401 errors (authentication)**: Verify your token is valid (`databricks auth token --profile <PROFILE>`), hasn't expired, and includes the required OAuth scopes. Your token's scopes must be a superset of the scopes configured for the app's [user authorization](/docs/appkit/v0/plugins/execution-context).
- **403 errors (permission denied)**: Verify you have `CAN USE` permission on the app. Insufficient OAuth scopes can also cause 403s even with valid permissions.
- **404 errors (app not found)**: Verify the app name and workspace URL are correct, the app is deployed and running, and the endpoint path exists.
- **Git deployment fails**: For private repositories, verify the app's service principal has a Git credential configured. If deploying through CLI/API/DABs, create the app first, then add the Git credential.

## AppKit docs

Access the AppKit API reference, component docs, and plugin docs from the terminal:

```bash
npx @databricks/appkit docs                        # browse the documentation index
npx @databricks/appkit docs --full                 # full index with all API entries
npx @databricks/appkit docs "<query-or-doc-path>"  # view a specific section or file
```

Run without arguments to browse the index. Useful when building with an AI coding assistant. Point it here instead of guessing API shapes, or view the [AppKit reference](/docs/appkit/v0) on this site.

## Where to next

Browse the [templates catalog](/templates) to start building, or add capabilities to your app: [Lakebase Postgres](/docs/lakebase/overview) for persistent storage or [Agent Bricks](/docs/agents/overview) for AI features.
