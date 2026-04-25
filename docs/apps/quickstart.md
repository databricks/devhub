---
title: Quickstart
---

# Quickstart

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- Node.js 22+ (AppKit apps are Node/TypeScript)
- Workspace with Apps enabled

## Template path

[Templates](/templates) are agent-ready prompts organized by use case, including templates for [Lakebase Postgres](/docs/lakebase/quickstart), [Genie spaces](/docs/agents/genie), [AI Gateway](/docs/agents/ai-gateway), [Agent Bricks](/docs/agents/overview), and more. Browse them, pick one that fits, and copy it into your AI coding assistant. The assistant handles scaffolding, plugin selection, and deployment.

For richer CLI and workspace context, install the Databricks agent skills first:

```bash
databricks experimental aitools install
```

## Manual path

When you scaffold without a template, `databricks apps init` generates a working AppKit project. Here is what the output looks like (you don't write this yourself):

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

To scaffold with specific plugins, pass `--features` with a comma-separated list. Run `databricks apps manifest` to see all available plugins and their required resource fields.

See [Apps Development](/docs/apps/development) for the full scaffold options, deploy flags, and environment configuration. For `app.yaml`, resource bindings, and env vars, see [App configuration](/docs/apps/configuration).
