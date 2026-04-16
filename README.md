# DevHub

**[dev.databricks.com](https://dev.databricks.com)** is the home for developers building data and AI applications on Databricks. It is opinionated documentation, runnable guides and examples, and copy-paste-friendly resources so you—and your coding agents—can go from idea to deployed app in minutes not months.

## Why build on Databricks?

Databricks brings **operational data**, **AI agents**, and **apps** together on one platform: **Lakebase** for Postgres that lives next to your lakehouse, **Agent Bricks** for governed, production-grade agents on your data, and **Databricks Apps** for secure, serverless frontends and APIs. DevHub is where we show you how those pieces fit into real workflows—not slides, but guides, templates, and full examples you can run.

The easiest way to get started building on Databricks is **AppKit**. [AppKit](https://github.com/databricks/appkit) is the open-source TypeScript SDK for building those apps: React UI, Express server, Databricks Asset Bundle integration, and plugins (Lakebase, Genie, analytics, and more). DevHub guides and examples are built with AppKit.

## How to use DevHub guides and examples

1. **Browse [Resources](https://dev.databricks.com/resources)** — Filter **Guides** (step-by-step prompts) or **Examples** (full example apps with step-by-step instructions).
2. **Copy** — Use **Copy as Markdown** on a resource page so your agent gets recipes, commands, and context in one paste.
3. **Give it to your coding agent** — Paste into Cursor, Claude Code, Codex, or your usual tool. Add a short brief: domain, data, UX, and what “done” looks like.
4. **Build end to end** — Work with your agent on application code, Databricks Asset Bundles, Lakebase, and platform wiring until you have a **production-ready agentic application**: secure, deployable, and aligned with how Apps and Agents are meant to run on Databricks—not a one-off script.

You will need the [Databricks CLI](https://dev.databricks.com/docs/tools/databricks-cli) installed and authenticated to your workspace before you deploy. The [Vercel CLI](https://vercel.com/docs/cli) is also required for local development and deployments. For prerequisites, prompts, and companion docs (Agents, Apps, Lakebase), see **[Start here](https://dev.databricks.com/docs/start-here)**.

Whether you are typing `databricks apps init` yourself or pasting a bootstrap prompt into your agent, the goal is the same: **ship faster on a platform that already unifies data, governance, and deployment.**

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
