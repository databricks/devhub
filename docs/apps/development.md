---
title: Development
---

# Apps Development

Build Databricks Apps with a local-first workflow and a deterministic deployment pipeline.

## Recommended workflow

1. Develop and test locally.
2. Sync source to a stable workspace path.
3. Deploy and validate in target workspace.
4. Promote through environments using the same deployment process.

Example deploy sequence from a clean checkout:

```bash
databricks auth login --host <workspace-url>
databricks sync . /Workspace/Users/<user>/<project-path>
databricks apps deploy <app-name> --source-code-path /Workspace/Users/<user>/<project-path>
```

## Runtime configuration

Keep startup command and environment values in `app.yaml` at the project root when defaults are not sufficient.

## Operational checks before merge

- deploy succeeds from clean checkout
- app starts with expected command/runtime
- key endpoints and permission flows work in workspace
- logs surface expected startup and error events

## CI/CD note

For automated pipelines, use a non-interactive auth method supported by official Databricks CLI authentication docs, then run the same sync/deploy/verify flow used locally.

## Source of truth

- [Configure Databricks app execution with app.yaml](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
- [Deploy a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
