---
title: Your First App
---

# Your First App

Build a minimal app and deploy it to Databricks Apps.

## Goal

By the end of this guide, you can run locally, deploy, and verify a working app endpoint.

## 1) Create an app in your workspace

In the workspace UI, create a Databricks App from a template (recommended) or create an empty app and define your own source layout.

Record:

- app name (for CLI deploy)
- workspace source path (for sync/deploy)
- app URL (for runtime validation)

## 2) Authenticate locally

Use OAuth login:

```bash
databricks auth login --host <workspace-url>
```

## 3) Sync local source to workspace

Use `databricks sync` to keep your local project and workspace source path aligned during development.

Example:

```bash
databricks sync . /Workspace/Users/<user>/<project-path>
```

For iterative development, run with your preferred watch options from `databricks sync --help`.

## 4) Deploy

Deploy from local source:

```bash
databricks apps deploy <app-name> --source-code-path <workspace-source-path>
```

## 5) Validate runtime

- open app URL from the workspace
- inspect deployment state in the app UI
- stream logs if needed and verify app startup command completed

Quick checks:

- homepage or health endpoint responds as expected
- app can access required Databricks resources
- no startup/authentication errors in logs

## Common first-deploy failures

- authentication profile points to the wrong workspace host
- `--source-code-path` does not match synced workspace path
- missing runtime dependencies or startup command mismatch
- app-level permissions do not allow expected runtime access

## Source of truth

- [Get started with Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Deploy a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
