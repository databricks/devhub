## Medallion Architecture from CDC History Tables

Transform CDC history tables produced by Lakehouse Sync into a medallion architecture with bronze, silver, and gold layers using Lakeflow Declarative Pipelines. This turns raw change-data-capture records into clean, business-ready analytics tables in Unity Catalog.

### When to use this

- You have Lakehouse Sync CDC history tables (`lb_<table>_history`) in Unity Catalog from a Lakebase operational database
- You want to build a layered data architecture (bronze → silver → gold) on top of operational data
- You need clean current-state views, deduplication, and business aggregations for BI, ML, or Genie analytics
- You want automated, incremental pipeline refreshes instead of manual SQL queries

### How the layers map to CDC data

| Layer      | Purpose                                                | Source                                     | Output                                                |
| ---------- | ------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------- |
| **Bronze** | Raw CDC records with full history                      | Lakehouse Sync `lb_<table>_history` tables | No transformation needed — these tables already exist |
| **Silver** | Current state of each record, deduplicated and cleaned | Bronze history tables                      | One streaming table per entity with latest state only |
| **Gold**   | Business aggregations and domain-specific metrics      | Silver tables                              | Materialized views with aggregations, joins, and KPIs |

### 1. Scaffold a pipeline project

Use the Databricks CLI to scaffold a Lakeflow Declarative Pipelines project:

```bash
databricks bundle init lakeflow-pipelines \
  --config-file <(echo '{"project_name": "operational_analytics", "language": "sql", "serverless": "yes"}') \
  --profile <PROFILE> < /dev/null
```

Enter the project directory:

```bash
cd operational_analytics
```

### 2. Configure the pipeline catalog and schema

Edit `resources/operational_analytics.pipeline.yml` to target your Unity Catalog schema:

```yaml
resources:
  pipelines:
    operational_analytics:
      name: operational_analytics
      catalog: <CATALOG_NAME>
      schema: <SCHEMA_NAME>
      development: true
      serverless: true
      libraries:
        - file:
            path: src/
```

The pipeline publishes all datasets to `<CATALOG_NAME>.<SCHEMA_NAME>` by default.

### 3. Build the silver layer — current state from CDC

For each entity, create a SQL file in `src/` that extracts the latest state from the bronze CDC history table. The silver layer deduplicates by primary key and excludes deleted records.

Create `src/silver_<entity>.sql` (e.g., `src/silver_orders.sql`):

```sql
CREATE OR REFRESH MATERIALIZED VIEW silver_<entity>
COMMENT "Current state of <entity> records, deduplicated from CDC history"
AS
SELECT * EXCEPT (rn, _change_type, _lsn, _commit_timestamp)
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY <primary_key>
      ORDER BY _lsn DESC
    ) AS rn
  FROM <CATALOG_NAME>.<BRONZE_SCHEMA>.lb_<entity>_history
  WHERE _change_type IN ('insert', 'update_postimage', 'delete')
)
WHERE rn = 1
  AND _change_type != 'delete'
```

Replace `<primary_key>` with the entity's primary key column(s), `<CATALOG_NAME>.<BRONZE_SCHEMA>` with the catalog and schema where Lakehouse Sync writes the history tables, and `<entity>` with the table name.

Repeat for each entity you want in the silver layer.

### 4. Build the gold layer — business aggregations

Gold layer tables are materialized views that aggregate, join, or reshape silver tables for specific analytics use cases.

Create `src/gold_<metric>.sql` (e.g., `src/gold_daily_order_summary.sql`):

```sql
CREATE OR REFRESH MATERIALIZED VIEW gold_daily_order_summary
COMMENT "Daily order counts and revenue by status"
AS
SELECT
  DATE_TRUNC('day', created_at) AS order_date,
  status,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_revenue
FROM silver_orders
GROUP BY DATE_TRUNC('day', created_at), status
```

Gold tables read from silver tables within the same pipeline. Use `GROUP BY`, `JOIN`, window functions, or any SQL to build the business view you need.

