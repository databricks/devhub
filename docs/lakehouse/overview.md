---
title: What is the Data Lakehouse?
sidebar_label: Overview
description: The data tier of the Databricks Data Intelligence Platform. Governed analytical tables in Unity Catalog, populated by Lakeflow. Companion docs for AppKit apps.
---

# What is the Data Lakehouse?

The Data Lakehouse is the analytical tier of your Databricks workspace: tables and views governed by Unity Catalog and populated by Lakeflow. Lakeflow is Databricks' suite of data engineering services covering ingestion, orchestration, and pipeline management. From an AppKit app, you read its tables, trigger Lakeflow Jobs, and show "last updated" timestamps from the pipelines that populated them.

The [Analytics plugin](/docs/appkit/v0/plugins/analytics) handles SQL warehouse reads (see [Analytical reads](/docs/lakehouse/analytical-reads) and [Pipelines and freshness](/docs/lakehouse/pipelines)). The [Jobs plugin](/docs/appkit/v0/plugins/jobs) handles run triggering and progress (see [Lakeflow Jobs](/docs/lakehouse/jobs)).

## When to use the Data Lakehouse

- You need to read curated analytical data: revenue, customers, events, model outputs.
- You display dashboard-style aggregates or list views over millions of rows.
- You trigger model retraining, ETL, or a long backfill asynchronously from a user action.

## When not to use it

- **Sub-second reads on a user request**, like typeahead or autocomplete. Use [Lakebase Postgres](/docs/lakebase/overview) directly, or replicate a UC table to Lakebase as a synced table.
- **Transactional writes from your app** (orders, sessions, audit logs). Use [Lakebase Postgres](/docs/lakebase/overview).
- **Natural-language Q&A over governed tables**. Use [Genie](/docs/agents/genie).

You also don't author pipelines, configure Spark, or size clusters. Those are data engineering tasks that happen in the Databricks workspace or through [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/).

## Pick a template to start from

Each one combines the wiring on the pages above into a working pattern.

| You want to...                                             | Template                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| Replicate a UC table into Lakebase for sub-10ms reads      | [Sync Tables (Autoscaling)](/templates/sync-tables-autoscaling)     |
| Stand up the full UC + Lakehouse Sync + medallion pipeline | [Operational Data Analytics](/templates/operational-data-analytics) |

## Where to next

- [Analytical reads](/docs/lakehouse/analytical-reads) with the Analytics plugin, SQL files, and on-behalf-of-user queries.
- [Lakeflow Jobs](/docs/lakehouse/jobs) for the Jobs plugin, `runNow`, and SSE progress.
- [Pipelines and freshness](/docs/lakehouse/pipelines) for freshness signals via the Analytics plugin.
