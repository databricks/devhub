# Reverse ETL: Sync a Unity Catalog Table to Lakebase (Provisioned)

Serve lakehouse data through Lakebase Provisioned Postgres so your applications can query it with low latency. This creates a **synced table** — a managed copy of your Unity Catalog table in Lakebase that stays up to date automatically.

> This recipe is for **Lakebase Provisioned** (manually scaled instances with fixed CU capacity). For Lakebase Autoscaling (projects with scale-to-zero), see the [Autoscaling Reverse ETL recipe](./reverse-etl-synced-tables-autoscaling.md).
>
> **Note:** New Lakebase instances are created as Autoscaling projects by default as of March 12, 2026. See [Autoscaling by default](https://docs.databricks.com/aws/en/oltp/upgrade-to-autoscaling) for migration details.

## When to use this

- Your app needs fast lookup-style queries against analytics data
- You want to serve gold tables, ML outputs, or enriched records through a standard Postgres connection
- You're on Lakebase Provisioned and want full CLI/API automation for synced table creation

## Prerequisites

- A Databricks workspace with Lakebase enabled
- A **Lakebase Provisioned instance** ([create one](https://docs.databricks.com/aws/en/oltp/instances/instance) or use `databricks database create-database-instance`)
- `CAN USE` permissions on the database instance
- A **Unity Catalog table** to sync (Delta, Iceberg, view, or materialized view)
- Databricks CLI >= v0.205 (for CLI path)

## Choose a sync mode

| Mode | Behavior | Best for | Throughput (per CU) |
|------|----------|----------|---------------------|
| **Snapshot** | Full copy each run | Source changes >10% of rows, or no CDF support (views, Iceberg) | ~15,000 rows/sec |
| **Triggered** | Incremental updates on demand or on a schedule | Known cadence, good cost/freshness balance | ~1,200 rows/sec |
| **Continuous** | Real-time streaming (min 15-second intervals) | Near real-time freshness required | ~1,200 rows/sec |

> Provisioned CUs are physically 8x larger than Autoscaling CUs, so per-CU throughput is higher.

> **Triggered** and **Continuous** modes require [Change Data Feed (CDF)](https://docs.databricks.com/aws/en/delta/delta-change-data-feed) enabled:
>
> ```sql
> ALTER TABLE <catalog>.<schema>.<table> SET TBLPROPERTIES (delta.enableChangeDataFeed = true);
> ```

## Option A: Create via CLI

```bash
databricks database create-synced-database-table \
  --json '{
    "name": "<CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>",
    "database_instance_name": "<INSTANCE_NAME>",
    "logical_database_name": "<POSTGRES_DATABASE>",
    "spec": {
      "source_table_full_name": "<CATALOG>.<SCHEMA>.<SOURCE_TABLE>",
      "primary_key_columns": ["<PRIMARY_KEY_COLUMN>"],
      "scheduling_policy": "<SNAPSHOT|TRIGGERED|CONTINUOUS>",
      "create_database_objects_if_missing": true
    }
  }' --profile <PROFILE>
```

> If your Lakebase database is already **registered as a Unity Catalog catalog**, you can omit `database_instance_name` and `logical_database_name` — they're inferred from the registered catalog. If you do specify them, they must match the registered catalog's values.

Verify:

```bash
databricks database get-synced-database-table <CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME> --profile <PROFILE>
```

The response includes `unity_catalog_provisioning_state` (`PROVISIONING` → `ACTIVE`) and `data_synchronization_status` with pipeline progress.

## Option B: Create via REST API

```
POST /api/2.0/database/synced_tables
```

```json
{
  "name": "<CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>",
  "database_instance_name": "<INSTANCE_NAME>",
  "logical_database_name": "<POSTGRES_DATABASE>",
  "spec": {
    "source_table_full_name": "<CATALOG>.<SCHEMA>.<SOURCE_TABLE>",
    "primary_key_columns": ["<PRIMARY_KEY_COLUMN>"],
    "scheduling_policy": "CONTINUOUS",
    "create_database_objects_if_missing": true,
    "timeseries_key": "<OPTIONAL_TIMESTAMP_COLUMN>",
    "new_pipeline_spec": {
      "budget_policy_id": "<OPTIONAL_BUDGET_POLICY>",
      "storage_catalog": "<OPTIONAL_STORAGE_CATALOG>",
      "storage_schema": "<OPTIONAL_STORAGE_SCHEMA>"
    }
  }
}
```

### Spec fields reference

| Field | Required | Description |
|-------|----------|-------------|
| `source_table_full_name` | Yes | Full 3-part name of the source UC table |
| `primary_key_columns` | Yes | Column(s) that uniquely identify each row |
| `scheduling_policy` | Yes | `SNAPSHOT`, `TRIGGERED`, or `CONTINUOUS` |
| `create_database_objects_if_missing` | No | Auto-create Postgres schema/database objects if they don't exist |
| `timeseries_key` | No | Timestamp column for deduplication when rows share a primary key |
| `existing_pipeline_id` | No | Reuse an existing Lakeflow pipeline instead of creating a new one |
| `new_pipeline_spec.budget_policy_id` | No | Budget policy for the managed sync pipeline |
| `new_pipeline_spec.storage_catalog` | No | Catalog for pipeline staging storage |
| `new_pipeline_spec.storage_schema` | No | Schema for pipeline staging storage |

## Option C: Create via UI

1. Go to **Catalog** → select the source Unity Catalog table
2. Click **Create synced table**
3. Select your **instance**, **Postgres database**, **primary key**, and **sync mode**
4. Choose new or existing pipeline, optionally set a budget policy
5. Click **Create**

## Schedule ongoing syncs

The initial snapshot runs automatically. For **Snapshot** and **Triggered** modes, subsequent syncs need to be triggered.

### Trigger on source table updates (Workflows)

1. Go to **Workflows** → create or open a job
2. Add a **Database Table Sync pipeline** task
3. Under **Schedules & Triggers**, add a **Table update** trigger pointing to your source table

### Trigger via SDK

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

table = w.database.get_synced_database_table(
    name="<CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>"
)
pipeline_id = table.data_synchronization_status.pipeline_id

w.pipelines.start_update(pipeline_id=pipeline_id)
```

## Query the synced data in Postgres

```sql
SELECT * FROM "<schema>"."<synced_table_name>" WHERE "user_id" = 12345;
```

Query via the Lakebase SQL editor, psql, DBeaver, notebooks, or your application's Postgres driver.

## Delete a synced table

Deletion is a two-step process:

```bash
# 1. Delete from Unity Catalog (stops sync pipeline)
databricks database delete-synced-database-table <CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME> --profile <PROFILE>
```

```sql
-- 2. Drop from Postgres (frees storage)
DROP TABLE "<database>"."<schema>"."<synced_table_name>";
```

## Pipeline reuse guidance

| Sync mode | Recommendation | Why |
|-----------|---------------|-----|
| **Continuous** | **Reuse** a pipeline across ~10 tables | Cost-advantageous for always-on workloads |
| **Snapshot / Triggered** | **Separate** pipelines per table | Allows re-snapshotting individual tables without impacting others |

## What you end up with

- A **synced table** in Unity Catalog that tracks the sync pipeline
- A **read-only Postgres table** in Lakebase queryable by your apps
- A **managed Lakeflow pipeline** that keeps the data in sync
- Up to **16 connections** per sync to the database instance

## Important constraints

- **Primary key is mandatory.** Enables efficient point lookups and incremental row-level updates. Rows with nulls in PK columns are excluded.
- **Duplicate primary keys fail the sync** unless you set a `timeseries_key` for deduplication (performance penalty).
- **Schema changes**: Triggered/Continuous mode supports only **additive** changes (e.g., new columns). Dropping/renaming columns requires recreating the synced table.
- **FGAC tables**: Direct sync fails. **Workaround**: create a view (`SELECT * FROM table`), sync in Snapshot mode. Runs as sync creator, only sees their visible rows.
- **Connection limits**: Provisioned supports up to 1,000 concurrent connections. Each sync uses up to 16 connections.
- **Size limits**: 2 TB total logical data across all tables. During full refresh, old + new versions both count toward the limit; keep under 1 TB if you need refreshes.
- **Read-only in Postgres**: Writing to synced tables interferes with the sync pipeline.
- **Naming**: Postgres database, schema, and table names may only contain `[A-Za-z0-9_]`. No hyphens.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CDF not enabled warning | Run `ALTER TABLE ... SET TBLPROPERTIES (delta.enableChangeDataFeed = true)` on source |
| Duplicate primary key failure | Add a `timeseries_key` to deduplicate (latest wins) |
| Null bytes in strings | Clean source: `SELECT REPLACE(col, CAST(CHAR(0) AS STRING), '') AS col FROM table` |
| Instance size exceeded | Uncompressed data exceeds 2 TB limit; drop tables to free space |
| Schema not visible | Confirm `USE_SCHEMA` + `CREATE_TABLE` permissions |
| FGAC table sync fails | Create a view over the table and sync the view in Snapshot mode |

## Learn more

- [Synced tables (Provisioned)](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table)
- [Database Instances API](https://docs.databricks.com/api/workspace/database/createsynceddatabasetable)
- [Change Data Feed](https://docs.databricks.com/aws/en/delta/delta-change-data-feed)
- [Upgrade to Autoscaling](https://docs.databricks.com/aws/en/oltp/upgrade-to-autoscaling)
