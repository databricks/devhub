---
title: App development
sidebar_label: Development
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
    - /docs/lakebase/development
  note: "CLI flags and examples follow the installed Databricks CLI (cli-options tables come from pnpm docs:cli-sync). Scaffold behavior (.env, pnpm, required --set values) is verified by running databricks apps init. Lakebase local access follows /docs/lakebase/development."
---

# App development

This page is the CLI and workflow reference for Databricks Apps and AppKit. It covers adding plugins, scaffolding, deploying, managing, and troubleshooting your app.

Each command below shows a common invocation, its full set of flags, and a table describing each. Run `databricks <command> --help` for current flag behavior, since the CLI is the source of truth.

## Local setup

`databricks apps init` writes a `.env` file in the project root with your CLI profile and the connection values for the resources you chose. AppKit reads it for local connections to Databricks resources. `.env.example` lists the connection keys with placeholder values (with `DATABRICKS_HOST` in place of the profile); copy it to `.env` and fill it in only when you start from a project that has no `.env`, such as a fresh clone.

Example `.env` (abbreviated) for an app with [Lakebase Postgres](/docs/lakebase/quickstart):

```text
DATABRICKS_CONFIG_PROFILE=<profile>
PGHOST=<endpoint-host>
PGDATABASE=<database-name>
LAKEBASE_ENDPOINT=projects/<project>/branches/production/endpoints/primary
PGPORT=5432
PGSSLMODE=require
```

The default AppKit template uses pnpm: `apps init` installs dependencies with pnpm, and the project scripts call it, so run the app with `pnpm run dev`. To scaffold an npm project instead, pass `--package-manager npm` to `apps init` and use `npm run dev`.

If your app uses Lakebase, run `databricks apps deploy` once before `pnpm run dev`, so the app's service principal creates and owns the schema. If you created the Lakebase project, your identity already has the access it needs locally. Teammates need a Postgres role on the branch, which the project creator can add. See [Lakebase Development](/docs/lakebase/development#local-setup) for the full local access workflow.

For testing against production data without redeploying, see the [remote bridge](/docs/appkit/v0/development/remote-bridge).

## Add a plugin

To add a plugin to an existing app, import and register it in `createApp` in `server/server.ts`:

```typescript
import { createApp, genie, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase(), genie()],
});
```

