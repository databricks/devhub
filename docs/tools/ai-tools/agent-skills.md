---
title: Agent skills
---

# Agent skills

Agent skills are task-specific instruction files that AI coding assistants load to perform Databricks development tasks. They follow the open [Agent Skills](https://agentskills.io/) standard and package Databricks CLI workflows and platform knowledge for AI assistants.

The Databricks skills live in [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills).

## Install

Install skills using the [Skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add databricks/databricks-agent-skills
```

The CLI prompts you to pick skills and agents interactively. Use `-y` to install all skills without prompts, and `-a` to target a specific agent:

```bash
npx skills add databricks/databricks-agent-skills -a claude-code -y
```

Verify installed skills with `npx skills list` and remove with `npx skills remove`.

### Project vs global scope

By default, skills install to the **project** (`./.agents/skills/`) and are committed with your code, with symlinks for each agent. Use `-g` for a **global** install (`~/.agents/skills/`) that applies across all projects.

### Other install methods

The Databricks CLI can also install skills globally across all detected agents:

```bash
databricks experimental aitools skills install
```

Cursor also supports `/add-plugin databricks-skills` in chat.

## Available skills

Most skills declare `databricks-core` as a parent, so agents load it first for CLI and auth context.

| Skill                      | Description                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-core`          | CLI operations, auth, profiles, and data exploration. Base skill for all others.                                                                                                |
| `databricks-apps`          | Build apps on Databricks Apps using AppKit. Includes references for the AppKit SDK, SQL queries, tRPC, Lakebase, Model Serving, and testing.                                    |
| `databricks-dabs`          | Create, configure, deploy, and manage Declarative Automation Bundles. References for bundle structure, pipelines, alerts, and permissions.                                      |
| `databricks-jobs`          | Develop and deploy Lakeflow Jobs with notebooks, Python wheels, or SQL tasks.                                                                                                   |
| `databricks-lakebase`      | Manage Lakebase Postgres Autoscaling projects, branches, and endpoints.                                                                                                         |
| `databricks-model-serving` | Manage Model Serving endpoints for LLM inference, custom models, or external models. _(experimental)_                                                                           |
| `databricks-pipelines`     | Develop Lakeflow Spark Declarative Pipelines (formerly DLT). Large reference set covering streaming tables, materialized views, Auto Loader, Auto CDC, expectations, and sinks. |

## Other skill repositories

- [AI Dev Kit skills](https://github.com/databricks-solutions/ai-dev-kit/tree/main/databricks-skills) -- community patterns for SQL analytics, ML evaluation, model serving, streaming, and Unity Catalog
- [MLflow skills](https://github.com/mlflow/skills) -- tracing, LLM judges, evals, and production traffic analysis

## Further reading

- [Agent skills (Databricks docs)](https://docs.databricks.com/aws/en/agent-skills/)
- [AI-assisted development](/docs/appkit/v0/development/ai-assisted-development)
- [Local bootstrap recipe](/resources/databricks-local-bootstrap)
- [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server)
