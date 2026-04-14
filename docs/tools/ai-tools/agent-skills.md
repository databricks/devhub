---
title: Agent skills
---

# Agent skills

Agent skills are task-specific instruction files that AI coding assistants load to perform Databricks development tasks. The Databricks skills live in [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) and follow the open [agent skills standard](https://agentskills.io/).

Skills tell your coding agent how Databricks works, including CLI conventions, auth patterns, and resource names, so it generates correct code instead of guessing.

## Install

```bash
databricks experimental aitools install
```

The CLI auto-detects installed coding agents (Claude Code, Cursor, Codex CLI, etc.) and symlinks skills into each agent's config directory from a shared canonical location (`~/.databricks/aitools/skills/`). By default skills install globally. Pass `--project` to scope them to the current project instead.

| Option           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `--global`       | Install globally (default)                     |
| `--project`      | Install to project directory                   |
| `--agents`       | Target specific agents (comma-separated)       |
| `--skills`       | Install specific skills only (comma-separated) |
| `--experimental` | Include experimental skills                    |

## Manage

```bash
databricks experimental aitools update
databricks experimental aitools list
databricks experimental aitools uninstall
```

`update` fetches the latest release and auto-installs new skills from the manifest. Pass `--check` for a dry run, `--no-new` to skip new skills, or `--force` to re-download even if versions match. `uninstall` removes all skills, or pass `--skills` to remove specific ones. All three commands accept `--global` (default) and `--project` to control scope.

## Other install methods

The [Skills CLI](https://github.com/vercel-labs/skills) provides an alternative with interactive prompts:

```bash
npx skills add databricks/databricks-agent-skills
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
