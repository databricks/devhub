# Build an Operational Data Analytics App

Help the user build a Databricks-backed operational analytics app over Unity Catalog tables: an internal dashboard for monitoring operational metrics, trends, anomalies, and business KPIs.

## Data

Use the Databricks connector (or PAT fallback) to execute SQL against the user's SQL Warehouse.

Ask for:

- Unity Catalog catalog name
- Unity Catalog schema name
- the operational table or gold aggregate table to analyze
- SQL Warehouse, if not already configured by the connector

If the user does not have an operational analytics table yet, offer to create a small demo table:

```sql
CREATE TABLE IF NOT EXISTS <catalog>.<schema>.operational_metrics (
  metric_date DATE,
  business_unit STRING,
  region STRING,
  metric_name STRING,
  metric_value DOUBLE,
  target_value DOUBLE,
  status STRING,
  updated_at TIMESTAMP
);
```

## Features

Build a polished full-stack web app with:

- KPI dashboard with current value, target, variance, and trend for each selected metric
- Filters for date range, business unit, region, and metric
- Time-series charts and target comparison charts
- Detail table for drilling into metric rows
- Saved SQL query panel so the user can see and adjust the queries powering the dashboard
- Genie-powered analytics panel for questions like "Which regions are missing target?" and "What changed week over week?"
- Empty states, loading states, clear connection/permission errors

## Build Order

1. Resolve Databricks access per the general routing above.
2. Verify warehouse access with `SELECT current_user()`.
3. Ask for catalog, schema, and target table.
4. Inspect the target table schema if available.
5. Create demo data only if the user wants a sandbox table.
6. Build the dashboard and filter controls.
7. Wire analytics queries to Databricks SQL.
8. Add Genie conversational analytics when available.
9. Run the app in Replit Preview.
10. Help the user deploy with Replit Deployments.

## Notes

This template consumes Unity Catalog tables that already exist or demo tables created through SQL. It does not provision external storage, Lakebase Change Data Feed (CDF), or Lakeflow Spark Declarative Pipelines for this Replit version.
