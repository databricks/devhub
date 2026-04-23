---
title: Quickstart
---

# Quickstart

Databricks Apps hosts and operates web applications inside your Databricks workspace. AppKit is the TypeScript SDK for building these apps with a plugin-based architecture. Building on top of an AI agent? See [Agent Bricks](/docs/agents/overview).

DevHub is organized around [guides and examples](/templates). These companion docs explain Databricks Apps and AppKit when you or your agent need platform detail beyond a guide. For how the site fits together, see [Start here](/docs/start-here).

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (AppKit apps are Node/TypeScript)
- Workspace with [Apps enabled](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)

## What happens next

Whether you copy a guide or scaffold manually, here's what the flow looks like:

1. The Databricks CLI authenticates against your workspace.
2. The project is scaffolded with the right dependencies.
3. Databricks resources are provisioned (Lakebase databases, model serving endpoints, or Genie spaces, depending on the guide).
4. The coding agent builds your application on top of the scaffold.
5. `databricks bundle deploy` pushes the app to Databricks Apps.

If something fails during the build, guides include troubleshooting context for each step. Coding agents can diagnose and fix most errors from the troubleshooting context.

## Build an app from a guide

The fastest path is to copy a [guide from /templates](/templates) into your coding agent and describe what you want to build. [Start here](/docs/start-here) for the full workflow.

## Scaffold an app

If you're starting from a guide, scaffolding happens automatically. Use `databricks apps init` when you want to scaffold manually.

```bash title="Common"
databricks apps init --name my-app
```

```bash title="All Options"
databricks apps init \
  --name $APP_NAME \
  --features lakebase \
  --set lakebase.postgres.branch=projects/$PROJECT_ID/branches/production \
  --set lakebase.postgres.database=projects/$PROJECT_ID/branches/production/databases/$DB_NAME \
  --description "My Databricks App" \
  --output-dir $OUTPUT_DIR \
  --template $TEMPLATE_URL \
  --branch $BRANCH \
  --deploy \
  --run none \
  --version $APPKIT_VERSION \
  --debug \
  -o json \
  --target $TARGET \
  --var "key=value" \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option          | Required | Description                                                                                             |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `--name`        | no       | App name (lowercase, hyphenated, 26 chars max). Suppresses prompts and applies defaults for other flags |
| `--features`    | no       | Comma-separated plugins to enable (for example, `lakebase`, `analytics`, `genie`)                       |
| `--set`         | no       | Resource values: `plugin.resourceKey.field=value`. Multi-field resources require all fields together    |
| `--description` | no       | App description                                                                                         |
| `--output-dir`  | no       | Directory to write the project to                                                                       |
| `--deploy`      | no       | Deploy the app after creation                                                                           |
| `--run`         | no       | Run after creation: `none`, `dev`, or `dev-remote`                                                      |
| `--template`    | no       | Template path (local directory or GitHub URL)                                                           |
| `--branch`      | no       | Git branch or tag (for GitHub templates, mutually exclusive with `--version`)                           |
| `--version`     | no       | AppKit version to use (default: latest release, `latest` for main branch)                               |
| `--debug`       | no       | Enable debug logging                                                                                    |
| `-o json`       | no       | Output as JSON (default: text)                                                                          |
| `--target`      | no       | Bundle target to use (if applicable)                                                                    |
| `--var`         | no       | Set values for bundle config variables (for example, `--var="key=value"`)                               |
| `--profile`     | no       | Databricks CLI profile name                                                                             |

</details>

Passing `--name` suppresses prompts and uses defaults for unspecified options. App names must be lowercase, hyphenated, and 26 characters or fewer. See [Apps Plugins](/docs/apps/plugins) for the full list of built-in plugins and `databricks apps init --help` for all `--set` keys.

## Customize your app

After scaffolding or copying a guide, consider the following customizations:

- **Add a plugin**: When you scaffold, pass `--features` with comma-separated plugin names (for example, `lakebase,analytics`). Use `--set` only for resource field values (`plugin.resourceKey.field=value`), not to name plugins. For an existing app, register plugins in `createApp` in `server/server.ts` and run `npx @databricks/appkit plugin sync --write` so `appkit.plugins.json` stays in sync. See [Plugins](/docs/apps/plugins).
- **Add a new route**: Create a route handler in your app's server code and register it in the router.
- **Customize the UI theme**: Use [AppKit styling](/docs/appkit/v0/api/appkit-ui/styling) to adjust colors, fonts, and component appearance.
- **Connect to Lakebase**: Add the Lakebase plugin for persistent storage. See the [Lakebase Data Persistence](/templates/app-with-lakebase#lakebase-data-persistence) guide.
- **Add AI features**: Add the [Foundation Models API](/templates/ai-chat-app#query-ai-gateway-endpoints) guide for model serving, or the [Genie](/templates/genie-analytics-app#genie-conversational-analytics) guide for conversational analytics.

## Next steps

Once you have a scaffolded app, see [Development](/docs/apps/development) for local dev, deploy, logs, and environment configuration.

## Further reading

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Configure your Databricks Apps environment](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/configure-env)
- [AppKit documentation](/docs/appkit/v0)
