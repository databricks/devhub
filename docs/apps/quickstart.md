---
title: Quickstart
---

# Quickstart

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (AppKit apps are Node/TypeScript)
- Databricks workspace with Apps enabled

## Template path

[Templates](/templates) are agent-ready prompts organized by use case. Pick one that fits, copy it into your AI coding assistant, and the assistant handles scaffolding, plugin selection, and deployment.

Common starting points:

| Template                                          | Best for                                   |
| ------------------------------------------------- | ------------------------------------------ |
| [Hello World App](/templates/hello-world-app)     | Simple apps, static pages, getting started |
| [AI Chat App](/templates/ai-chat-app)             | Conversational AI, chatbots, assistants    |
| [App with Lakebase](/templates/app-with-lakebase) | CRUD apps with persistent storage          |

The [templates catalog](/templates) has the full list, including [Lakebase Postgres](/docs/lakebase/quickstart), [Genie spaces](/docs/agents/genie), [AI Gateway](/docs/agents/ai-gateway), and [Agent Bricks](/docs/agents/overview).

Give your AI assistant Databricks platform context by installing the [agent skills](/docs/tools/ai-tools/agent-skills) before copying in the template:

```bash
databricks experimental aitools install
```

## Manual path

Without a template, `databricks apps init` generates a working AppKit project. Here is what `--features lakebase` produces (you don't write this yourself):

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";

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

Scaffold, run locally, and deploy:

```bash
databricks apps init --name my-app --features lakebase   # generates the project above
cd my-app && npm install && npm run dev                  # runs locally
databricks apps deploy                                   # deploys to your workspace
```

After deploy, the CLI prints your app's workspace URL.

To scaffold with specific plugins, pass `--features` with a comma-separated list. Run `databricks apps manifest` to see all available plugins and their required resource fields.

## Where to next

For the full local development workflow, deploy flags, and plugin setup, see [Apps development](/docs/apps/development).
