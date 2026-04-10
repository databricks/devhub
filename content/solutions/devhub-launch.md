---
title: "Introducing dev.databricks.com"
url: /solutions/devhub-launch
summary: "A new developer hub for building on Databricks: opinionated guides, copy-pasteable recipes, and agent-ready documentation for software engineers."
---

# Introducing dev.databricks.com

We're launching **dev.databricks.com** — a developer-first resource for building data applications and AI agents on Databricks.

If you're a software engineer evaluating Databricks, getting started with your first project, or looking for practical patterns to accelerate your work, this site is for you.

## Why we built this

Databricks has powerful infrastructure for data, AI, and application development. But finding the right starting point as a software engineer — especially one who thinks in code, not slide decks — has been harder than it should be.

The official Databricks documentation is comprehensive, but it's written for a broad audience. What was missing was an opinionated, code-forward resource aimed squarely at developers who want to build, ship, and iterate fast.

That's what dev.databricks.com is.

## What you'll find here

### Documentation for developers

The [docs](/docs/start-here) section covers the core building blocks of the Databricks developer stack:

- **[Agents](/docs/agents/getting-started)** — Design, develop, and deploy AI agents using Databricks model serving, with built-in guardrails, AI Gateway, and observability.
- **[Apps](/docs/apps/getting-started)** — Build and deploy full-stack web applications as managed Databricks workspace resources using AppKit.
- **[Lakebase](/docs/lakebase/getting-started)** — Use managed PostgreSQL that separates compute from storage, with instant branching, serverless scale, and Unity Catalog integration.
- **[Tools](/docs/tools/databricks-cli)** — The Databricks CLI, AppKit SDK, agent skills for AI coding assistants, and an MCP server for documentation access.

Every guide is written to be practical. Less theory, more working code.

### Copy-pasteable recipes

The [resources](/resources) section is the heart of this site. It contains **recipes** — self-contained, copy-pasteable markdown documents that walk you through a specific task from start to finish.

Each recipe is designed to work with AI coding agents. You can copy the raw markdown and paste it into Cursor, Windsurf, Claude Code, or any agent-powered IDE, and it will guide the agent through the implementation step by step.

Here are some examples:

- **[Databricks Local Bootstrap](/resources/recipes/databricks-local-bootstrap)** — Set up a local development environment with CLI, auth, and agent skills in one pass.
- **[Streaming AI Chat with Model Serving](/resources/recipes/ai-chat-model-serving)** — Wire up AI SDK with Databricks Model Serving for streaming chat responses.
- **[Lakebase Data Persistence](/resources/recipes/lakebase-data-persistence)** — Add a managed Postgres database to your app with schema setup and full CRUD API routes.
- **[Genie Conversational Analytics](/resources/recipes/genie-conversational-analytics)** — Embed a natural-language analytics chat interface powered by Databricks AI/BI Genie.
- **[Lakehouse Sync CDC Replication](/resources/recipes/lakebase-change-data-feed-autoscaling)** — Replicate Lakebase tables into Unity Catalog as Delta tables with change data capture.

There are currently **15 recipes** covering everything from initial workspace setup to production data pipelines.

### Templates that compose recipes

Templates bundle multiple recipes into end-to-end project blueprints. Instead of assembling pieces yourself, pick a template and follow a guided path:

| Template                                                                | What it builds                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **[Hello World App](/resources/hello-world-app)**                       | CLI setup, auth, app scaffolding, and agent skills                                 |
| **[AI Chat App](/resources/ai-chat-app)**                               | Streaming chat with Model Serving, AI SDK, and persistent chat history in Lakebase |
| **[App with Lakebase](/resources/app-with-lakebase)**                   | App with Lakebase for persistent storage, schema setup, and CRUD API               |
| **[Genie Analytics App](/resources/genie-analytics-app-template)**      | Conversational analytics with AI/BI Genie                                          |
| **[Lakebase Off-Platform](/resources/lakebase-off-platform)**           | Use Lakebase from Vercel, Netlify, or AWS with portable env and token management   |
| **[Operational Data Analytics](/resources/operational-data-analytics)** | Unity Catalog, Lakehouse Sync CDC, and a medallion architecture pipeline           |

Templates are particularly useful when you're starting a new project and want a proven architecture rather than assembling individual pieces.

### Raw markdown API

Every recipe, template, and solution on this site is available as raw markdown through a simple API. Append `.md` to any content URL:

```
https://dev.databricks.com/solutions/devhub-launch.md
https://dev.databricks.com/resources/ai-chat-app.md
https://dev.databricks.com/docs/start-here.md
```

This makes it straightforward to feed documentation directly into LLMs, build tooling on top of our content, or integrate it into your own workflows.

### MCP server for AI tools

We also provide an [MCP server](/docs/tools/ai-tools/docs-mcp-server) that exposes the full documentation set to AI coding assistants via the Model Context Protocol. If your IDE supports MCP, you can point it at our server and your AI assistant will have access to all of our docs and recipes as context.

### Agent skills

The [agent skills](/docs/tools/ai-tools/agent-skills) are specialized instruction sets that teach AI coding agents how to work with Databricks products. Install them in Cursor, Windsurf, or Claude Code, and your agent will know how to authenticate, provision resources, deploy apps, and more — without you having to explain the platform from scratch each time.

## Built for agent-led development

The way developers build software is changing. AI coding agents are becoming a core part of the workflow, and the documentation they consume matters as much as the documentation humans read.

Every piece of content on dev.databricks.com is written with this in mind:

- **Recipes are self-contained markdown** — no dependencies on rendered UI or interactive elements. They work in a browser and in an agent's context window.
- **Prerequisites are explicit** — each recipe declares what it needs, so agents can chain them correctly.
- **Code blocks are complete and runnable** — no pseudo-code or "fill in the blanks" placeholders.
- **Templates compose recipes deterministically** — agents can follow a template like a script, executing each recipe in order.

This isn't documentation that happens to work with AI tools. It's documentation designed from the ground up for a world where developers and agents collaborate.

## What's next

This is a starting point. We're actively expanding the content and would love feedback on what to build next. Some areas we're exploring:

- More recipes covering MLflow, feature engineering, and Unity Catalog governance
- End-to-end tutorials for common patterns like RAG applications and real-time dashboards
- Deeper AppKit documentation with plugin development guides
- Community-contributed recipes and templates

If you're building on Databricks and have ideas for what would help, we want to hear from you.

## Get started

The fastest way to start building:

1. Install the [Databricks CLI](/docs/tools/databricks-cli) and authenticate with your workspace
2. Browse the [resources](/resources) to find a template that matches your use case
3. Copy a template into your AI coding agent and let it scaffold your project
4. Read the [docs](/docs/start-here) when you need to go deeper on any topic

Welcome to dev.databricks.com.
