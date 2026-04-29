## Sync Tables: Sync a Unity Catalog Table to Lakebase (Autoscaling)

Serve lakehouse data through Lakebase Autoscaling Postgres so your applications can query it with sub-10ms latency. This creates a synced table, a managed copy of your Unity Catalog table in Lakebase that stays up to date automatically.

> This template is for **Lakebase Autoscaling** (projects/branches/endpoints with scale-to-zero). For Lakebase Provisioned (manually scaled instances), see the Provisioned Sync Tables template (coming soon).

### When to use this

- Your app needs fast lookup-style queries against analytics data (user profiles, feature values, risk scores)
- You want to serve gold tables, ML outputs, or enriched records through a standard Postgres connection
- You need ACID transactions and sub-10ms reads alongside your operational state

### Choose a sync mode

| Mode           | Behavior                                       | Best for                                                                              |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Snapshot**   | One-time full copy                             | Source changes >10% of rows per cycle, or source doesn't support CDF (views, Iceberg) |
| **Triggered**  | Incremental updates on demand or on a schedule | Known cadence of changes, good cost/freshness balance                                 |
| **Continuous** | Real-time streaming (seconds of latency)       | Changes must appear in Lakebase near-instantly                                        |

> **Triggered** and **Continuous** modes require [Change Data Feed (CDF)](https://docs.databricks.com/aws/en/delta/delta-change-data-feed) enabled on the source table. If it's not enabled, run:
>
> ```sql
> ALTER TABLE <catalog>.<schema>.<table> SET TBLPROPERTIES (delta.enableChangeDataFeed = true);
> ```

### Sync throughput

Autoscaling CUs are physically 8x smaller than Provisioned CUs, so per-CU throughput differs:

| Mode                                     | Rows/sec per CU |
| ---------------------------------------- | --------------- |
| **Snapshot** (initial + full refresh)    | ~2,000          |
| **Triggered / Continuous** (incremental) | ~150            |

> A 10x speedup for large-table snapshot sync (writing Postgres pages directly, leveraging separation of storage and compute) is coming for Autoscaling only.

### 1. Create a synced table

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

> If your Lakebase database is **registered as a Unity Catalog catalog**, you can omit `database_instance_name` and `logical_database_name`.

Verify:

```bash
databricks database get-synced-database-table <CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME> --profile <PROFILE>
```

> **Important:** If your Autoscaling project was created via the `/postgres/` API (not `/database/`), programmatic synced table creation is not yet available via CLI. Use the Databricks UI as a fallback. In **Catalog**, select the source table → **Create synced table**, then choose your Lakebase project, branch, sync mode, and pipeline. This gap is expected to close soon.

### 2. Configure pipeline reuse

How you set up pipelines depends on your sync mode:

| Sync mode                | Recommendation                         | Why                                                                                                                  |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Continuous**           | **Reuse** a pipeline across ~10 tables | Cost-advantageous (e.g., 1 pipeline for 10 tables ≈ $204/table/month vs $2,044/table/month for individual pipelines) |
| **Snapshot / Triggered** | **Separate** pipelines per table       | Allows re-snapshotting individual tables without impacting others                                                    |

### 3. Schedule ongoing syncs

The initial snapshot runs automatically on creation. For **Snapshot** and **Triggered** modes, subsequent syncs need to be triggered.

> **Note:** Table-update triggers for sync pipelines are not yet available via CLI and must be configured through the Databricks UI: **Workflows** → create/open a job → add a **Database Table Sync pipeline** task → **Schedules & Triggers** → add a **Table update** trigger pointing to your source table.

Trigger a sync update programmatically via the Databricks SDK:

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

table = w.database.get_synced_database_table(
    name="<CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>"
)
pipeline_id = table.data_synchronization_status.pipeline_id

w.pipelines.start_update(pipeline_id=pipeline_id)
```

### 4. Query the synced data in Postgres

Once synced, the table is available in Lakebase Postgres. The Unity Catalog schema becomes the Postgres schema:

```sql
SELECT * FROM "<schema>"."<synced_table_name>" WHERE "user_id" = 12345;
```

Connect with any standard Postgres client (psql, DBeaver, your application's Postgres driver).

### What you end up with

- A **synced table** in Unity Catalog that tracks the sync pipeline
- A **read-only Postgres table** in Lakebase that your apps can query with sub-10ms latency
- A **managed Lakeflow pipeline** that keeps the data in sync based on your chosen mode
- Up to **16 connections** per sync to your Lakebase database

### Important constraints

- **Primary key is mandatory.** Synced tables always require a primary key. It enables efficient point lookups and incremental updates. Rows with nulls in PK columns are excluded from the sync.
- **Duplicate primary keys fail the sync** unless you configure a `timeseries_key` for deduplication (latest value wins per PK). Using a timeseries key has a performance penalty.
- **Schema changes**: For Triggered/Continuous mode, only **additive** changes (e.g., adding a column) propagate. Dropping or renaming columns requires recreating the synced table.
- **FGAC tables**: Direct sync of Fine-Grained Access Control tables fails. **Workaround**: create a view (`SELECT * FROM table`), then sync the view in Snapshot mode. Caveat: runs as the sync creator and only sees their visible rows.
- **Connection limits**: Autoscaling supports up to 4,000 concurrent connections (varies by compute size). Each sync uses up to 16 connections.
- **Read-only in Postgres**: Synced tables should only be read from Postgres. Writing to them interferes with the sync pipeline.

### Cost guidance

Cost formula: `[Rows / (Speed × CUs × 3600)] × DLT Hourly Rate`

Example costs (181M rows, 1 CU, $2.80/hr DLT rate):

| Mode                               | Monthly cost |
| ---------------------------------- | ------------ |
| Snapshot (daily)                   | ~$2,110      |
| Triggered (daily, 5% changes)      | ~$1,407      |
| Continuous (10 tables, 1 pipeline) | ~$204/table  |
| Continuous (1 table, 1 pipeline)   | ~$2,044      |

### Troubleshooting

| Issue                               | Fix                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| CDF not enabled warning             | Run `ALTER TABLE ... SET TBLPROPERTIES (delta.enableChangeDataFeed = true)` on the source |
| Schema not visible in create dialog | Confirm you have `USE_SCHEMA` and `CREATE_TABLE` on the target schema                     |
| Null bytes in string columns        | Clean source data: `SELECT REPLACE(col, CAST(CHAR(0) AS STRING), '') AS col FROM table`   |
| Sync failing                        | Check the pipeline in the synced table's Overview tab for error details                   |
| FGAC table sync fails               | Create a view over the table and sync the view in Snapshot mode                           |
| Duplicate primary key failure       | Add a `timeseries_key` to deduplicate (latest wins)                                       |

#### References

- [Synced tables (Autoscaling)](https://docs.databricks.com/aws/en/oltp/projects/sync-tables)
- [Change Data Feed](https://docs.databricks.com/aws/en/delta/delta-change-data-feed)
- [Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/)
