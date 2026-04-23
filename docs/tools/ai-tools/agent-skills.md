---
title: Agent skills
---

# Agent skills

Agent skills are task-specific instruction files that AI coding assistants load to perform Databricks development tasks. The Databricks skills live in [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) and follow the open [agent skills standard](https://agentskills.io/).

Skills tell your coding agent how Databricks works, including CLI conventions, auth patterns, and resource names, so it generates correct code instead of guessing.

## Install

```bash title="Common"
databricks experimental aitools install
```

```bash title="Specific agents"
databricks experimental aitools install --agents claude-code,cursor
```

```bash title="Project scope"
databricks experimental aitools install --project
```

The CLI auto-detects installed coding agents and symlinks skills into each agent's config directory from a shared canonical location (`~/.databricks/aitools/skills/`). Skills install globally by default.

| Option           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `--global`       | Install globally (default)                     |
| `--project`      | Install to project directory                   |
| `--agents`       | Target specific agents (comma-separated)       |
| `--skills`       | Install specific skills only (comma-separated) |
| `--experimental` | Include experimental skills                    |

## Manage

```bash title="List, update, or remove skills"
databricks experimental aitools list
databricks experimental aitools update
databricks experimental aitools uninstall
```

`update` fetches the latest release and auto-installs new skills from the manifest. Pass `--check` to preview without downloading. All commands accept `--global` (default) and `--project` to control scope.

## Other install methods

The [Skills CLI](https://github.com/vercel-labs/skills) provides an alternative with interactive prompts:

```bash
npx skills add databricks/databricks-agent-skills
```

Cursor also supports `/add-plugin databricks-skills` in chat.

## Available skills

Run `databricks experimental aitools skills list` to see available skills and their install status.

| Skill                  | Description                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks`           | CLI operations, auth, profiles, and data exploration. Base skill loaded by all others.                                                                                          |
| `databricks-apps`      | Build apps on Databricks Apps using AppKit. Includes references for the AppKit SDK, SQL queries, tRPC, Lakebase, Model Serving, and testing.                                    |
| `databricks-jobs`      | Develop and deploy Lakeflow Jobs with notebooks, Python wheels, or SQL tasks.                                                                                                   |
| `databricks-lakebase`  | Manage Lakebase Postgres Autoscaling projects, branches, and endpoints.                                                                                                         |
| `databricks-pipelines` | Develop Lakeflow Spark Declarative Pipelines (formerly DLT). Large reference set covering streaming tables, materialized views, Auto Loader, Auto CDC, expectations, and sinks. |

## Other skill repositories

- [AI Dev Kit skills](https://github.com/databricks-solutions/ai-dev-kit/tree/main/databricks-skills) -- community patterns for SQL analytics, ML evaluation, model serving, streaming, and Unity Catalog
- [MLflow skills](https://github.com/mlflow/skills) -- tracing, LLM judges, evals, and production traffic analysis

## Further reading

- [Agent skills (Databricks docs)](https://docs.databricks.com/aws/en/agent-skills/)
- [AI-assisted development](/docs/appkit/v0/development/ai-assisted-development)
- [Local bootstrap recipe](/templates/databricks-local-bootstrap)
- [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server)
