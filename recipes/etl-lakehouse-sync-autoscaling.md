# ETL: Sync Lakebase Tables to Unity Catalog (Autoscaling — Lakehouse Sync)

Replicate your Lakebase Autoscaling Postgres tables into Unity Catalog as managed Delta tables. **Lakehouse Sync** captures every row-level change using CDC and writes them as **SCD Type 2 history** — giving you a full audit trail of how your operational data changed over time, queryable from the lakehouse.

> This recipe is for **Lakebase Autoscaling** (projects/branches/endpoints with scale-to-zero). For Lakebase Provisioned, see the [Provisioned ETL recipe](./etl-register-uc-provisioned.md).

## When to use this

- You want to analyze operational data (orders, user activity, support tickets) in the lakehouse
- You need a historical record of every insert, update, and delete from your Postgres tables
- You want to join operational data with analytics data in Spark, SQL, or BI tools
- You need to feed Lakebase data into downstream pipelines or ML models

## Prerequisites

- A Databricks workspace with Lakebase enabled (**AWS only** — Lakehouse Sync Beta is not yet available on Azure)
- A **Lakebase Autoscaling project** with at least one branch containing tables with data
- The Lakebase database must be **registered in Unity Catalog** ([register it](https://docs.databricks.com/aws/en/oltp/projects/register-uc))
- Tables you want to sync must have a **primary key** or `REPLICA IDENTITY FULL` set

> **Note:** Lakehouse Sync is currently in **Beta on AWS only** (all Autoscaling regions). Azure support is not yet available. It is a native Lakebase feature — no external compute, pipelines, or jobs required, and there is no incremental charge for replication beyond the underlying Lakebase compute and storage costs.

## How it works

Lakehouse Sync uses Change Data Capture (CDC) to stream changes from Lakebase Postgres into Unity Catalog. For each synced table, a Delta history table is created:

```
lb_<table_name>_history
```

Each row includes metadata columns:
- `_change_type` — `insert`, `update_preimage`, `update_postimage`, or `delete`
- `_lsn` — Log Sequence Number for ordering changes
- `_commit_timestamp` — When the change was captured

## Step 1 — Verify table replica identity

Lakehouse Sync requires the right replica identity for capturing changes. Connect to your Lakebase database and check:

```sql
SELECT n.nspname AS table_schema,
       c.relname AS table_name,
       CASE c.relreplident
         WHEN 'd' THEN 'default'
         WHEN 'n' THEN 'nothing'
         WHEN 'f' THEN 'full'
         WHEN 'i' THEN 'index'
       END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
ORDER BY n.nspname, c.relname;
```

If a table shows `default` or `nothing`, set it to `FULL`:

```sql
ALTER TABLE <table_name> REPLICA IDENTITY FULL;
```

## Step 2 — Check for unsupported data types

```sql
SELECT c.table_schema, c.table_name, c.column_name, c.udt_name AS data_type
FROM information_schema.columns c
JOIN pg_catalog.pg_type t ON t.typname = c.udt_name
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    SELECT tablename FROM pg_tables WHERE schemaname = c.table_schema
  )
  AND NOT (
    c.udt_name IN (
      'bool', 'int2', 'int4', 'int8', 'text', 'varchar', 'bpchar',
      'jsonb', 'numeric', 'date', 'timestamp', 'timestamptz',
      'real', 'float4', 'float8'
    )
    OR t.typcategory = 'E'
  )
ORDER BY c.table_schema, c.table_name, c.ordinal_position;
```

If unsupported types appear, restructure those columns before enabling sync.

## Step 3 — Enable Lakehouse Sync

> **Note:** Lakehouse Sync is configured through the Databricks UI. There is no CLI or REST API support for enabling it yet.

1. Navigate to **Catalog** in the workspace sidebar
2. Open your **Lakebase Autoscaling project** and select the **branch**
3. Click **Lakehouse Sync**
4. Click **Start Sync**
5. Select the **source Postgres database and schema**
6. Select the **destination Unity Catalog catalog and schema**
7. Choose which **tables** to sync
8. Click **Start**

## Step 4 — Monitor sync status

Check active syncs from Postgres:

```sql
SELECT * FROM wal2delta.tables;
```

In the Databricks UI, the **Lakehouse Sync** tab on your branch shows sync status, lag, and errors.

## Step 5 — Query the history tables

### Latest state of each row

```sql
SELECT *
FROM (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY id ORDER BY _lsn DESC) AS rn
  FROM <catalog>.<schema>.lb_<table_name>_history
  WHERE _change_type IN ('insert', 'update_postimage', 'delete')
)
WHERE rn = 1
  AND _change_type != 'delete';
```

### Full change history for a record

```sql
SELECT *
FROM <catalog>.<schema>.lb_<table_name>_history
WHERE id = 12345
ORDER BY _lsn;
```

## Handling schema changes

If you need to change a synced table's schema in Postgres, use the rename-and-swap pattern:

```sql
CREATE TABLE users_v2 (
  id INT PRIMARY KEY,
  name TEXT,
  new_column TEXT
);

ALTER TABLE users_v2 REPLICA IDENTITY FULL;

INSERT INTO users_v2 SELECT *, NULL FROM users;

BEGIN;
ALTER TABLE users RENAME TO users_backup;
ALTER TABLE users_v2 RENAME TO users;
COMMIT;
```

## What you end up with

- **Delta history tables** in Unity Catalog (`lb_<table_name>_history`) with full SCD Type 2 change tracking
- **Continuous replication** — changes stream from Postgres to Delta automatically
- **No external compute** — Lakehouse Sync is a native Lakebase feature
- Operational data queryable in Spark SQL, notebooks, BI tools, and downstream pipelines

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Table not appearing in sync | Ensure it has a primary key or `REPLICA IDENTITY FULL` |
| Unsupported data type error | Check column types with the query in Step 2 |
| Sync lag increasing | Check Lakebase endpoint health and compute scaling |
| Missing changes on update/delete | Verify `REPLICA IDENTITY FULL` — `default` only captures PK columns |

## Limitations

- **AWS only** — Lakehouse Sync Beta is available in all Autoscaling regions on AWS. Azure support is not yet available.
- **No incremental charge** — replication cost is included in your Lakebase compute and storage.
- **Works alongside synced tables** — you can use Lakehouse Sync in a project/schema that also has Reverse ETL synced tables.

## Learn more

- [Lakehouse Sync (Autoscaling)](https://docs.databricks.com/aws/en/oltp/projects/lakehouse-sync)
- [Register Lakebase in Unity Catalog](https://docs.databricks.com/aws/en/oltp/projects/register-uc)
- [SCD Type 2 in Databricks](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/scd)
