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

`update` fetches the latest release and auto-installs new skills from the manifest. Pass `--check` to preview without downloading, `--no-new` to skip auto-installing new skills, or `--force` to re-download even if versions match. All commands accept `--global` (default) and `--project` to control scope.

## Other install methods

The [Skills CLI](https://github.com/vercel-labs/skills) provides an alternative with interactive prompts:

```bash
npx skills add databricks/databricks-agent-skills
```

Cursor also supports `/add-plugin databricks-skills` in chat.

## Available skills

Run `databricks experimental aitools skills list` to see available skills and their install status.

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

With Databricks agent skills installed, your coding agent has the context it needs to build and deploy. Browse the [templates catalog](/templates) to start building.
