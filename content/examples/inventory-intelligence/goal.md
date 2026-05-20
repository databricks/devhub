This template builds a full retail inventory management system on the Databricks stack: a React app where store managers monitor stock health, review AI-generated replenishment recommendations, and approve purchase orders — all powered by a live medallion pipeline and pluggable demand forecast job.

### Data Flow

Sales and stock data flow from Lakebase Postgres through the lakehouse, get enriched by a demand forecast model, and are served back to the app through reverse sync:

1. **OLTP writes** land in Lakebase Postgres (stores, products, stock levels, sales transactions, replenishment orders).
2. **Lakehouse Sync** replicates every change into Unity Catalog as CDC history tables (bronze layer).
3. A **Lakeflow Declarative Pipeline** transforms CDC history into current-state silver tables and gold materialized views (inventory overview, low stock alerts, sales velocity).
4. A **Lakeflow Job** runs on a schedule, loads the silver sales history, and runs a pluggable demand forecast model to produce 30-day unit forecasts and replenishment recommendations in a Delta gold table.
5. **Sync Tables** (reverse sync) replicate the gold tables back into Lakebase for low-latency reads.
6. The **Inventory Intelligence App** (Databricks App) reads from both OLTP and synced gold tables to show dashboards, store drill-downs, a replenishment queue, and optional Genie analytics.

### Design

The app should have a **beautiful, polished design** — clean typography, consistent spacing, and a professional retail aesthetic. Use shadcn/ui components as the foundation, Tailwind for all styling, and brand colors throughout. Dashboards should feel data-rich but uncluttered; the replenishment queue should make approval workflows feel effortless.

### What to Adapt

Provisioning (Unity Catalog schemas, Lakebase REPLICA IDENTITY), seeding, pipeline deploys, reverse sync, and app deploy are documented in the repository's **`template/README.md`** alongside the code.

To make this template your own:

- **Catalog**: Set the `catalog` variable in each pipeline's `databricks.yml` to your Unity Catalog catalog name.
- **Lakebase**: Point the app's `databricks.yml` at your own Lakebase project, branch, and database.
- **Tables**: The seed script creates the OLTP schema with 5 stores, 25 products, and 90 days of sales history. After seeding, configure Lakehouse Sync to replicate the `inventory` schema tables.
- **Sync Tables**: Manually create the three reverse sync configurations (see the README for the exact table mappings).
- **Forecast Model**: Set the `forecast_model` variable in the demand forecast pipeline to `weighted_moving_average` (default), `exponential_smoothing`, `prophet`, or `model_serving`.
- **Genie Space**: Create a Genie space over your gold tables and set the `genie_space_id` in the app bundle to activate the Analytics tab.
