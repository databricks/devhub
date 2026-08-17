---
title: Agent skills
---

# Agent skills

Agent skills are instruction files that AI coding assistants load to perform Databricks development tasks. Databricks publishes its skills in the [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) repository and follows the open [agent skills standard](https://agentskills.io/).

Skills tell your coding agent how Databricks works, including CLI conventions, authentication patterns, and resource names, so it generates correct code instead of guessing.

## Install

Install the official Databricks agent skills with the following command:

```bash title="Common"
databricks aitools install
```

:::note
This requires the Databricks CLI to be installed. See [Databricks CLI](/docs/tools/databricks-cli) for installation instructions.
:::

The CLI detects which coding agents you have installed. For agents with plugin support (Claude Code, Codex CLI, GitHub Copilot), it installs the `databricks` plugin through the agent's own CLI. Agents without a headless plugin install (Cursor, OpenCode, Antigravity) get raw skill files linked from a shared location (`~/.databricks/aitools/skills/`).

The following flags are available for the `databricks aitools install` command:

| Option           | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| `--scope`        | Install scope: `project` or `global` (default: `global`, or prompt when interactive) |
| `--agents`       | Target specific agents (comma-separated, e.g. `--agents cursor,claude-code`)         |
| `--skills`       | Install specific skills only (comma-separated)                                       |
| `--skills-only`  | Force raw skill files for every agent instead of the plugin                          |
| `--path`         | Write resolved skill files to a directory (no agents, no state)                      |
| `--experimental` | Include experimental skills                                                          |

Run `databricks aitools install --help` for the full list of options.

## Manage

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` fetches the latest release and auto-installs new skills. Pass `--check` to preview without downloading, `--no-new` to skip auto-installing new skills, `--no-prune` to keep skills that were removed from the manifest, or `--force` to re-download even if versions match.

`uninstall` removes the plugin or skill files. Pass `--keep-marketplace` to keep the marketplace registration when removing a plugin.

All commands accept `--scope` to control scope: `install` and `uninstall` take `project` or `global`; `update` and `list` also accept `both` (`list` defaults to `both`).

## Alternative install methods

You can also install Databricks skills with the [Skills CLI](https://github.com/vercel-labs/skills) (e.g. `npx skills add databricks/databricks-agent-skills`) or directly from Cursor chat with `/add-plugin databricks`. That said, `databricks aitools install` is the recommended method — it's maintained by Databricks and always installs the latest stable versions.

## Available skills

Run `databricks aitools list` to see available skills and their install status.

| Skill                                    | Description                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `databricks-agent-bricks`                | Create Agent Bricks: Knowledge Assistants for document Q&A and Supervisor Agents for multi-agent orchestration.          |
| `databricks-ai-functions`                | Use Databricks built-in AI Functions (`ai_classify`, `ai_extract`, `ai_summarize`, `ai_query`, and more).                |
| `databricks-aibi-dashboards`             | Create Databricks AI/BI dashboards. Use when creating, updating, or deploying Lakeview dashboards.                       |
| `databricks-app-design`                  | Design the UX of custom-code Databricks Apps (AppKit/React) data screens mapped to concrete AppKit components.           |
| `databricks-apps`                        | Build apps on the Databricks Apps platform.                                                                              |
| `databricks-apps-python`                 | Python backend for Databricks Apps — FastAPI (default), Flask, Dash, Streamlit, Gradio, Reflex.                          |
| `databricks-core`                        | CLI operations and the parent/entry-point skill: authentication, profile selection, and bundles.                         |
| `databricks-dabs`                        | Create, configure, validate, deploy, run, and manage Declarative Automation Bundles (formerly Databricks Asset Bundles). |
| `databricks-data-discovery`              | Discover, explore, and query Databricks data via Genie — the CLI equivalent of the Genie One MCP.                        |
| `databricks-dbsql`                       | Databricks SQL (DBSQL) advanced features and SQL warehouse capabilities.                                                 |
| `databricks-docs`                        | Databricks documentation reference via `llms.txt` index.                                                                 |
| `databricks-execution-compute`           | Execute code and manage compute: run Python/Scala/SQL/R via serverless, classic, or interactive clusters.                |
| `databricks-genie-agents`                | Create, manage, and query Databricks Genie Agents (formerly Genie Spaces) for natural-language data exploration.         |
| `databricks-iceberg`                     | Apache Iceberg tables on Databricks — Managed Iceberg, External Iceberg Reads, IRC, Iceberg v3, and more.                |
| `databricks-jobs`                        | Develop and deploy Lakeflow Jobs via DABs, Python SDK, or the CLI.                                                       |
| `databricks-lakebase`                    | Databricks Lakebase Postgres: projects, scaling, connectivity, synced tables, and Data API.                              |
| `databricks-lakeflow-connect`            | Build managed ingestion pipelines into Databricks using Lakeflow Connect.                                                |
| `databricks-metric-views`                | Unity Catalog metric views: define, create, query, and manage governed business metrics in YAML.                         |
| `databricks-ml-training`                 | Train ML or custom-agent models with MLflow tracking and Unity Catalog registration.                                     |
| `databricks-mlflow-evaluation`           | MLflow 3 GenAI agent evaluation.                                                                                         |
| `databricks-model-serving`               | Databricks Model Serving endpoint lifecycle and ops.                                                                     |
| `databricks-pipelines`                   | Develop Lakeflow Spark Declarative Pipelines (formerly Delta Live Tables).                                               |
| `databricks-python-sdk`                  | Databricks development guidance including Python SDK, Databricks Connect, CLI, and REST API.                             |
| `databricks-serverless-migration`        | Migrate Databricks workloads from classic compute to serverless compute.                                                 |
| `databricks-spark-structured-streaming`  | Comprehensive guide to Spark Structured Streaming for production workloads.                                              |
| `databricks-synthetic-data-gen`          | Generate realistic synthetic data using Spark + Faker, with serverless execution and multiple output formats.            |
| `databricks-unity-catalog`               | Unity Catalog governance, access control, and observability — grants, privilege model, RLS, and column masks.            |
| `databricks-unstructured-pdf-generation` | Build RAG / unstructured-document evaluation datasets and demo documents on Databricks.                                  |
| `databricks-vector-search`               | Databricks Vector Search endpoints and indexes for RAG and semantic search.                                              |
| `databricks-zerobus-ingest`              | Build Zerobus Ingest clients for near real-time data ingestion into Databricks Delta tables via gRPC.                    |

The following skills are experimental. They install only when you pass `--experimental`, and `databricks aitools list` shows them under "Experimental skills":

| Skill                      | Description                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | Databricks AI Runtime (`air`) CLI for submitting and managing GPU training workloads on serverless compute. |
| `spark-python-data-source` | Build custom Python data sources for Apache Spark using the PySpark DataSource API.                         |

## Where to next

With Databricks agent skills installed, your coding agent has the context it needs to build and deploy.

- To give your agent further context, install the [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- Ready to start building? Read about how [templates](/docs/templates) can help you quickly scaffold your project.
