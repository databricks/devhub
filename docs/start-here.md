---
title: Start here
description: DevHub is the developer platform for Databricks. Browse guides and examples at /resources, copy them into your AI coding agent, and start building.
---

# Start here

Everything you need to build and deploy data apps and AI agents on Databricks. The site is organized around [guides and examples](/resources). Copy one into your AI coding agent and describe what you want to build. These docs cover the underlying platform when you need to go deeper.

## How the platform fits together

DevHub covers four layers of the Databricks developer stack:

| Layer        | What it is                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Apps**     | The hosting layer. Your Node.js or Python app runs as a managed workspace resource with a fixed URL and built-in auth. |
| **AppKit**   | The TypeScript SDK. Provides auth, plugins, and UI components for building on top of Apps.                             |
| **Lakebase** | The database layer. Managed Postgres for your app's transactional data, co-located with your Lakehouse.                |
| **Agents**   | The LLM orchestration layer. Deployed as Apps using any framework that implements the ResponsesAgent interface.        |

Guides wire these layers together. Docs explain each layer when you need to go deeper.

## Pick a guide

Three common starting points. Browse [/resources](/resources) for the full catalog of guides and examples.

| Guide                                             | Best for                                   |
| ------------------------------------------------- | ------------------------------------------ |
| [Hello World App](/resources/hello-world-app)     | Simple apps, static pages, getting started |
| [AI Chat App](/resources/ai-chat-app)             | Conversational AI, chatbots, assistants    |
| [App with Lakebase](/resources/app-with-lakebase) | CRUD apps with persistent storage          |

## Use a guide

Copy any guide from [/resources](/resources) into your coding agent and describe what you want to build. The guide handles setup, auth, schemas, and deployment. Your prompt shapes the business logic.

### Example prompts

Pair a guide with a short description of what you want. The more specific you are about the domain, fields, and layout, the better the result.

> Use the App with Lakebase guide. Build a customer feedback tracker where users submit feedback through a form with fields for customer name, product, rating (1-5), and comments. Display all submissions in a sortable table.

> Use the AI Chat App guide. Build an IT support assistant that helps employees troubleshoot common issues like VPN setup, password resets, and software installation requests. It should be conversational and remember chat history.

## Prerequisites

You need the [Databricks CLI](/docs/tools/databricks-cli) installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

## Companion docs

These docs explain the platform layers that guides build on:

- **[Agents](/docs/agents/quickstart)**: Build AI agents with tool orchestration, guardrails, and observability.
- **[Apps](/docs/apps/quickstart)**: Host web applications as managed Databricks workspace resources.
- **[Lakebase](/docs/lakebase/quickstart)**: Managed PostgreSQL for application data.
- **[Tools](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
