---
title: Agent Skills
---

# Agent Skills

Agent skills codify instructions, conventions, and workflows so coding agents produce consistent Databricks outcomes.

## When to use agent skills

- repeated platform setup tasks
- standardized coding and deployment patterns
- project-specific guardrails for AI-assisted changes

## Skill design guidelines

- keep one responsibility per skill
- include concrete commands and expected outcomes
- separate universal patterns from project-specific details
- version skill content alongside code changes

Databricks-focused skills should include:

- required workspace/auth prerequisites
- resource paths or endpoint naming conventions
- verification steps that confirm a deploy or runtime action succeeded

## Operational guidance

- validate generated actions against workspace policy and permissions
- keep source references current as platform behavior evolves
- remove stale or duplicated instructions to reduce agent ambiguity

## Databricks skill suite

The Databricks agent skills bundle includes:

- `databricks`: core CLI/auth/profile and data exploration guidance
- `databricks-apps`: Databricks Apps + AppKit development workflow
- `databricks-jobs`: Lakeflow Jobs with Declarative Automation Bundles
- `databricks-pipelines`: Lakeflow Spark Declarative Pipelines patterns
- `databricks-lakebase`: Lakebase Postgres project/branch/endpoint management

Install for Cursor and Claude Code:

```bash
npx skills add databricks/databricks-agent-skills -a cursor -a claude-code -y
```

Recommended usage:

- always apply `databricks` first for CLI readiness and profile selection
- then layer the product-specific skill (`apps`, `jobs`, `pipelines`, or `lakebase`)
- keep command syntax honest with `databricks <group> -h` and subcommand `--help`

## Related pages

- `tools/ai-tools/docs-mcp-server`
- `agents/development`
