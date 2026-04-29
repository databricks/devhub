---
title: "Introducing dev.databricks.com"
url: /solutions/devhub-launch
summary: "A developer hub for building on Databricks: opinionated templates, full example apps, and agent-ready documentation for software engineers."
---

# Introducing dev.databricks.com

We're launching **dev.databricks.com**, a developer-first resource for building data applications and AI agents on Databricks.

If you're a software engineer evaluating Databricks, getting started with your first project, or looking for practical patterns to accelerate your work, this site is for you.

## Why we built this

Databricks has powerful infrastructure for data, AI, and application development. But finding the right starting point as a software engineer (especially one who thinks in code, not slide decks) has been harder than it should be.

The official Databricks documentation is comprehensive, but it's written for a broad audience. What was missing was an opinionated, code-forward resource aimed squarely at developers who want to build, ship, and iterate fast.

That's what dev.databricks.com is.

## What you'll find here

### Documentation for developers

The [docs](/docs/start-here) section covers the core building blocks of the Databricks developer stack:

- **[Agent Bricks (AI Tools)](/docs/agents/overview)**: Connect Knowledge Assistants, Genie spaces, and governed LLM endpoints to your AppKit app using the Model Serving and Genie plugins.
- **[Apps](/docs/apps/quickstart)**: Build and deploy full-stack web applications as managed Databricks workspace resources using AppKit.
- **[Lakebase](/docs/lakebase/quickstart)**: Use managed PostgreSQL that separates compute from storage, with instant branching, serverless scale, and Unity Catalog integration.
- **[Tools](/docs/tools/databricks-cli)**: The Databricks CLI, AppKit SDK, agent skills for AI coding assistants, and an MCP server for documentation access.

Every page is written to be practical. Less theory, more working code.

### Templates for every shape of work

The [templates](/templates) page is a single catalog of opinionated, copy-pasteable building blocks, end-to-end walkthroughs, and full deployable example apps. Use one as a starting point and ship.

#### Full deployable example apps

Each example app comes with a `template/README.md` runbook that covers infrastructure provisioning, data seeding, pipeline deploys, and app deployment, taking you from zero to a running app:

| Example                                                           | What it demonstrates                                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **[Agentic Support Console](/templates/agentic-support-console)** | Lakebase, Lakehouse Sync CDC, a medallion pipeline, an LLM agent job, reverse sync, and Genie analytics in one app |
| **[SaaS Subscription Tracker](/templates/saas-tracker)**          | CRUD app with Lakebase persistence and Genie spend analytics                                                       |
| **[Content Moderator](/templates/content-moderator)**             | Per-channel policies, AI compliance scoring via Model Serving, moderator review workflow, and Genie analytics      |

Each example builds on smaller templates. Clone the repo, follow the README, and you have a working app that demonstrates how the full Databricks developer stack fits together.

#### Copy-pasteable templates

Many templates are self-contained, copy-pasteable markdown documents that walk you through a specific task from start to finish. Each is designed to work with AI coding agents — copy the raw markdown and paste it into Cursor, Windsurf, Claude Code, or any agent-powered IDE, and it walks the agent through the implementation step by step.

Highlights:

- **[Databricks Local Bootstrap](/templates/databricks-local-bootstrap)**: Set up a local development environment with CLI, auth, and agent skills in one pass.
- **[Streaming AI Chat with Model Serving](/templates/ai-chat-model-serving)**: Wire up AI SDK with Databricks Model Serving for streaming chat responses.
- **[Lakebase Data Persistence](/templates/lakebase-data-persistence)**: Add a managed Postgres database to your app with schema setup and full CRUD API routes.
- **[Genie Conversational Analytics](/templates/genie-conversational-analytics)**: Embed a natural-language analytics chat interface powered by Databricks AI/BI Genie.
- **[Lakehouse Sync CDC Replication](/templates/lakebase-change-data-feed-autoscaling)**: Replicate Lakebase tables into Unity Catalog as Delta tables with change data capture.
- **[Medallion Architecture from CDC](/templates/medallion-architecture-from-cdc)**: Transform CDC history tables into silver/gold layers using Lakeflow Declarative Pipelines.

