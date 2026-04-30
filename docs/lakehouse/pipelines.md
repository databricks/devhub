---
title: Lakeflow pipelines and data freshness
sidebar_label: Pipelines and freshness
description: Show "is this data fresh?" timestamps in your AppKit app. Read per-table refresh metadata and the pipeline update timeline through the Analytics plugin.
---

# Lakeflow pipelines and data freshness

Lakeflow Spark Declarative Pipelines (SDP) populate the analytical tables your app reads. Authoring pipelines is a data engineering task you almost never touch as an AppKit dev. Your job is the read side: displaying pipeline output, and answering "is this fresh enough to show?" before you render it.

Two SQL signals answer it: per-table refresh metadata for materialized views and streaming tables, and the pipeline update timeline. Both go through the [Analytics plugin](/docs/appkit/v0/plugins/analytics) you set up in [Analytical reads](/docs/lakehouse/analytical-reads).

## What's under Lakeflow

Lakeflow groups these products:

- **Lakeflow Connect** for ingestion. Managed connectors for Salesforce, Workday, SQL Server, and others ingest data into Unity Catalog.
- **Lakeflow Spark Declarative Pipelines** for transformation. Authored in SQL or Python, runs on Databricks Runtime, produces materialized views and streaming tables.
- **Lakeflow Jobs** for orchestration. See [Lakeflow Jobs](/docs/lakehouse/jobs) for the app-trigger side.
- **Lakeflow Designer** for no-code visual pipeline building (Public Preview).

## Two freshness signals

- **Per-table refresh metadata**: `DESCRIBE TABLE EXTENDED <name> AS JSON` returns a `refresh_information` block for materialized views and streaming tables. The block has `last_refreshed_at`, `last_refresh_type`, `latest_refresh_status`, `latest_refresh_link`, and `refresh_schedule`. See [DESCRIBE TABLE](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-aux-describe-table) for the full output schema.
- **Pipeline update timeline (Public Preview)**: `system.lakeflow.pipeline_update_timeline` records every pipeline update with `pipeline_id`, `update_id`, `period_start_time`, `period_end_time`, `result_state` (one of `COMPLETED`, `FAILED`, `CANCELED`), and trigger details. Filter by `pipeline_id` and `result_state = 'COMPLETED'` to find the most recent successful update for the pipeline that owns a table. See the [system table reference](https://docs.databricks.com/aws/en/admin/system-tables/jobs#pipeline-update-timeline) for the full column list.

For deeper troubleshooting (per-flow status, expectation results, lineage events), use the [pipeline event log](https://docs.databricks.com/aws/en/ldp/monitor-event-logs) via the `event_log()` table-valued function. The event log is the right place for "why did this update fail" questions, not "is this data fresh enough to show".

## A "Last updated" badge query

Put this in `config/queries/`. It runs through the Analytics plugin like any other SQL file.

```sql title="config/queries/last_pipeline_update.obo.sql"
-- @param pipelineId STRING
SELECT period_end_time, result_state
FROM system.lakeflow.pipeline_update_timeline
WHERE pipeline_id = :pipelineId
  AND result_state = 'COMPLETED'
ORDER BY period_end_time DESC
LIMIT 1;
```

Call the hook from React with the pipeline ID:

```tsx
import { useMemo } from "react";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";

const params = useMemo(
  () => ({ pipelineId: sql.string("ec2a0ff4-d2a5-4c8c-bf1d-d9f12f10e749") }),
  [],
);
const { data } = useAnalyticsQuery("last_pipeline_update", params);
```

The `.obo.sql` filename runs the query as the signed-in user. If your app's service principal has `SELECT` on `system.lakeflow.pipeline_update_timeline`, drop the `.obo` and the query runs as the app. See [Author SQL files](/docs/lakehouse/analytical-reads#author-sql-files) for the full filename rule.

## Triggering a refresh from the app

There's no dedicated AppKit Pipelines plugin. Call the SDK directly from your handler with `w.pipelines.startUpdate({ pipelineId })`, or wrap the pipeline in a [Lakeflow Job](/docs/lakehouse/jobs) and use the Jobs plugin.

## Where to next

Try [Medallion Architecture from CDC History Tables](/templates/medallion-architecture-from-cdc) for the canonical SDP pipeline that produces these tables, or [Operational Data Analytics](/templates/operational-data-analytics) for the end-to-end UC + CDC + medallion pattern.
