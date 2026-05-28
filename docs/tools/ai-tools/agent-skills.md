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

The CLI detects which coding agents you have installed and links the skills into each agent's config directory from a shared location (`~/.databricks/aitools/skills/`).

The following flags are available for the `databricks aitools install` command:

| Option            | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `--scope=global`  | Install globally (default)                                                   |
| `--scope=project` | Install to project directory                                                 |
| `--scope=both`    | Apply to both scopes (valid on `update`/`uninstall`)                         |
| `--agents`        | Target specific agents (comma-separated, e.g. `--agents cursor,claude-code`) |
| `--skills`        | Install specific skills only (comma-separated)                               |
| `--experimental`  | Include experimental skills                                                  |

Run `databricks aitools install --help` for the full list of options.

## Manage

```bash title="List, update, or remove skills"
databricks aitools list
databricks aitools update
databricks aitools uninstall
```

`update` fetches the latest release and auto-installs new skills. Pass `--check` to preview without downloading, `--no-new` to skip auto-installing new skills, or `--force` to re-download even if versions match.

All commands accept `--scope=global` (default), `--scope=project`, or `--scope=both` to control scope.

## Alternative install methods

You can also install Databricks skills with the [Skills CLI](https://github.com/vercel-labs/skills) (e.g. `npx skills add databricks/databricks-agent-skills`) or directly from Cursor chat with `/add-plugin databricks-skills`. That said, `databricks aitools install` is the recommended method — it's maintained by Databricks and always installs the latest stable versions.

## Available skills

Run `databricks aitools skills list` to see available skills and their install status.

| Skill                             | Description                                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databricks-apps`                 | Build apps on Databricks Apps using AppKit. Includes references for the AppKit SDK, SQL queries, tRPC, Lakebase, Model Serving, and testing.                                    |
| `databricks-core`                 | CLI operations, auth, profiles, data exploration, and bundles. Base skill for all Databricks development.                                                                       |
| `databricks-dabs`                 | Declare, deploy, and manage Databricks resources with Declarative Automation Bundles (DABs). Covers bundle structure, deploy/run commands, resource permissions, and pipelines. |
| `databricks-jobs`                 | Develop and deploy Lakeflow Jobs with notebooks, Python wheels, or SQL tasks.                                                                                                   |
| `databricks-lakebase`             | Manage Lakebase Postgres Autoscaling projects, branches, and endpoints.                                                                                                         |
| `databricks-model-serving`        | Create and manage Model Serving endpoints for real-time ML inference with auto-scaling and version management.                                                                  |
| `databricks-pipelines`            | Develop Lakeflow Spark Declarative Pipelines (formerly DLT). Large reference set covering streaming tables, materialized views, Auto Loader, Auto CDC, expectations, and sinks. |
| `databricks-serverless-migration` | Migrate Databricks workloads from classic compute to serverless. Covers compatibility checks, configuration, code patterns, networking, and streaming migration.                |

## Where to next

With Databricks agent skills installed, your coding agent has the context it needs to build and deploy.

- To give your agent further context, install the [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server).
- Ready to start building? Read about how [templates](/docs/templates) can help you quickly scaffold your project.
