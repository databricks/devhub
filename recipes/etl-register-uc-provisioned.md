# ETL: Access Lakebase Data from Unity Catalog (Provisioned — Database Catalog)

Register your Lakebase Provisioned database as a **read-only Unity Catalog catalog** so you can query operational data from the lakehouse, join it with analytics tables, and feed it into dashboards, pipelines, and ML models — all through standard SQL.

> This recipe is for **Lakebase Provisioned** (manually scaled instances). For Lakebase Autoscaling (projects with scale-to-zero and native CDC replication), see the [Autoscaling ETL recipe](./etl-lakehouse-sync-autoscaling.md).
>
> **Note:** New Lakebase instances are created as Autoscaling projects by default as of March 12, 2026. If you're starting fresh, consider using Autoscaling with Lakehouse Sync for full CDC-based replication.

## When to use this

- You want to query Lakebase operational data from Spark SQL, notebooks, or BI tools
- You need to join Lakebase tables with lakehouse data (federated queries)
- You want Unity Catalog governance (permissions, lineage, audit logs) on your Lakebase data
- You want to browse Lakebase schemas and tables in Catalog Explorer

## How it differs from Autoscaling Lakehouse Sync

| | Provisioned (this recipe) | Autoscaling (Lakehouse Sync) |
|---|---|---|
| **Mechanism** | Registers Postgres as a read-only UC catalog; queries go to Postgres via federation | Native CDC replication into Delta tables (SCD Type 2 history) |
| **Data location** | Data stays in Postgres; queries are federated | Data is copied into Delta tables in Unity Catalog |
| **History tracking** | No change history — queries reflect current Postgres state | Full SCD Type 2 change history |
| **Compute** | Requires a serverless SQL warehouse for queries | No external compute — native Lakebase feature |
| **Latency** | Real-time (reads from live Postgres) | Near real-time (CDC streaming lag) |

> **Note on Lakeflow Connect Plugin:** Provisioned previously had a Lakeflow Connect Plugin for Lakebase (Private Preview) that provided CDC-based replication similar to Lakehouse Sync. This plugin will **not** be taken to Public Preview or GA. If you need CDC replication from Lakebase to Unity Catalog, migrate to Autoscaling and use native Lakehouse Sync.

## Prerequisites

- A Databricks workspace with Lakebase enabled
- A **Lakebase Provisioned instance** with at least one database
- `CREATE CATALOG` privileges on the Unity Catalog metastore
- A **serverless SQL warehouse** (required to query the registered catalog)

## Step 1 — Register the database in Unity Catalog

### Via CLI

```bash
databricks database create-database-catalog <CATALOG_NAME> <INSTANCE_NAME> <DATABASE_NAME> --profile <PROFILE>
```

| Placeholder | Value |
|-------------|-------|
| `<CATALOG_NAME>` | Name for the new Unity Catalog catalog |
| `<INSTANCE_NAME>` | Your Lakebase Provisioned instance name |
| `<DATABASE_NAME>` | Postgres database to register (e.g., `databricks_postgres`) |

If the database doesn't exist yet, add `--create-database-if-not-exists`.

### Via UI

1. Click **Apps** in the top right → select **Lakebase Postgres**
2. Click **Provisioned** → select your instance
3. Go to **Catalogs** → click **Add catalog**
4. Enter a **Catalog name** and select the **Postgres database** (or enter a new name to create one)
5. Click **Create**

### Via REST API

```
POST /api/2.0/database/catalogs
```

```json
{
  "name": "<CATALOG_NAME>",
  "database_instance_name": "<INSTANCE_NAME>",
  "database_name": "<DATABASE_NAME>"
}
```

## Step 2 — Verify registration

```bash
databricks database get-database-catalog <CATALOG_NAME> --profile <PROFILE>
```

Then browse to **Catalog** in the workspace sidebar — your Lakebase catalog should appear alongside other UC catalogs.

## Step 3 — Query your Lakebase data

Make sure you have a serverless SQL warehouse running as your compute resource. Then query directly:

```sql
-- Query a Lakebase table through Unity Catalog
SELECT * FROM <catalog_name>.<schema>.<table>
WHERE created_at > current_date - INTERVAL 7 DAYS;
```

```sql
-- Join Lakebase operational data with lakehouse analytics
SELECT
  o.order_id,
  o.status,
  o.total_amount,
  c.lifetime_value,
  c.segment
FROM <catalog_name>.public.orders o
JOIN analytics.gold.customers c
  ON o.customer_id = c.customer_id
WHERE o.created_at > current_date - INTERVAL 30 DAYS;
```

## Step 4 — Manage access

Grant read access to teams:

```sql
GRANT USE CATALOG ON CATALOG <catalog_name> TO `<group_name>`;
GRANT SELECT ON CATALOG <catalog_name> TO `<group_name>`;
```

## Delete the catalog

```bash
databricks database delete-database-catalog <CATALOG_NAME> --profile <PROFILE>
```

> Delete all synced tables from the catalog first. Each source table supports max 20 synced tables, and pending deletions count toward this limit (cleanup can take up to 3 days).

## What you end up with

- A **read-only Unity Catalog catalog** mirroring your Lakebase database structure
- **Federated queries** — query Lakebase data from Spark SQL alongside lakehouse tables
- **Unity Catalog governance** — permissions, lineage, and audit on Lakebase data
- **Catalog Explorer** — browse Lakebase schemas, tables, and views alongside other data sources

## Limitations

- The catalog is **read-only** — modify data through Lakebase directly
- One catalog per Postgres database — register each database separately
- Metadata is cached — click refresh in Catalog Explorer to see new objects
- Database instances are **single-workspace scoped** — no cross-workspace access to table contents
- Database names can only contain alphanumeric characters and underscores (no hyphens)
- **No CDC replication** — unlike Autoscaling's Lakehouse Sync, this approach does not replicate data or track change history; queries are federated to live Postgres
- **Lakeflow Connect Plugin (deprecated path)** — the Private Preview plugin for Provisioned CDC will not go to GA; migrate to Autoscaling for CDC-based ETL

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Catalog not appearing | Ensure you have `CREATE CATALOG` metastore privileges |
| Tables not visible | Attach a serverless SQL warehouse and refresh the catalog view |
| Query errors | Confirm the SQL warehouse is running and can reach the instance |
| Permission denied | Grant `USE CATALOG` + `SELECT` to the querying user/group |

## Learn more

- [Register your database in Unity Catalog (Provisioned)](https://docs.databricks.com/aws/en/oltp/instances/register-uc)
- [Database Instances CLI](https://docs.databricks.com/aws/en/dev-tools/cli/reference/database-commands)
- [Upgrade to Autoscaling](https://docs.databricks.com/aws/en/oltp/upgrade-to-autoscaling)
