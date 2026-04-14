---
title: Start here
description: DevHub is a catalog of guides and examples for the Databricks developer stack. Pick a guide, copy it into your coding agent, and start building.
---

# Start here

DevHub is a catalog of guides and examples for the Databricks developer stack. Pick a guide, copy it into your coding agent, and you get a working app deployed to Databricks with auth, database, and deployment handled.

## How the platform fits together

<img src="/img/docs/platform-overview.svg" alt="Architecture diagram showing Apps containing AppKit, Lakebase, and Agents, with Unity Catalog and AI Gateway as workspace services" width="100%" />

| Layer        | What it is                                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apps**     | The hosting layer. Your Node.js or Python app runs as a managed workspace resource with a fixed URL, built-in auth, and managed compute. Deploy with `databricks apps deploy`.      |
| **AppKit**   | The TypeScript SDK. Provides auth, UI components, and a plugin system (server, lakebase, analytics, genie, files, caching, and more) with support for custom plugins.               |
| **Lakebase** | The database layer. Managed Postgres for OLTP, co-located with your Lakehouse. Autoscales on demand, scales to zero when idle, and supports branching for development environments. |
| **Agents**   | The LLM orchestration layer. Deployed as Apps using any framework that implements the ResponsesAgent interface. Supports tool use, MCP servers, and built-in tracing.               |

**[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/)** and **[AI Gateway](/docs/agents/ai-gateway)** are workspace-level services your app connects to for data governance and model serving.

## Pick a guide or example

Guides are step-by-step instructions for your coding agent. Examples are working apps built on top of guides, with source code. A few common starting points are below. Browse the full [resources catalog](/resources) for more.

All guides assume the [Databricks CLI](/docs/tools/databricks-cli) is installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

| Resource                                                      | Type    | Best for                                        |
| ------------------------------------------------------------- | ------- | ----------------------------------------------- |
| [Hello World App](/resources/hello-world-app)                 | Guide   | Simple apps, static pages, getting started      |
| [AI Chat App](/resources/ai-chat-app)                         | Guide   | Conversational AI, chatbots, assistants         |
| [App with Lakebase](/resources/app-with-lakebase)             | Guide   | CRUD apps with persistent storage               |
| [Agentic Support Console](/resources/agentic-support-console) | Example | Full AI support console with Lakebase and Genie |

## Create your app

Copy the guide into your coding agent and describe what you want to build. The guide handles setup, auth, schemas, and deployment. Your prompt shapes the business logic. A machine-readable index of all guides is at <a href="/llms.txt">llms.txt</a>.

## Companion docs

These docs explain the platform layers that guides build on:

- **[Apps](/docs/apps/quickstart)**: Host web applications as managed Databricks workspace resources.
- **[Lakebase](/docs/lakebase/quickstart)**: Managed PostgreSQL for application data.
- **[Agents](/docs/agents/quickstart)**: Build AI agents with tool orchestration, guardrails, and observability.
- **[Tools](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
- **[AppKit Reference](/docs/appkit/v0)**: Component library, plugin API, and TypeScript SDK reference.
