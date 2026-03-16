---
title: Getting Started
---

# Apps Getting Started

Use Databricks Apps to host and operate web applications inside your Databricks workspace.

## Prerequisites

- workspace configured for Databricks Apps
- Databricks CLI installed and authenticated
- local project with app source files

## First deployment workflow

1. Create an app from a template or custom source in the workspace UI.
2. Authenticate locally:

   ```bash
   databricks auth login --host <workspace-url>
   ```

3. Sync local source to the workspace path:

   ```bash
   databricks sync . /Workspace/Users/<user>/<project-path>
   ```

4. Deploy with CLI:

   ```bash
   databricks apps deploy <app-name> --source-code-path /Workspace/Users/<user>/<project-path>
   ```

5. Open the app URL and verify runtime health.

## Local development

Use your framework's local server for iteration, then redeploy using the same workspace source path.

## Verify deployment success

- app status in workspace shows a successful deployment
- app URL returns expected page/endpoint
- logs show clean startup without auth or dependency errors

## Common issues

- wrong app name or source path in deploy command
- local changes not synced to workspace before deploy
- missing runtime command/environment configuration in `app.yaml`

## Source of truth

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Configure your Databricks Apps environment](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/configure-env)
