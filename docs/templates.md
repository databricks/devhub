---
title: What are templates?
sidebar_label: What are templates?
description: Templates are copy-paste agent prompts that drive your coding assistant through a Databricks build task, from scaffolding a full app to adding one feature to an existing one.
---

# What are templates?

DevHub includes a collection of [templates](/templates) that can help you quickly scaffold a Databricks app.

A **template** is simply an agent prompt — a block of text you paste into your coding assistant (Cursor, Claude Code, Codex, or any agent that runs in your editor) that tells it exactly how to build something on Databricks.

The assistant will do the actual building. It will ask clarifying questions, run the Databricks CLI, write code, and deploy. You stay in the loop to make high-level decisions, but you do not have to know or remember any specific commands.

## How to use a template

Every template on this site has a **Copy prompt** button at the top.

1. Open a template at [/templates](/templates) and pick the one that matches what you want to build.
2. Click **Copy prompt** and paste the result into your coding agent.
3. The agent reads the prompt, asks the questions it needs (which workspace, which catalog, real data or seed data, etc.), and then builds.

## The flavors

Templates come in two flavors: end-to-end app templates and task templates.

### End-to-end app templates

The agent builds a complete Databricks app from scratch — UI, server, Databricks resources, and deploy steps included. Use these when you are starting a fresh project and want a working app you can adapt to your use case.

Examples:

- [App with Lakebase](/templates/app-with-lakebase) — a CRUD app backed by managed Postgres.
- [AI Chat App](/templates/ai-chat-app) — a chat app with streaming responses and persistent conversation history.
- [Vacation Rentals Operations Console](/templates/vacation-rentals) — a booking queue with Lakebase-backed flags and agent notes, SQL Warehouse revenue analytics, and an embedded Genie chat panel.

Some end-to-end templates also include a deployable starter codebase from the Databricks [app-templates](https://github.com/databricks/app-templates) repository. When that is the case, the agent clones it as the starting point and adapts it to your data, your workspace, and your use case.

### Task templates

The agent performs one focused job on an existing project. Use these when you already have a Databricks app and want to add something to it.

Examples:

- [Onboard Your Coding Agent](/templates/onboard-your-coding-agent) — install Databricks platform skills and the Docs MCP server in your repo.
- [Lakebase Data Persistence](/templates/lakebase-data-persistence) — add managed Postgres storage to an app you already have.
- [Create a Lakebase Instance](/templates/lakebase-create-instance) — provision a Lakebase project and collect the connection values.

Task templates are designed to compose. Several of them stitched together can take you from an empty repo to a deployed app — which is what the end-to-end templates do under the hood.

## Where to go next

- Browse the full [templates catalog](/templates).
- Dive deeper into Databricks platform services that you can use to build your app: [Databricks Apps](/docs/apps/overview), [Lakebase Postgres](/docs/lakebase/overview), [Agent Bricks](/docs/agents/overview), and the [Data Lakehouse](/docs/lakehouse/overview).