### 5. Add data quality expectations (optional)

Add expectations to silver or gold tables to enforce data quality constraints:

```sql
CREATE OR REFRESH MATERIALIZED VIEW silver_<entity> (
  CONSTRAINT valid_primary_key EXPECT (<primary_key> IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT valid_timestamp EXPECT (created_at IS NOT NULL) ON VIOLATION DROP ROW
)
COMMENT "Current state of <entity> records with quality enforcement"
AS
SELECT ...
```

Expectations catch data issues early and can either warn, drop bad rows, or fail the pipeline update.

### 6. Deploy and run the pipeline

Validate, deploy, and run:

```bash
databricks bundle validate --profile <PROFILE>
databricks bundle deploy -t dev --profile <PROFILE>
databricks bundle run operational_analytics -t dev --profile <PROFILE>
```

Monitor the pipeline in the Databricks UI under **Workflows** → **Pipelines**.

### 7. Schedule ongoing refreshes

Add a job to refresh the pipeline on a schedule. Create `resources/operational_analytics_job.job.yml`:

```yaml
resources:
  jobs:
    operational_analytics_job:
      trigger:
        periodic:
          interval: 1
          unit: HOURS
      tasks:
        - task_key: refresh_pipeline
          pipeline_task:
            pipeline_id: ${resources.pipelines.operational_analytics.id}
```

Deploy the schedule:

```bash
databricks bundle deploy -t dev --profile <PROFILE>
```

### 8. Query the results

Silver and gold tables are standard Unity Catalog tables. Query them from any connected tool:

```sql
-- Current state of an entity
SELECT * FROM <CATALOG_NAME>.<SCHEMA_NAME>.silver_orders WHERE customer_id = 12345;

-- Business aggregation
SELECT * FROM <CATALOG_NAME>.<SCHEMA_NAME>.gold_daily_order_summary ORDER BY order_date DESC;
```

Use these tables as sources for Genie spaces, dashboards, notebooks, or ML pipelines.

### What you end up with

- **Bronze layer** — Lakehouse Sync CDC history tables (already exist, no pipeline needed)
- **Silver layer** — Deduplicated current-state materialized views per entity
- **Gold layer** — Business aggregations and metrics as materialized views
- **Scheduled pipeline** — Lakeflow Declarative Pipeline refreshing silver and gold layers incrementally
- **Unity Catalog tables** — All layers queryable via SQL, Spark, BI tools, and Genie

### Agent skill recommendations

For implementing each layer, the following Databricks agent skills provide detailed guidance:

| Skill                  | Use for                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `databricks-pipelines` | Lakeflow Declarative Pipeline syntax, dataset types, deployment workflow |
| `databricks-core`      | CLI authentication, profile management, data exploration                 |
| `databricks-lakebase`  | Lakebase project and branch management, Postgres access                  |

### Troubleshooting

| Issue                                      | Fix                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Silver table returns no rows               | Verify the bronze history table has data: `SELECT COUNT(*) FROM lb_<entity>_history` |
| `TABLE_OR_VIEW_NOT_FOUND` for bronze table | Use the fully-qualified name: `<CATALOG>.<SCHEMA>.lb_<entity>_history`               |
| Gold aggregation includes deleted records  | Confirm the silver layer filters `_change_type != 'delete'`                          |
| Pipeline fails on deploy                   | Run `databricks bundle validate` first to catch config errors                        |
| Incremental refresh not picking up changes | Verify Lakehouse Sync is active and the bronze table is updating                     |

#### References

- [Medallion architecture](https://docs.databricks.com/aws/en/lakehouse/medallion)
- [Lakeflow Declarative Pipelines](https://docs.databricks.com/aws/en/delta-live-tables/)
- [Materialized views](https://docs.databricks.com/aws/en/delta-live-tables/materialized-views)
- [Lakehouse Sync](https://docs.databricks.com/aws/en/oltp/projects/lakehouse-sync)