#### End-to-end walkthroughs

Some templates compose multiple smaller ones into end-to-end project blueprints. Pick one and follow it as a script:

| Walkthrough                                                             | What it builds                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **[Hello World App](/templates/hello-world-app)**                       | CLI setup, auth, app scaffolding, and agent skills                                 |
| **[AI Chat App](/templates/ai-chat-app)**                               | Streaming chat with Model Serving, AI SDK, and persistent chat history in Lakebase |
| **[App with Lakebase](/templates/app-with-lakebase)**                   | App with Lakebase for persistent storage, schema setup, and CRUD API               |
| **[Genie Analytics App](/templates/genie-analytics-app)**               | Conversational analytics with AI/BI Genie                                          |
| **[Lakebase Off-Platform](/templates/lakebase-off-platform)**           | Use Lakebase from Vercel, Netlify, or AWS with portable env and token management   |
| **[Operational Data Analytics](/templates/operational-data-analytics)** | Unity Catalog, Lakehouse Sync CDC, and a medallion architecture pipeline           |

These are particularly useful when you're starting a new project and want a proven architecture rather than assembling individual pieces. The example apps above are built from them.

### Raw markdown API

Every template, doc page, and solution on this site is available as raw markdown through a simple API. Append `.md` to any content URL:

```
https://dev.databricks.com/solutions/devhub-launch.md
https://dev.databricks.com/templates/ai-chat-app.md
https://dev.databricks.com/templates/agentic-support-console.md
https://dev.databricks.com/docs/start-here.md
```

This makes it straightforward to feed documentation directly into LLMs, build tooling on top of our content, or integrate it into your own workflows.

### MCP server for AI tools

We also provide an [MCP server](/docs/tools/ai-tools/docs-mcp-server) that exposes the full documentation set to AI coding assistants via the Model Context Protocol. If your IDE supports MCP, you can point it at our server and your AI assistant will have access to all of our docs and templates as context.

### Agent skills

The [agent skills](/docs/tools/ai-tools/agent-skills) are specialized instruction sets that teach AI coding agents how to work with Databricks products. Install them in Cursor, Windsurf, or Claude Code, and your agent will know how to authenticate, provision resources, deploy apps, and more, without you having to explain the platform from scratch each time.

## Built for agent-led development

The way developers build software is changing. AI coding agents are becoming a core part of the workflow, and the documentation they consume matters as much as the documentation humans read.

Every piece of content on dev.databricks.com is written with this in mind:

- **Templates are self-contained markdown.** No dependencies on rendered UI or interactive elements. They work in a browser and in an agent's context window.
- **Examples ship complete codebases.** Clone the repo, follow `template/README.md`, and you have a deployed app. Every example includes the full stack: AppKit app, Databricks Asset Bundles, optional pipelines, seed scripts, and provisioning SQL.
- **Prerequisites are explicit.** Each template declares what it needs, so agents can chain them correctly.
- **Code blocks are complete and runnable.** No pseudo-code or "fill in the blanks" placeholders.
- **End-to-end walkthroughs compose smaller templates deterministically.** Agents can follow them like a script.

This isn't documentation that happens to work with AI tools. It's documentation designed from the ground up for a world where developers and agents collaborate.

## What's next

We're actively expanding the content and would love feedback on what to build next. Some areas we're exploring:

- More example apps covering RAG, real-time dashboards, and multi-agent workflows
- Templates for MLflow, feature engineering, and Unity Catalog governance
- Deeper AppKit documentation with plugin development pages
- Community-contributed templates and examples

If you're building on Databricks and have ideas for what would help, we want to hear from you.

## Get started

The fastest way to start building:

1. Install the [Databricks CLI](/docs/tools/databricks-cli) and authenticate with your workspace
2. Browse the [templates](/templates) to find one that matches your use case
3. Copy a template into your AI coding agent, or clone an example and follow its README
4. Read the [docs](/docs/start-here) when you need to go deeper on any topic

Welcome to dev.databricks.com.
