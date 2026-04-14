---
title: Quickstart
---

# Quickstart

[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) is Databricks managed PostgreSQL for OLTP workloads that need low-latency, transactional access alongside your Lakehouse data. It supports instant branching for isolated database environments that share storage via copy-on-write, and runs co-located with your Databricks workspace.

DevHub is organized around [guides and examples](/resources). These companion docs explain Lakebase when you or your agent need platform detail beyond a guide. For how the site fits together, see [Start here](/docs/start-here).

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate)
- `psql` (PostgreSQL client) if using `databricks psql`. Alternatively, use `generate-database-credential` with any PostgreSQL client.
- Workspace with Lakebase access enabled

## Build an app with Lakebase

The fastest path is to copy a [resource guide](/resources) into your coding agent and describe what you want to build. [Start here](/docs/start-here) for the full workflow.

| Guide                                                               | Best for                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| [App with Lakebase](/resources/app-with-lakebase)                   | CRUD apps with persistent storage                     |
| [AI Chat App](/resources/ai-chat-app)                               | Conversational AI with chat history                   |
| [Operational Data Analytics](/resources/operational-data-analytics) | Bidirectional sync between Lakebase and Unity Catalog |

Each guide includes the [Create a Lakebase Instance](/resources/lakebase-create-instance) resource, which walks through project creation and connection value collection.

To scaffold manually with the CLI, run `databricks apps init` and select the **Lakebase** plugin when prompted. See [Apps Plugins](/docs/apps/plugins) for details.

## Customize your app

After deploying a Lakebase-backed app, consider the following customizations:

- **Add tables**: Follow the [Lakebase Data Persistence](/resources/lakebase-data-persistence) guide to define schemas, generate types, and create CRUD routes.
- **Add chat persistence**: Use the [Lakebase Chat Persistence](/resources/lakebase-chat-persistence) guide to store conversations.
- **Use feature branches**: Create isolated branches for development and testing. See [Development: Feature branches](/docs/lakebase/development#feature-branches).
- **Sync data to/from Unity Catalog**: Use [Lakehouse Sync (CDC)](/resources/lakebase-change-data-feed-autoscaling) to replicate Lakebase tables into Delta, or [Sync Tables](/resources/sync-tables-autoscaling) to serve Unity Catalog data through Lakebase.
- **Deploy outside Databricks**: Use the [Lakebase Off-Platform](/resources/lakebase-off-platform) guide for apps hosted on AWS, Vercel, Netlify, and others.

To wire Lakebase into an app, see [App integration and development](/docs/lakebase/development).

To provision manually without a guide, see [Manual provisioning](/docs/lakebase/development#manual-provisioning).

## Next steps

See [App integration and development](/docs/lakebase/development) for integrating Lakebase into your app, local development, infrastructure-as-code with Bundles, and troubleshooting.

## Further reading

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Get started with Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/get-started)
- [CLI reference for Lakebase](https://docs.databricks.com/aws/en/oltp/projects/cli)
- [`postgres` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/postgres-commands)
- [`psql` command reference](https://docs.databricks.com/aws/en/dev-tools/cli/reference/psql-command)
