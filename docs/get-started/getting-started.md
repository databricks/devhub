---
title: Getting Started
---

# Getting Started

Use this guide to set up your local environment and ship your first Databricks developer workflow.

## Prerequisites

- a Databricks workspace with required product access (Apps, AI, or Lakebase as needed)
- workspace permissions to create/update the resources you plan to use
- Databricks CLI v0.295+
- local runtime dependencies for your project stack (for example Node or Python)

## Setup checklist

1. Install Databricks CLI.
2. Authenticate with OAuth:

   ```bash
   databricks auth login --host <workspace-url>
   ```

3. Confirm your login and profile:

   ```bash
   databricks auth profiles
   ```

4. Validate that workspace calls work in your current shell:

   ```bash
   databricks workspace list /
   ```

5. Choose your path: Apps, Agents, Lakebase, or tooling integrations.

## Workspace UI checks before you start

- confirm Apps is enabled if you plan to deploy web/agent applications
- confirm AI features are enabled if you plan to use Agents or AI Gateway
- confirm Lakebase access if you plan to run Postgres operational workloads
- confirm you can open the target workspace and create resources in the intended folder/project

## Pick a first workflow

- `get-started/your-first-app`: deploy an app to Databricks Apps.
- `agents/getting-started`: build and run an AI agent workflow.
- `lakebase/getting-started`: start with operational Postgres workloads.

## Environment profile suggestion

Use separate CLI profiles per environment (`dev`, `staging`, `prod`) to avoid accidental cross-environment deploys.

## Source of truth

- [Databricks CLI install](https://docs.databricks.com/en/dev-tools/cli/install)
- [Databricks CLI authentication](https://docs.databricks.com/en/dev-tools/cli/authentication.html)
