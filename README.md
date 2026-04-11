# DevHub

**[dev.databricks.com](https://dev.databricks.com)** is the home for developers building data and AI applications on Databricks. It is opinionated documentation, runnable guides and examples, and copy-paste-friendly content so you—and your coding agents—can go from idea to deployed app in minutes not months.

## Why build on Databricks?

Databricks brings **operational data**, **AI agents**, and **apps** together on one platform: **Lakebase** for Postgres that lives next to your lakehouse, **Agent Bricks** for governed, production-grade agents on your data, and **Databricks Apps** for secure, serverless frontends and APIs. DevHub is where we show you how those pieces fit into real workflows—not slides, but guides, templates, and full examples you can run.

**AppKit** is the open-source TypeScript SDK for building those apps: React UI, Express server, Databricks Asset Bundle integration, and plugins (Lakebase, Genie, analytics, and more). The code lives in **[github.com/databricks/appkit](https://github.com/databricks/appkit)**. On DevHub, start with the **[AppKit documentation](https://dev.databricks.com/docs/apps/appkit)**—it mirrors what you will see in templates and examples.

## What DevHub offers

- **Guides** — Step-by-step recipes and multi-recipe cookbooks for common outcomes (bootstrap, Lakebase, Genie, bundles, and more).
- **Examples** — End-to-end sample apps with code in this repo under `examples/`, plus narrative on each example page.
- **Solutions** — Curated paths for specific scenarios when you need a higher-level map.
- **Docs** — Product docs for Apps, Lakebase, Agents, CLI, and tools. **[AppKit](https://dev.databricks.com/docs/apps/appkit)** covers the SDK; the generated **[AppKit reference](https://dev.databricks.com/docs/appkit/v0)** (UI components and APIs) lives alongside it.
- **Copy as Markdown** — On resource pages, export content as Markdown for prompts, docs, or PRs. Examples also expose **Copy prompt** flows tuned for AI-assisted development.
- **`/llms.txt`** — A machine-friendly index of the site so LLMs and tools can discover and cite DevHub content.
- **Markdown for agents** — Server-side routes and exports serve raw markdown where needed so tools, MCP clients, and coding agents can pull consistent text (see `api/`).

## How to use these resources

This is the same rhythm as our **[Start here](https://dev.databricks.com/docs/start-here)** doc—sketched here so the README stands alone on GitHub.

1. **Browse [Resources](https://dev.databricks.com/resources)** — Filter **Guides** (recipes and multi-step templates) or **Examples** (full app walkthroughs with runnable code in this repo).
2. **Copy** — Use **Copy as Markdown** or **Copy prompt** on a resource page so your agent gets recipes, commands, and context in one paste.
3. **Give it to your coding agent** — Paste into Cursor, Claude Code, Codex, or your usual tool. Add a short brief: domain, data, UX, and what “done” looks like.
4. **Build end to end** — Work with your agent on application code, Databricks Asset Bundles, Lakebase, and platform wiring until you have a **production-ready agentic application**: secure, deployable, and aligned with how Apps and Agents are meant to run on Databricks—not a one-off script.

You will need the [Databricks CLI](https://dev.databricks.com/docs/tools/databricks-cli) installed and authenticated to your workspace before you deploy. For prerequisites, prompts, and companion docs (Agents, Apps, Lakebase), see **[Start here](https://dev.databricks.com/docs/start-here)**.

Whether you are typing `databricks apps init` yourself or pasting a bootstrap prompt into your agent, the goal is the same: **ship faster on a platform that already unifies data, governance, and deployment.**

## Tech stack

This site is built with **Docusaurus** and **TypeScript**.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution workflow.
