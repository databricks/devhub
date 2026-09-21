---
title: Agent skills
sourceOfTruth:
  skills:
    - databricks-core
  docs:
    - https://github.com/databricks/databricks-agent-skills
---

# Agent skills

Agent skills are instruction files that AI coding assistants load to perform Databricks development tasks. Databricks publishes its skills in the [databricks/databricks-agent-skills](https://github.com/databricks/databricks-agent-skills) repository and follows the open [agent skills standard](https://agentskills.io/).

Skills tell your coding agent how Databricks works, including CLI conventions, authentication patterns, and resource names, so it generates correct code instead of guessing.

## Install

Install the official Databricks agent skills with the following command:

```bash title="Common"
databricks aitools install
```

```bash title="All Options"
databricks aitools install \
  --scope $SCOPE \
  --agents $AGENTS \
  --skills $SKILLS \
  --skills-only \
  --path $OUTPUT_DIR \
  --experimental \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

:::note
This requires the Databricks CLI to be installed. See [Databricks CLI](/docs/tools/databricks-cli) for installation instructions.
:::

The CLI detects which coding agents you have installed. For agents with plugin support (Claude Code, Codex CLI, GitHub Copilot), it installs the `databricks` plugin through the agent's own CLI. Agents without a headless plugin install (Cursor, OpenCode, Antigravity) get raw skill files linked from a shared location (`~/.databricks/aitools/skills/`).

Options for `databricks aitools install`:

<!-- cli-options:aitools install -->

| Option            | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `--agents`        | Agents to install for (comma-separated, e.g. claude-code,cursor)               |
| `--experimental`  | Include experimental skills                                                    |
| `--path`          | Write resolved skill files to this directory (no agents, no state)             |
| `--scope`         | Install scope: project or global (default: global, or prompt when interactive) |
| `--skills`        | Specific skills to install (comma-separated)                                   |
| `--skills-only`   | Force raw skill files for every agent instead of the plugin                    |
| `--debug`         | enable debug logging                                                           |
| `--output`, `-o`  | output type: text or json (default text)                                       |
| `--profile`, `-p` | ~/.databrickscfg profile                                                       |
| `--target`, `-t`  | bundle target to use (if applicable)                                           |

<!-- /cli-options -->

Note that `--skills-only` and `--path` cannot be combined.

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

<!-- aitools-skills -->

| Skill                                    | Description                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-agent-bricks`                | Create Agent Bricks: Knowledge Assistants (KA) for document Q&A and Supervisor Agents for multi-agent orchestration (MAS).                                                                                                                                                                                                                |
| `databricks-ai-functions`                | Use Databricks built-in AI Functions (ai_classify, ai_extract, ai_summarize, ai_mask, ai_translate, ai_fix_grammar, ai_gen, ai_analyze_sentiment, ai_similarity, ai_parse_document, ai_prep_search, ai_query, ai_forecast) to add AI capabilities directly to SQL and PySpark pipelines without managing model endpoints.                 |
| `databricks-aibi-dashboards`             | Create Databricks AI/BI dashboards.                                                                                                                                                                                                                                                                                                       |
| `databricks-app-design`                  | Design the UX of custom-code Databricks Apps (AppKit/React) data screens — KPI/overview pages, reports, charts, tables, and Genie/chat data assistants — mapped to concrete AppKit components.                                                                                                                                            |
| `databricks-apps`                        | Build apps on Databricks Apps platform.                                                                                                                                                                                                                                                                                                   |
| `databricks-apps-python`                 | Python backend for Databricks Apps — FastAPI (default), Flask, Dash, Streamlit, Gradio, Reflex. **Default for a new Databricks App is `databricks-apps` (AppKit — Node/TypeScript/React) — reach for it first.** Use this skill only when the user asks for a Python backend, extends an existing Python app, or the team is Python-only. |
| `databricks-core`                        | Databricks CLI operations and the parent/entry-point skill for Databricks CLI use: authentication, profile selection, and bundles.                                                                                                                                                                                                        |
| `databricks-dabs`                        | Create, configure, validate, deploy, run, and manage Declarative Automation Bundles (DABs, formerly Databricks Asset Bundles).                                                                                                                                                                                                            |
| `databricks-data-discovery`              | Discover, explore, and query Databricks data via Genie — the CLI equivalent of the Genie One MCP.                                                                                                                                                                                                                                         |
| `databricks-dbsql`                       | Databricks SQL (DBSQL) advanced features and SQL warehouse capabilities.                                                                                                                                                                                                                                                                  |
| `databricks-docs`                        | Databricks documentation reference via llms.txt index.                                                                                                                                                                                                                                                                                    |
| `databricks-execution-compute`           | Execute code and manage compute on Databricks: run Python/Scala/SQL/R via serverless, classic, or interactive clusters, and create/resize/delete clusters and SQL warehouses.                                                                                                                                                             |
| `databricks-iceberg`                     | Apache Iceberg tables on Databricks — Managed Iceberg tables, External Iceberg Reads (fka Uniform), Compatibility Mode, Iceberg REST Catalog (IRC), Iceberg v3, Snowflake interop, PyIceberg, OSS Spark, external engine access and credential vending.                                                                                   |
| `databricks-jobs`                        | Develop and deploy Lakeflow Jobs on Databricks via DABs, Python SDK, or the CLI.                                                                                                                                                                                                                                                          |
| `databricks-lakebase`                    | Databricks Lakebase Postgres: projects, scaling, connectivity, Lakebase synced tables, and Data API.                                                                                                                                                                                                                                      |
| `databricks-lakeflow-connect`            | Build managed ingestion pipelines into Databricks using Lakeflow Connect.                                                                                                                                                                                                                                                                 |
| `databricks-metric-views`                | Unity Catalog metric views: define, create, query, and manage governed business metrics in YAML.                                                                                                                                                                                                                                          |
| `databricks-ml-training`                 | Train ML models on Databricks.                                                                                                                                                                                                                                                                                                            |
| `databricks-mlflow-evaluation`           | MLflow 3 GenAI agent evaluation.                                                                                                                                                                                                                                                                                                          |
| `databricks-model-serving`               | Databricks Model Serving endpoint lifecycle and ops.                                                                                                                                                                                                                                                                                      |
| `databricks-pipelines`                   | Develop Lakeflow Spark Declarative Pipelines (formerly Delta Live Tables) on Databricks.                                                                                                                                                                                                                                                  |
| `databricks-python-sdk`                  | Databricks development guidance including Python SDK, Databricks Connect, CLI, and REST API.                                                                                                                                                                                                                                              |
| `databricks-serverless-migration`        | Migrate Databricks workloads from classic compute to serverless compute.                                                                                                                                                                                                                                                                  |
| `databricks-spark-structured-streaming`  | Comprehensive guide to Spark Structured Streaming for production workloads.                                                                                                                                                                                                                                                               |
| `databricks-synthetic-data-gen`          | Generate realistic synthetic data using Spark + Faker (strongly recommended).                                                                                                                                                                                                                                                             |
| `databricks-unity-catalog`               | Unity Catalog governance, access control, and observability.                                                                                                                                                                                                                                                                              |
| `databricks-unstructured-pdf-generation` | Build RAG / unstructured-document evaluation datasets and demo documents (e.g. for Knowledge Assistant) on Databricks: generate synthetic PDFs locally, upload to Unity Catalog volumes, and pair each document with test questions for retrieval evaluation.                                                                             |
| `databricks-vector-search`               | Databricks Vector Search endpoints and indexes for RAG and semantic search; covers index types, search modes, end-to-end RAG patterns                                                                                                                                                                                                     |
| `databricks-zerobus-ingest`              | Build Zerobus Ingest clients for near real-time data ingestion into Databricks Delta tables via gRPC.                                                                                                                                                                                                                                     |

<!-- /aitools-skills -->

The following skills are experimental. Install them by adding `--experimental` to `databricks aitools install`:

<!-- aitools-skills-experimental -->

| Skill                      | Description                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-ai-runtime`    | Databricks AI Runtime (`air`) CLI — the command-line tool for submitting and managing GPU training workloads on Databricks serverless compute. |
| `databricks-genie`         | Create and query Databricks Genie Spaces for natural language SQL exploration.                                                                 |
| `spark-python-data-source` | Build custom Python data sources for Apache Spark using the PySpark DataSource API — batch and streaming readers/writers for external systems. |

<!-- /aitools-skills-experimental -->

## Where to next

With Databricks agent skills installed, your coding agent has the context it needs to build and deploy.

- To give your agent further context, install the [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- Ready to start building? Read about how [templates](/docs/templates) can help you quickly scaffold your project.
