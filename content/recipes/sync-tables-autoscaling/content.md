## Sync a Unity Catalog Table to Lakebase

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

> Your Lakebase database must be registered as a UC catalog first (one-time setup per project). If not already done:
>
> ```bash
> databricks postgres create-catalog <CATALOG_NAME> \
>   --json '{
>     "spec": {
>       "postgres_database": "<POSTGRES_DATABASE>",
>       "branch": "projects/<PROJECT_ID>/branches/<BRANCH_ID>"
>     }
>   }' --profile <PROFILE>
> ```

```bash
databricks postgres create-synced-table <LAKEBASE_CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME> \
  --json '{
    "spec": {
      "source_table_full_name": "<CATALOG>.<SCHEMA>.<SOURCE_TABLE>",
      "primary_key_columns": ["<PRIMARY_KEY_COLUMN>"],
      "scheduling_policy": "<SNAPSHOT|TRIGGERED|CONTINUOUS>",
      "branch": "projects/<PROJECT_ID>/branches/<BRANCH_ID>",
      "postgres_database": "databricks_postgres",
      "create_database_objects_if_missing": true,
      "new_pipeline_spec": {
        "storage_catalog": "<REGULAR_UC_CATALOG>",
        "storage_schema": "default"
      }
    }
  }' --profile <PROFILE>
```

`new_pipeline_spec.storage_catalog` must be a **regular** UC catalog for DLT pipeline metadata, not the Lakebase catalog. Long-running operation; the CLI waits by default. Use `--no-wait` to return immediately.

> **DABs:** Do not use `synced_database_tables` in DABs with Autoscaling projects — it maps to the Provisioned Terraform resource and may create unintended Provisioned instances. DAB support for Autoscaling synced tables is not yet available. Use the CLI commands above.

Verify:

```bash
databricks postgres get-synced-table \
  "synced_tables/<LAKEBASE_CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>" \
  --profile <PROFILE>
```

### 2. Configure pipeline reuse

How you set up pipelines depends on your sync mode:

| Sync mode                | Recommendation                         | Why                                                                                                                  |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Continuous**           | **Reuse** a pipeline across ~10 tables | Cost-advantageous (e.g., 1 pipeline for 10 tables ≈ $204/table/month vs $2,044/table/month for individual pipelines) |
| **Snapshot / Triggered** | **Separate** pipelines per table       | Allows re-snapshotting individual tables without impacting others                                                    |

### 3. Schedule ongoing syncs

The initial snapshot runs automatically on creation. For **Snapshot** and **Triggered** modes, subsequent syncs need to be triggered.

> **Note:** Table-update triggers for sync pipelines are not yet available via CLI and must be configured through the Databricks UI: **Workflows** → create/open a job → add a **Database Table Sync pipeline** task → **Schedules & Triggers** → add a **Table update** trigger pointing to your source table.

Trigger a sync update programmatically via the Databricks CLI. Look up the pipeline ID for the synced table, then start an update:

```bash
PIPELINE_ID=$(databricks postgres get-synced-table \
  "synced_tables/<LAKEBASE_CATALOG>.<SCHEMA>.<SYNCED_TABLE_NAME>" \
  --output json --profile <PROFILE> \
  | jq -r '.data_synchronization_status.pipeline_id')

databricks pipelines start-update "$PIPELINE_ID" --profile <PROFILE>
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
- [DevHub: Data Lakehouse overview](/docs/lakehouse/overview)
