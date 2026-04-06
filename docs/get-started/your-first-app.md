---
title: Your First App
description: Pick a template, paste it into your AI coding agent, and deploy your first app on Databricks. Step-by-step guide with templates for data apps, chat apps, dashboards, and more.
---

# Your First App

The fastest way to build and deploy an app on Databricks is to pair a template from [/resources](/resources) with an AI coding agent.

Templates are end-to-end build instructions — they tell an agent how to scaffold a project, connect to Databricks services, and wire up the right APIs. You bring the idea, the template brings the infrastructure.

## How it works

1. **Pick a template** that matches what you want to build.
2. **Copy its markdown** into your coding agent (Cursor, Windsurf, Claude Code, ChatGPT, or any agent that can write code).
3. **Describe what you want** alongside the template so the agent builds your specific app, not just the boilerplate.

That's it. The template handles Databricks CLI setup, authentication, database schemas, model serving endpoints, and deployment — your agent follows the instructions and you get a running app.

## Pick a template

Browse all templates at [dev.databricks.com/resources](/resources). Here are the starting points:

| Template                                                           | Best for                                   | Example prompt                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| [Base App Template](/resources/base-app-template)                  | Simple apps, static pages, getting started | "Build a hello-world landing page on Databricks Apps"                              |
| [Data App Template](/resources/data-app-template)                  | CRUD apps with persistent storage          | "Build a customer feedback tracker with a form and a table of submissions"         |
| [AI Chat App Template](/resources/ai-chat-app-template)            | Conversational AI, chatbots, assistants    | "Build an IT support assistant that answers questions about our internal policies" |
| [Lakebase Off-Platform](/resources/lakebase-off-platform-template) | Apps hosted outside Databricks             | "Build a Next.js app on Vercel that stores data in Lakebase"                       |

Not sure which one to use? Start with the **Data App Template** — it covers the most common pattern of storing and displaying data.

## Copy the template into your agent

Every template page on [/resources](/resources) has a **"Copy as"** menu in the top right. Use it to:

- **Copy Markdown** — paste directly into any chat-based agent.
- **View Raw Markdown** — open the raw content in a new tab for reference.
- **Send to ChatGPT** or **Open in Claude** — open a new conversation with the template pre-loaded.
- **Connect to MCP Server** — copy the MCP server config for agents that support the Model Context Protocol (like Cursor or Claude Code). This lets the agent pull documentation on demand.

For Cursor, Windsurf, or Claude Code, copying the markdown and pasting it into the chat is the simplest path. For ChatGPT or Claude, use the direct send buttons.

## Write your prompt

Combine the template with a short description of what you want to build. The pattern is:

```
<what you paste from the template>

Build me <what you actually want>.
```

Here are a few examples to get you started.

### A customer feedback tracker

> Use the Data App Template. Build a customer feedback tracker where users
> submit feedback through a form with fields for customer name, product,
> rating (1-5), and comments. Display all submissions in a sortable table.

### An IT support chatbot

> Use the AI Chat App Template. Build an IT support assistant that helps
> employees troubleshoot common issues — VPN setup, password resets,
> software installation requests. It should be conversational and remember
> chat history.

### A sales analytics dashboard

> Use the Analytics Dashboard App Template. Build a sales dashboard that
> shows total revenue, deal count, and average deal size. Add filters for
> region and date range. Include a bar chart of revenue by product category.

### A data exploration app

> Use the AI Data Explorer Template. Build an app for our product team
> to explore customer usage data. They should be able to ask natural
> language questions like "which features have the highest adoption this
> month" and see charts in the response.

The more specific you are about the domain, the fields, and the layout, the better the result. The template handles the Databricks wiring — your prompt shapes the business logic.

## What happens next

Your coding agent follows the template instructions step by step:

1. Installs the Databricks CLI and authenticates against your workspace.
2. Scaffolds the project structure with the right dependencies.
3. Provisions Databricks resources (Lakebase databases, model serving endpoints, Genie spaces — depending on the template).
4. Implements your business logic on top of the scaffolded app.
5. Deploys to Databricks Apps.

If something fails during the build, the template includes troubleshooting context for each step. The agent can usually self-correct.

## Build your own cookbook

If none of the templates are an exact fit, you can assemble a custom cookbook from individual recipes:

1. Go to [/resources](/resources) and scroll to **All Recipes**.
2. Select the recipes you need (for example, "Databricks Local Bootstrap" + "Lakebase Data Persistence" + "Genie Conversational Analytics").
3. Use the **"Copy as"** menu to export your custom selection.
4. Paste it into your agent with your prompt.

This is useful when you want to mix capabilities — like combining a data persistence layer with a conversational analytics interface, but without the AI chat component.

## Source of truth

- [All templates and recipes](/resources)
- [Databricks Apps documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)
- [AppKit documentation](/docs/appkit/v0)
