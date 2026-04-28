---
title: Start here
description: Build internal apps on the Databricks workspace your company already runs on. DevHub provides templates, the AppKit SDK, and companion docs.
---

# Start here

This site is for building internal apps on Databricks. Pick a template, scaffold with [AppKit](/docs/appkit/v0), deploy, and iterate.

## Your workspace is the foundation

Your company already has a **Databricks workspace**: a URL like `https://<your-org>.cloud.databricks.com` your team signs in to. For the internal app you're about to build, it determines **who** can sign in, **what** data the app can read or write (Unity Catalog tables and Lakebase Postgres), and **where** the app runs. Hosting, auth, and networking are handled for you. From your local machine, you connect to it with the [Databricks CLI](/docs/tools/databricks-cli).

## What you'll build

- **[Databricks Apps](/docs/apps/overview)**: where your internal app runs. Built for interactive internal tools, not static dashboards. Managed hosting and workspace SSO. Build it with [AppKit](/docs/appkit/v0), the open-source TypeScript SDK that wires up auth, plugins, and pre-built React components.
- **[Lakebase Postgres](/docs/lakebase/overview)**: managed Postgres for OLTP storage co-located with your workspace data. Use it for sessions, app state, conversation history, or any data your app reads and writes at low latency.
- **[Agent Bricks](/docs/agents/overview)**: Databricks' enterprise agent platform, unifying model access, execution, governance, and context. Use it for AI features in your app: chat with internal docs (Knowledge Assistants), ask-your-data in plain English (Genie), foundation-model calls, or custom Python agents.

See [Platform overview](/docs/platform-overview) for how these layers fit together.

## Where to start

1. **Note your workspace URL** (looks like `https://<id>.cloud.databricks.com`).
2. **Install and authenticate the [Databricks CLI](/docs/tools/databricks-cli).** Required for every guide on this site.
3. **Install [agent skills](/docs/tools/ai-tools/agent-skills)** so your coding agent has Databricks platform context.
4. **Pick a [template](/templates)** that matches your internal app. Browse [Apps overview](/docs/apps/overview) first if you want the conceptual picture.
