---
title: Platform overview
description: How Databricks Apps, AppKit, Lakebase, and Agent Bricks fit together. Architecture reference for the Databricks developer stack.
---

# Platform overview

Apps, AppKit, Lakebase Postgres, and Agent Bricks are four layers that make up a full-stack Databricks application. Unity Catalog and AI Gateway are workspace services they connect to.

<img src="/img/docs/platform-overview.svg" alt="Architecture diagram showing Apps containing AppKit, Lakebase, and Agents, with Unity Catalog and AI Gateway as workspace services" width="100%" />

| Layer                 | What it is                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apps**              | The hosting layer. Your app runs as a managed workspace resource with a fixed URL, built-in auth, and managed compute. Deploy with `databricks apps deploy`.                                    |
| **AppKit**            | The TypeScript SDK for building apps on Databricks Apps. Provides auth, pre-built React UI components (data tables, charts, dialogs), and a plugin system for connecting to workspace services. |
| **Lakebase Postgres** | The database layer. Managed Postgres for OLTP, co-located with your Lakehouse. Autoscales on demand, scales to zero when idle, and supports branching for development environments.             |
| **Agent Bricks**      | The AI layer. Call Knowledge Assistants, Supervisor Agents, and governed LLM endpoints via the Model Serving plugin. Query Unity Catalog tables in natural language via the Genie plugin.       |

**[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/)** and **[AI Gateway](/docs/agents/ai-gateway)** are workspace-level services your app connects to for data governance and model serving.

## Pick a template

Templates are agent-ready prompts organized by use case. Here are a few common starting points. The [templates catalog](/templates) has the full list.

All templates assume the [Databricks CLI](/docs/tools/databricks-cli) is installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

| Resource                                          | Type     | Best for                                   |
| ------------------------------------------------- | -------- | ------------------------------------------ |
| [Hello World App](/templates/hello-world-app)     | Template | Simple apps, static pages, getting started |
| [AI Chat App](/templates/ai-chat-app)             | Template | Conversational AI, chatbots, assistants    |
| [App with Lakebase](/templates/app-with-lakebase) | Template | CRUD apps with persistent storage          |

More templates are in the [templates catalog](/templates).

## Where to next

These docs go deeper on each platform layer:

- **[Web apps (Databricks Apps)](/docs/apps/quickstart)**: Scaffold and deploy an AppKit app (TypeScript) or a Python app on Databricks Apps.
- **[Lakebase Postgres](/docs/lakebase/quickstart)**: Provision a Lakebase Postgres project and connect it to an app.
- **[Agent Bricks](/docs/agents/overview)**: Governed model endpoints ([AI Gateway](/docs/agents/ai-gateway)), natural-language data queries ([Genie](/docs/agents/genie)), and custom agent endpoints ([Custom agents](/docs/agents/custom-agents)).
- **[Set up your environment](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
- **[AppKit Reference](/docs/appkit/v0)**: Component library, plugin API, and TypeScript SDK reference.
