# Build a Medallion Analytics App from CDC Tables

Help the user build a Databricks-backed medallion analytics app: a dashboard for exploring current-state silver tables and aggregated gold tables sourced from CDC history.

## Data

Use the Databricks connector (or PAT fallback) to execute SQL against the user's SQL Warehouse.

Ask for:

- Unity Catalog catalog name
- silver schema or table name
- gold schema or aggregate table name
- SQL Warehouse, if not already configured by the connector

If the user does not have medallion tables yet, offer to create demo silver and gold tables so the app can run immediately.

## Features

Build a polished full-stack web app with:

- Overview dashboard showing row counts, freshness, recent change volume, and gold aggregate health
- Silver current-state table browser with search, filters, and change timestamp columns
- Gold metrics dashboard with trend charts and grouped aggregates
- Data freshness and pipeline status cards based on table timestamps
- SQL query inspector showing the silver and gold queries used by the app
- Genie-powered analytics panel for questions like "What changed most recently?" and "Which aggregates changed the most this week?"
- Empty states, loading states, clear connection/permission errors

## Build Order

1. Resolve Databricks access per the general routing above.
2. Verify warehouse access with `SELECT current_user()`.
3. Ask for catalog, silver table, and gold table.
4. Inspect available columns and timestamp fields.
5. Create demo silver/gold tables only if the user wants a sandbox.
6. Build the medallion dashboard and table browser.
7. Wire analytics queries to Databricks SQL.
8. Add Genie conversational analytics when available.
9. Run the app in Replit Preview.
10. Help the user deploy with Replit Deployments.

## Notes

This template visualizes medallion tables that already exist, or demo tables created through SQL. It does not create Lakeflow Spark Declarative Pipelines, Lakebase Change Data Feed (CDF), or CDC replication for this Replit version.