Then regenerate `appkit.plugins.json` with the updated resource requirements (the template's `sync` script runs `appkit plugin sync --write`):

```bash
pnpm run sync
```

This runs automatically before the template's `dev` and `build` scripts. Commit the updated `appkit.plugins.json` alongside your code. `databricks apps validate` reads it; the resources themselves are declared in `databricks.yml` (see [App configuration](/docs/apps/configuration#plugin-manifest)).

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
  --auth-mode sp \
  --package-manager pnpm \
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
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:apps init -->

| Option              | Description                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--auth-mode`       | Default resource auth mode: obo (on behalf of the user) or sp (service principal). With obo, resources that cannot be accessed on behalf of the user use sp. Prompts if not provided in interactive mode, otherwise sp. |
| `--branch`          | Git branch or tag (for GitHub templates, mutually exclusive with --version)                                                                                                                                             |
| `--deploy`          | Deploy the app after creation                                                                                                                                                                                           |
| `--description`     | App description                                                                                                                                                                                                         |
| `--features`        | Features/plugins to enable (comma-separated, as defined in template manifest)                                                                                                                                           |
| `--output-dir`      | Directory to write the project to                                                                                                                                                                                       |
| `--package-manager` | Node.js package manager (pnpm, npm; default: inferred from template)                                                                                                                                                    |
| `--run`             | Run the app after creation (none, dev, dev-remote)                                                                                                                                                                      |
| `--set`             | Set resource values (format: plugin.resourceKey.field=value, can specify multiple)                                                                                                                                      |
| `--skip-install`    | Skip installing project dependencies (e.g. npm install / uv sync). Cannot be combined with --run.                                                                                                                       |
| `--template`        | Template path (local directory or GitHub URL)                                                                                                                                                                           |
| `--version`         | AppKit version to use (default: auto-detected, use 'latest' for main branch)                                                                                                                                            |
| `--debug`           | enable debug logging                                                                                                                                                                                                    |
| `--output`, `-o`    | output type: text or json (default text)                                                                                                                                                                                |
| `--profile`, `-p`   | ~/.databrickscfg profile                                                                                                                                                                                                |
| `--target`, `-t`    | bundle target to use (if applicable)                                                                                                                                                                                    |
| `--var`             | set values for variables defined in bundle config. Example: --var="key=value"                                                                                                                                           |

<!-- /cli-options -->

Passing `--name` makes `apps init` non-interactive, so every required resource field must be set with `--set`. Run `databricks apps manifest` to see available plugins and their `--set` keys. App names must be lowercase, hyphenated, and 26 characters or fewer.

`--auth-mode` sets how the app accesses its resources by default: `obo` (on behalf of the signed-in user, falling back to the service principal for resources that can't be accessed that way) or `sp` (the app's service principal, the non-interactive default). Override it for one resource with `--set <plugin>.<resource-key>.authMode=obo|sp|both`. `--auth-mode` and `--package-manager` need Databricks CLI v1.20.0 or later.

## Environment configuration

**Local** (`pnpm run dev`): variables from `.env` in the project root.

**Deployed**: variables from `app.yaml` `env` entries. Use `value` for plain strings and `valueFrom` for resource bindings:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
  - name: APP_LOG_LEVEL
    value: info
```

Resources referenced by `valueFrom` must be declared as app resources: in `databricks.yml` for bundle deploys, or in the app's configuration in the workspace UI. See [App configuration](/docs/apps/configuration#resources) for the full resource list.

## Pre-deploy checklist

Before deploying to production:

- App binds to `0.0.0.0` on `DATABRICKS_APP_PORT`
- `app.yaml` command uses array syntax (no shell strings)
- No files larger than 10 MB in the project
- Secrets use `valueFrom` (never `value`)
- All required resources are declared (in `databricks.yml` or the app's workspace configuration), including `SELECT` on tables your analytics queries read: the build's type generation runs as the app's service principal
- `databricks apps validate` succeeds (`--skip-tests` skips tests for a faster run)
- `pnpm run build` succeeds locally

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
  --git-branch $GIT_BRANCH \
  --git-source-code-path $GIT_SOURCE_PATH \
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

| Option                   | Description                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `--auto-approve`         | Skip interactive approvals that might be required for deployment.                                     |
| `--deployment-id`        | The unique id of the deployment.                                                                      |
| `--force`                | Force-override Git branch validation.                                                                 |
| `--git-branch`           | Git branch to deploy from.                                                                            |
| `--git-commit`           | Git commit SHA to deploy from.                                                                        |
| `--git-source-code-path` | Relative path to the app source code within the Git repository. Defaults to the repository root.      |
| `--git-tag`              | Git tag to deploy from.                                                                               |
| `--json`                 | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes))            |
| `--mode`                 | The mode of which the deployment will manage the source code. Supported values: [AUTO_SYNC, SNAPSHOT] |
| `--no-wait`              | do not wait to reach SUCCEEDED state                                                                  |
| `--skip-tests`           | Skip running tests during validation (default true)                                                   |
| `--skip-validation`      | Skip project validation (build, typecheck, lint)                                                      |
| `--source-code-path`     | The workspace file system path of the source code used to create the app deployment.                  |
| `--timeout`              | maximum amount of time to reach SUCCEEDED state (default 20m0s)                                       |
| `--debug`                | enable debug logging                                                                                  |
| `--output`, `-o`         | output type: text or json (default text)                                                              |
| `--profile`, `-p`        | ~/.databrickscfg profile                                                                              |
| `--target`, `-t`         | bundle target to use (if applicable)                                                                  |
| `--var`                  | set values for variables defined in bundle config. Example: --var="key=value"                         |

<!-- /cli-options -->

In your project directory, without an app name, the CLI runs the same validation as `databricks apps validate` (build, typecheck, lint), uploads the project, and starts the app. Pass `--skip-validation` to skip validation. No `--source-code-path` is needed when deploying from a scaffolded AppKit project. With an app name, the CLI uses API deploy instead of the project deploy flow, and deploys the source you name.

