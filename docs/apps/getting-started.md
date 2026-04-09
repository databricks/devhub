---
title: Getting Started
---

# Getting Started

Databricks Apps hosts and operates web applications inside your Databricks workspace. AppKit is the TypeScript SDK for building these apps with a plugin-based architecture. Building an AI agent? Agents are deployed as Apps (see [how agents and apps relate](/docs/get-started/core-concepts#how-agents-and-apps-relate)).

## Prerequisites

- Databricks CLI `v0.295+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (AppKit apps are Node/TypeScript)
- Workspace with [Apps enabled](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)

## Scaffold an app

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

| Option          | Required | Description                                                                                             |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `--name`        | no       | App name (lowercase, hyphenated, 26 chars max). Suppresses prompts and applies defaults for other flags |
| `--features`    | no       | Comma-separated plugins to enable (e.g. `lakebase`, `analytics`, `genie`)                               |
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
| `--var`         | no       | Set values for bundle config variables (e.g. `--var="key=value"`)                                       |
| `--profile`     | no       | Databricks CLI profile name                                                                             |

Passing `--name` suppresses prompts and uses defaults for unspecified options. App names must be lowercase, hyphenated, and 26 characters or fewer. See [Apps Plugins](/docs/apps/plugins) for the full list of built-in plugins and `databricks apps init --help` for all `--set` keys.

## Build an app from a template

The fastest path is to use a [template](/resources) with an AI coding agent. Copy a template into your agent and describe what you want to build. See [Your First App](/docs/get-started/your-first-app) for the full workflow.

| Template                                                  | Best for                                           |
| --------------------------------------------------------- | -------------------------------------------------- |
| [Hello World App](/resources/hello-world-app)             | Simple apps, static pages, getting started         |
| [App with Lakebase](/resources/app-with-lakebase)         | CRUD apps with persistent storage                  |
| [AI Chat App](/resources/ai-chat-app)                     | Conversational AI with chat history                |
| [Lakebase Off-Platform](/resources/lakebase-off-platform) | Apps hosted outside Databricks (AWS, Vercel, etc.) |

## Customize the template

After scaffolding or copying a template, consider the following customizations:

- **Add a plugin**: When you scaffold, pass `--features` with comma-separated plugin names (for example, `lakebase,analytics`). Use `--set` only for resource field values (`plugin.resourceKey.field=value`), not to name plugins. For an existing app, register plugins in `createApp` in `server/server.ts` and run `npx @databricks/appkit plugin sync --write` so `appkit.plugins.json` stays in sync. See [Plugins](/docs/apps/plugins).
- **Add a new route**: Create a route handler in your app's server code and register it in the router.
- **Customize the UI theme**: Use [AppKit styling](/docs/appkit/v0/api/appkit-ui/styling) to adjust colors, fonts, and component appearance.
- **Connect to Lakebase**: Add the Lakebase plugin for persistent storage. See the [Lakebase Data Persistence](/resources/app-with-lakebase#lakebase-data-persistence) recipe.
- **Add AI features**: Add the [Foundation Models API](/resources/ai-chat-app#query-ai-gateway-endpoints) recipe for model serving, or the [Genie](/resources/genie-analytics-app#genie-conversational-analytics) recipe for conversational analytics.

## Next steps

Once you have a scaffolded app, see [Development](/docs/apps/development) for local dev, deploy, logs, and environment configuration.

## Further reading

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Configure your Databricks Apps environment](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/configure-env)
- [AppKit documentation](/docs/appkit/v0)
