---
title: Quickstart
sourceOfTruth:
  skills:
    - databricks-apps
  docs:
    - /docs/appkit/v0
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/
---

# Quickstart

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22.16+ (AppKit apps are Node/TypeScript)
- Databricks workspace with Apps enabled

## Template path

[Templates](/templates) are agent-ready prompts organized by use case. Pick one that fits, copy it into your AI coding assistant, and the assistant handles scaffolding, plugin selection, and deployment.

Common starting points:

| Template                                                                          | Best for                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment) | Install the CLI, authenticate, verify the workspace      |
| [Spin Up a Databricks App](/templates/spin-up-databricks-app)                     | Scaffold a fresh AppKit app, run it locally, and deploy  |
| [Onboard Your Coding Agent](/templates/onboard-your-coding-agent)                 | Install agent skills, wire up the DevHub Docs MCP server |
| [AI Chat App](/templates/ai-chat-app)                                             | Conversational AI, chatbots, assistants                  |
| [App with Lakebase](/templates/app-with-lakebase)                                 | CRUD apps with persistent storage                        |

The [templates catalog](/templates) has the full list, including [Lakebase Postgres](/docs/lakebase/quickstart), [Genie Agents](/docs/lakehouse/genie), [Unity Gateway](/docs/unity-gateway/overview), and [Agent Bricks](/docs/agents/overview).

Give your AI assistant Databricks platform context by installing the [agent skills](/docs/tools/ai-tools/agent-skills) before copying in the template:

```bash
databricks aitools install
```

## Manual path

Without a template, `databricks apps init` generates a working AppKit project. Here is what `--features lakebase` produces (you don't write this yourself):

```typescript
import { createApp, lakebase, server } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

AppKit.server.extend((app) => {
  app.get("/api/items", async (_req, res) => {
    const { rows } = await AppKit.lakebase.query("SELECT * FROM items");
    res.json(rows);
  });
});
```

Scaffold, deploy, and run locally. Deploy before you run locally so the app's service principal creates and owns the database schema; [Local setup](/docs/lakebase/development#local-setup) explains why.

```bash
# Generate the project and install dependencies
databricks apps init --name my-app --features lakebase \
  --set lakebase.postgres.project=projects/<project-id> \
  --set lakebase.postgres.branch=projects/<project-id>/branches/<branch-id> \
  --set lakebase.postgres.database=projects/<project-id>/branches/<branch-id>/databases/<database-id>
cd my-app && databricks apps deploy   # deploy to your workspace
npm run dev                           # run locally
```

After deploy, the CLI prints your app's workspace URL.

To scaffold with specific plugins, pass `--features` with a comma-separated list. Run `databricks apps manifest` to see all available plugins and their required resource fields.

## Where to next

For the full local development workflow, deploy flags, and plugin setup, see [Apps development](/docs/apps/development).
