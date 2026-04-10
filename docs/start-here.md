---
title: Start here
description: DevHub is the developer platform for Databricks. Browse recipes and templates at /resources, copy them into your AI coding agent, and start building.
---

# Start here

Everything you need to build and deploy data apps and AI agents on Databricks. The site is organized around [recipes and templates](/resources). Copy one into your AI coding agent and describe what you want to build. These docs cover the underlying platform when you need to go deeper.

## Pick a template

Browse all templates at [dev.databricks.com/resources](/resources). Starting points:

| Template                                                  | Best for                                   |
| --------------------------------------------------------- | ------------------------------------------ |
| [Hello World App](/resources/hello-world-app)             | Simple apps, static pages, getting started |
| [App with Lakebase](/resources/app-with-lakebase)         | CRUD apps with persistent storage          |
| [AI Chat App](/resources/ai-chat-app)                     | Conversational AI, chatbots, assistants    |
| [Lakebase Off-Platform](/resources/lakebase-off-platform) | Apps hosted outside Databricks             |

## Use a template

Copy any template from [/resources](/resources) into your coding agent and describe what you want to build. The template handles setup, auth, schemas, and deployment. Your prompt shapes the business logic.

### Example prompts

Pair a template with a short description of what you want. The more specific you are about the domain, fields, and layout, the better the result.

> Use the App with Lakebase template. Build a customer feedback tracker where users submit feedback through a form with fields for customer name, product, rating (1-5), and comments. Display all submissions in a sortable table.

> Use the AI Chat App template. Build an IT support assistant that helps employees troubleshoot common issues like VPN setup, password resets, and software installation requests. It should be conversational and remember chat history.

## Prerequisites

You need the [Databricks CLI](/docs/tools/databricks-cli) installed and [authenticated](/docs/tools/databricks-cli#authenticate) against your workspace.

## Companion docs

These docs explain the platform layers that templates build on:

- **[Agents](/docs/agents/getting-started)**: Build AI agents with tool orchestration, guardrails, and observability.
- **[Apps](/docs/apps/getting-started)**: Host web applications as managed Databricks workspace resources.
- **[Lakebase](/docs/lakebase/getting-started)**: Managed PostgreSQL for application data.
- **[Tools](/docs/tools/databricks-cli)**: Databricks CLI, agent skills, and MCP server.
