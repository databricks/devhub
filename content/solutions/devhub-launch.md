Hello World, developers.databricks.com!

We're launching **developers.databricks.com**, a site for developers building internal apps on the Databricks workspace your company already runs on.

If your team already has data in Databricks and you want to build something on top of it — a chat over your docs, an agentic internal tool, an analytics frontend — this site is the shortest path from an empty folder to a deployed app.

## Why we built this

We're engineers, and we wanted the kind of resource we wished we'd had when we started building on Databricks: code-first, opinionated, and short enough to read end to end. The official Databricks documentation is comprehensive and built for a broad audience. developers.databricks.com is the developer-facing companion — copy-pasteable, AI-agent-friendly, and focused on the actual workflows of building, deploying, and iterating on Databricks apps, Lakebase databases, and Agent Bricks AI components.

## Templates

Templates are the building blocks. Each one is a self-contained markdown prompt that walks you (and your coding agent) through one outcome end to end.

Templates come in three flavors.

### Atomic recipes

Short, single-purpose guides for adding one capability to a system you're already building:

- **[Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment)** — install the CLI, authenticate a profile, smoke-test the handshake. The starting point for everything else.
- **[Spin Up a Databricks App](/templates/spin-up-databricks-app)** — scaffold a fresh AppKit Databricks app, run it locally, and deploy it to your workspace.
- **[Onboard Your Coding Agent](/templates/onboard-your-coding-agent)** — install Databricks agent skills, wire up the Docs MCP server, and bootstrap an `AGENTS.md` so your agent knows your workspace defaults.
- **[Volume File Manager](/templates/volume-file-upload)** — add file upload, browsing, and CSV preview to your app via Unity Catalog Volumes.

### End-to-end walkthroughs

Longer prompts that compose multiple recipes into a complete system, ready to hand to a coding agent:

- **[AI Chat App](/templates/ai-chat-app)** — streaming chat over Model Serving, with chat history persisted in Lakebase.
- **[App with Lakebase](/templates/app-with-lakebase)** — a Databricks app with managed Postgres, schema setup, and CRUD routes.
- **[Genie Analytics App](/templates/genie-analytics-app)** — a Databricks app with embedded conversational analytics powered by AI/BI Genie.
- **[Lakebase Off-Platform](/templates/lakebase-off-platform)** — using Lakebase from apps hosted outside Databricks (Vercel, Netlify, AWS).
- **[Operational Data Analytics](/templates/operational-data-analytics)** — Unity Catalog, Lakehouse Sync CDC, and a medallion pipeline from your operational database.

### Example apps

Walkthroughs that come with a working code base and seed data, so you (and your agent) can start from a real app:

- **[Agentic Support Console](/templates/agentic-support-console)** — Lakebase, Lakehouse Sync, a medallion pipeline, an LLM agent job, and a Databricks app with embedded Genie analytics.
- **[Vacation Rentals Operations Console](/templates/vacation-rentals)** — booking queue with Lakebase-backed flags and agent notes, SQL Warehouse revenue analytics, and an embedded Genie chat panel.
- **[RAG Chat App](/templates/rag-chat)** — streaming RAG over a Wikipedia seed corpus with pgvector retrieval from Lakebase and Model Serving generation.

Browse them all on the [templates page](/templates).

## Companion docs

Templates tell you _how_ to build something. The docs explain _what_ the underlying platform actually is, so you (and your agent) can make informed decisions. Each page is short and opionated. It's meant to be just enough so you understand how the services and components fit together.

- **[Platform overview](/docs/platform-overview)** — how Databricks Apps, Lakebase, Agent Bricks, and Unity Catalog fit together for an internal app.
- **[Databricks Apps](/docs/apps/overview)** — the managed runtime your app deploys to, with workspace SSO, secrets, and the [AppKit](/docs/appkit/v0) TypeScript SDK that wires it all together.
- **[Lakebase](/docs/lakebase/overview)** — managed Postgres co-located with your workspace data: when to use it, how to provision an instance, and how to connect from on- and off-platform apps.
- **[Agent Bricks](/docs/agents/overview)** — the agent platform: foundation-model calls through the [AI Gateway](/docs/agents/ai-gateway), conversational analytics with [Genie](/docs/agents/genie), and [custom agents](/docs/agents/custom-agents).
- **[Tools](/docs/tools/databricks-cli)** — the [Databricks CLI](/docs/tools/databricks-cli), [agent skills](/docs/tools/ai-tools/agent-skills) for your coding agent, and the [Docs MCP server](/docs/tools/ai-tools/docs-mcp-server) that exposes every page on this site to MCP-aware IDEs.

Start at [/docs/start-here](/docs/start-here) if you want the guided tour.

## Designed to be pasted into a coding agent

The way developers ship software is changing, and the content we read have to work for our agents too. Every template (and docs page) on the site is:

- **Copy-pastable markdown** meant to be used by a coding agent.
- **Available as raw markdown** by appending `.md` to any URL.
- **Reachable via our [docs MCP server](/docs/tools/ai-tools/docs-mcp-server)** for IDEs that speak Model Context Protocol.

A workflow that works well:

1. Open a template page on developers.databricks.com.
2. Hit the **Copy** button to grab the page as markdown.
3. Paste it into your coding agent and let it walk you through the build.
4. Iterate in the same chat — the agent already has the full template as context.

## Get started

Head to the [landing page](/) and copy the intro prompt. From there, your agent will guide you through an end-to-end development workflow across Databricks Apps, Lakebase, and Agent Bricks.

We're actively expanding the site. If you're building on Databricks and there's a pattern you want to see covered, [open an issue on GitHub](https://github.com/databricks/devhub/issues) — we read every one. You can also join the conversation with other Databricks developers on the [r/databricks subreddit](https://www.reddit.com/r/databricks).

Welcome to developers.databricks.com.