When you pass an app name, pick one source: a workspace folder with `--source-code-path`, or a Git source with exactly one of `--git-branch`, `--git-tag`, or `--git-commit` (plus `--git-source-code-path` for a subfolder). The CLI rejects `--source-code-path` combined with a `--git-*` flag, and more than one Git ref.

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
[BUILD] [INFO] Starting deployment a1b2c3d4e5f6...
[BUILD] [INFO] Downloading source code from /Workspace/Users/.../src/a1b2c3d4e5f6
[BUILD] [INFO] Installing dependencies...
[BUILD] Packages: +766
[BUILD] Done in 19s using pnpm v11.0.8
[BUILD] [INFO] Dependencies installed successfully.
[BUILD] [INFO] Running build script pnpm run build:server && pnpm run build:client
[BUILD] ✔ Build complete in 90ms
[BUILD] ✓ built in 1.60s
[BUILD] [INFO] Build completed successfully.
[BUILD] [INFO] Starting app with command: [pnpm run start]
[BUILD] [INFO] Deployment successful
[APP] [appkit:server] Server running on http://0.0.0.0:8000
[APP] [appkit:server] Mode: production (static)
```

</details>

### Roll back

Apps has no single rollback action. To roll back, redeploy an earlier version: for a Git-backed app, deploy the earlier tag or commit (for example `databricks apps deploy my-app --git-commit <commit-sha>`, or `--git-tag` for a release tag); for a workspace-source app, restore the earlier source to the folder and redeploy it. `databricks apps list-deployments my-app` lists past deployments. See [Roll back to a previous version](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#rollback).

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

See the [Databricks CLI authentication docs](/docs/tools/databricks-cli#authenticate) for all auth methods. For GitHub Actions, [CI/CD with GitHub Actions](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/cicd-github-actions) uses workload identity federation, so the workflow stores no secret.

## Troubleshooting

For additional troubleshooting, see [Deploy apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy#troubleshoot) and the [AppKit remote bridge](/docs/appkit/v0/development/remote-bridge) for local connection issues.

- **App fails to deploy**: Check logs for error messages, validate `app.yaml` syntax, and verify that secrets and environment variables in the `env` section resolve properly. Confirm all dependencies are included or installed.
- **401 errors (authentication)**: Verify your token is valid, hasn't expired, and includes the required OAuth scopes. For a user (U2M) profile, run `databricks auth token --profile <PROFILE>` to check it. Your token's scopes must be a superset of the scopes configured for the app's [user authorization](/docs/appkit/v0/plugins/execution-context).
- **403 errors (permission denied)**: Verify you have `CAN USE` permission on the app. Insufficient OAuth scopes can also cause 403s even with valid permissions.
- **Build fails in type generation**: On deploy, the build runs AppKit's type generation as the app's service principal, which describes each analytics query. If it can't read a table, the deploy fails with `Error building app`, and AppKit may report the failed queries as SQL errors. Add the table as an app resource with `SELECT` (a `uc_securable` with `securable_type: TABLE`).
- **Deploy or start fails on OAuth scopes**: Workspace admins can restrict which user authorization scopes apps may request. Remove scopes that aren't allowed from `user_api_scopes`. See [Restrict user authorization scopes](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth#restrict-scopes).
- **404 errors (app not found)**: Verify the app name and workspace URL are correct, the app is deployed and running, and the endpoint path exists.
- **Git deployment fails**: For private repositories, verify the app's service principal has a Git credential configured. If deploying through CLI/API/DABs, create the app first, then add the Git credential.

## AppKit docs

Access the AppKit API reference, component docs, and plugin docs from your project directory. `pnpm exec` runs the AppKit version your project installed:

```bash
pnpm exec appkit docs                        # browse the documentation index
pnpm exec appkit docs --full                 # full index with all API entries
pnpm exec appkit docs "<section-or-./docs/path.md>"  # view a section or doc file
```

Run without arguments to browse the index. Useful when building with an AI coding assistant. Point it here instead of guessing API shapes, or view the [AppKit reference](/docs/appkit/v0) on this site.

## Where to next

Browse the [templates catalog](/templates) to start building, or add capabilities to your app: [Lakebase Postgres](/docs/lakebase/overview) for persistent storage or [Agent Bricks](/docs/agents/overview) for AI features.
