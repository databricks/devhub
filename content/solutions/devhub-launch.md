---
title: "Introducing dev.databricks.com"
url: /solutions/devhub-launch
summary: "A developer hub for building internal apps on the Databricks workspace your company already runs on: templates, the AppKit SDK, agent skills, and docs written for engineers."
---

# Introducing dev.databricks.com

We're launching **dev.databricks.com**, a site for engineers building internal apps on the Databricks workspace your company already runs on.

If your team already has data in Databricks and you want to build something on top of it — a chat over your docs, a small internal tool, an analytics frontend — this site is the shortest path from an empty folder to a deployed app.

## Why we built this

We're engineers, and we wanted the kind of resource we wished we'd had when we started building on Databricks: code-first, opinionated, and short enough to read end to end. The official Databricks documentation is comprehensive and built for a broad audience. dev.databricks.com is the developer-facing companion — copy-pasteable, AI-agent-friendly, and focused on the actual workflow of building, deploying, and iterating on a Databricks app.

## The journey

Building on Databricks comes down to four things, and they map to what you'll find on the landing page:

1. **[Note your workspace URL](/docs/start-here)** — `https://<your-org>.cloud.databricks.com`. It's the foundation: it determines who can sign in, what data the app can read and write, and where it runs. Hosting, auth, and networking come with it.
2. **Install the [Databricks CLI](/docs/tools/databricks-cli) and the [agent skills](/docs/tools/ai-tools/agent-skills).** The CLI is how you talk to your workspace from your machine. The agent skills give your coding agent enough Databricks context to be useful — auth, provisioning, deploys.
3. **Pick a [template](/templates) and copy it into your agent.** Every template is a prompt. Paste it into Cursor, Claude Code, Codex, or any coding agent and it will scaffold the app, wire up Lakebase or Genie or Model Serving where needed, and iterate with you.
4. **Deploy.** When you're ready, tell your agent to deploy. The app ships to Databricks Apps and you get a live URL inside your workspace, with SSO and governance built in.

That's it. There's a "Copy prompt for your agent" button on the landing page that gets you straight into step 3 with a guided wizard.

## Templates

Templates are the building blocks. Each one is a self-contained markdown prompt that walks you (and your agent) through one outcome end to end. Today the landing page surfaces:

- **[Hello World App](/templates/hello-world-app)** — local bootstrap, app scaffolding, and your first deploy.
- **[AI Chat App](/templates/ai-chat-app)** — streaming chat over Model Serving, with chat history persisted in Lakebase.
- **[App with Lakebase](/templates/app-with-lakebase)** — a Databricks app with managed Postgres, schema setup, and CRUD routes.
- **[Genie Analytics App](/templates/genie-analytics-app)** — a Databricks app with embedded conversational analytics powered by AI/BI Genie.
- **[Lakebase Off-Platform](/templates/lakebase-off-platform)** — using Lakebase from apps hosted outside Databricks (Vercel, Netlify, AWS).
- **[Operational Data Analytics](/templates/operational-data-analytics)** — Unity Catalog, Lakehouse Sync CDC, and a medallion pipeline from your operational database.

Browse them all on the [templates page](/templates).

## Designed to be pasted into a coding agent

The way developers ship software is changing, and the docs we read have to work for our agents too. Every template on the site is:

- **Self-contained markdown** with explicit prerequisites — no rendered UI, no "fill in the blanks" placeholders.
- **Available as raw markdown** by appending `.md` to any URL (e.g. `https://dev.databricks.com/templates/ai-chat-app.md`).
- **Reachable via our [docs MCP server](/docs/tools/ai-tools/docs-mcp-server)** for IDEs that speak Model Context Protocol.

A workflow that works well:

1. Open a template page on dev.databricks.com.
2. Copy the page (or grab the `.md` URL) and paste it into your agent.
3. Tell the agent which workspace, catalog, and Lakebase project to use, and let it run.
4. Iterate in the same chat — the agent already has the full template as context.

## Get started

1. Install the [Databricks CLI](/docs/tools/databricks-cli) and authenticate against your workspace.
2. Install the [agent skills](/docs/tools/ai-tools/agent-skills) in your coding agent.
3. Hit the **Copy prompt for your agent** button on the [landing page](/), or pick a [template](/templates) and paste it into your agent.

We're actively expanding the site. If you're building on Databricks and there's a pattern you want to see covered, we want to hear from you.

Welcome to dev.databricks.com.
