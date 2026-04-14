---
title: Start here
description: DevHub is a catalog of guides and examples for the Databricks developer stack. Pick a guide, copy it into your coding agent, and start building.
---

# Start here

DevHub is a catalog of guides and examples for the Databricks developer stack. Pick a guide, copy it into your coding agent, and you get a working app deployed to Databricks with auth, database, and deployment handled.

## How the platform fits together

| Layer        | What it is                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Apps**     | The hosting layer. Your Node.js or Python app runs as a managed workspace resource with a fixed URL and built-in auth. |
| **AppKit**   | The TypeScript SDK. Provides auth, plugins, and UI components for building on top of Apps.                             |
| **Lakebase** | The database layer. Managed Postgres for your app's transactional data, co-located with your Lakehouse.                |
| **Agents**   | The LLM orchestration layer. Deployed as Apps using any framework that implements the ResponsesAgent interface.        |

## Pick a guide or example

Guides are step-by-step instructions for your coding agent. Examples are working apps built on top of guides, with source code. A few common starting points are below. Browse the full [resources catalog](/resources) for more.

| Resource                                                      | Type    | Best for                                        |
| ------------------------------------------------------------- | ------- | ----------------------------------------------- |
| [Hello World App](/resources/hello-world-app)                 | Guide   | Simple apps, static pages, getting started      |
| [AI Chat App](/resources/ai-chat-app)                         | Guide   | Conversational AI, chatbots, assistants         |
| [App with Lakebase](/resources/app-with-lakebase)             | Guide   | CRUD apps with persistent storage               |
| [Agentic Support Console](/resources/agentic-support-console) | Example | Full AI support console with Lakebase and Genie |

## Prerequisites

You need the [Databricks CLI](/docs/tools/databricks-cli) installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

## Create your app

Copy the guide into your coding agent and describe what you want to build. The guide handles setup, auth, schemas, and deployment. Your prompt shapes the business logic. A machine-readable index of all guides is at <a href="/llms.txt">llms.txt</a>.

## Companion docs

These docs explain the platform layers that guides build on:

- **[Apps](/docs/apps/quickstart)**: Host web applications as managed Databricks workspace resources.
- **[Lakebase](/docs/lakebase/quickstart)**: Managed PostgreSQL for application data.
- **[Agents](/docs/agents/quickstart)**: Build AI agents with tool orchestration, guardrails, and observability.
- **[Tools](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
- **[AppKit Reference](/docs/appkit/v0)**: Component library, plugin API, and TypeScript SDK reference.
