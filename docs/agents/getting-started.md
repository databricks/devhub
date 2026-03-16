---
title: Getting Started
---

# Agents Getting Started

Build and deploy an AI agent on Databricks with a repeatable local-to-production workflow.

## Prerequisites

- Databricks Apps enabled in your workspace
- Databricks CLI configured with OAuth
- local Python and Node environments required by the template

## Recommended path

1. Start from an official conversational agent template.
2. Run locally and validate chat + tool-calling behavior.
3. Configure resource access and authentication mode.
4. Deploy to Databricks Apps.

Typical local-to-deploy commands:

```bash
databricks auth login --host <workspace-url>
# run your template's local dev command
# sync source to workspace
databricks sync . /Workspace/Users/<user>/<agent-project-path>
# deploy to app runtime
databricks apps deploy <app-name> --source-code-path /Workspace/Users/<user>/<agent-project-path>
```

## What to validate first

- agent can answer a basic prompt end-to-end
- required tools/resources are reachable with expected permissions
- request/response traces are visible for debugging

## Setup details to confirm early

- required secrets/environment variables are configured for local and deployed runtime
- tool/resource permissions are explicitly granted to runtime identity
- your first smoke prompt is documented and repeatable across environments

## Source of truth

- [Author an AI agent and deploy it on Databricks Apps](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
