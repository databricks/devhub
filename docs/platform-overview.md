---
title: Platform overview
description: How Databricks Apps, AppKit, Lakebase, and Agent Bricks fit together. Architecture reference for the Databricks developer stack.
---

# Platform overview

DevHub is a catalog of guides and examples for the Databricks developer stack. Pick a guide, copy it into your coding agent, and it handles scaffolding, auth, database, and deployment.

## How the platform fits together

Apps, AppKit, Lakebase, and Agent Bricks are four layers that make up a full-stack Databricks application. Unity Catalog and AI Gateway are workspace services they connect to.

<img src="/img/docs/platform-overview.svg" alt="Architecture diagram showing Apps containing AppKit, Lakebase, and Agents, with Unity Catalog and AI Gateway as workspace services" width="100%" />

| Layer            | What it is                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apps**         | The hosting layer. Your Node.js or Python app runs as a managed workspace resource with a fixed URL, built-in auth, and managed compute. Deploy with `databricks apps deploy`.      |
| **AppKit**       | The TypeScript SDK. Provides auth, UI components, and a plugin system (server, lakebase, analytics, genie, files, caching, and more) with support for custom plugins.               |
| **Lakebase**     | The database layer. Managed Postgres for OLTP, co-located with your Lakehouse. Autoscales on demand, scales to zero when idle, and supports branching for development environments. |
| **Agent Bricks** | The AI layer. Connect Knowledge Assistants, Supervisor Agents, Genie spaces, and governed LLM endpoints to your AppKit app via the Model Serving and Genie plugins.                 |

**[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/)** and **[AI Gateway](/docs/agents/ai-gateway)** are workspace-level services your app connects to for data governance and model serving.

## Pick a guide or example

Guides are step-by-step instructions for your coding agent. Examples are working apps built on top of guides, with source code. Here are a few common starting points. The [resources catalog](/templates) has the full list.

All guides assume the [Databricks CLI](/docs/tools/databricks-cli) is installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

| Resource                                          | Type  | Best for                                   |
| ------------------------------------------------- | ----- | ------------------------------------------ |
| [Hello World App](/templates/hello-world-app)     | Guide | Simple apps, static pages, getting started |
| [AI Chat App](/templates/ai-chat-app)             | Guide | Conversational AI, chatbots, assistants    |
| [App with Lakebase](/templates/app-with-lakebase) | Guide | CRUD apps with persistent storage          |

More guides and examples are in the [resources catalog](/templates).

## Companion docs

These docs explain the platform layers that guides build on:

- **[Web apps (Databricks Apps)](/docs/apps/quickstart)**: Scaffold and deploy a working app built with AppKit (TypeScript) or Python.
- **[Postgres database (Lakebase)](/docs/lakebase/quickstart)**: Provision a Lakebase project and connect it to an app.
- **[Agent Bricks](/docs/agents/overview)**: Connect your AppKit app to Agent Bricks: governed model endpoints, Genie spaces, and Knowledge Assistants.
- **[Set up your environment](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
- **[AppKit Reference](/docs/appkit/v0)**: Component library, plugin API, and TypeScript SDK reference.
