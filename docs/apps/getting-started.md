---
title: Getting Started
---

# Getting Started

Databricks Apps hosts and operates web applications inside your Databricks workspace. AppKit is the TypeScript SDK for building these apps with a plugin-based architecture.

## Prerequisites

- Databricks CLI `v0.295+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (AppKit apps are Node/TypeScript)
- Workspace with [Apps enabled](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)

## Scaffold an app

Interactive mode lets you select plugins and configure resources:

```bash
databricks apps init
```

App names must be lowercase, hyphenated, and 26 characters or fewer.

For non-interactive use (CI, agents), pass `--name` and optional `--features`/`--set` flags:

```bash
databricks apps init --name my-app --run none --profile <PROFILE>
```

Add plugins with `--features`:

```bash
databricks apps init --name my-app --features=lakebase \
  --set lakebase.postgres.branch=projects/<project>/branches/production \
  --set lakebase.postgres.database=projects/<project>/branches/production/databases/<db-name> \
  --run none --profile <PROFILE>
```

The CLI derives defaults for unset values. See [Apps Plugins](/docs/apps/plugins) for the full list of built-in plugins and `databricks apps init --help` for all `--set` keys.

## Build an app from a template

The fastest path is to use a [template](/resources) with an AI coding agent. Copy a template into your agent and describe what you want to build. See [Your First App](/docs/get-started/your-first-app) for the full workflow.

| Template                                                           | Best for                                           |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| [Base App Template](/resources/base-app-template)                  | Simple apps, static pages, getting started         |
| [Data App Template](/resources/data-app-template)                  | CRUD apps with persistent storage                  |
| [AI Chat App Template](/resources/ai-chat-app-template)            | Conversational AI with chat history                |
| [Lakebase Off-Platform](/resources/lakebase-off-platform-template) | Apps hosted outside Databricks (AWS, Vercel, etc.) |

## Next steps

Once you have a scaffolded app, see [Development](/docs/apps/development) for local dev, deploy, logs, and environment configuration.

## Source of truth

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Configure your Databricks Apps environment](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/configure-env)
- [AppKit documentation](/docs/appkit/v0)
