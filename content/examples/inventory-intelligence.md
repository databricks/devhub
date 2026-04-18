## Inventory Intelligence

This example builds a full retail inventory management system on the Databricks stack: a React app where store managers monitor stock health, review AI-generated replenishment recommendations, and approve purchase orders — all powered by a live medallion pipeline and pluggable demand forecast job.

### Setup — interview the user

Before doing anything else, ask the user these questions **one at a time**. Wait for each answer before asking the next. Use the answers to configure `databricks.yml`, the seed scripts, and the deploy commands.

1. **Databricks workspace URL** — ask: "What is your Databricks workspace URL? (e.g. `https://dbc-xxxx.cloud.databricks.com` — run `databricks auth env` to find it)"
2. **CLI profile** — ask: "Which Databricks CLI profile should I use? (run `databricks auth profiles` to list them; press Enter to use `DEFAULT`)"
3. **Unity Catalog catalog name** — ask: "What is your Unity Catalog catalog name? The pipeline will write silver and gold Delta tables there (e.g. `my_catalog`)"
4. **SQL Warehouse ID** — ask: "What is your SQL Warehouse ID? (run `databricks warehouses list --output json` or find it in the warehouse settings URL — if you don't have one, I can create a serverless warehouse for you)"
5. **Lakebase** — ask: "Do you already have a Lakebase project and database set up? If yes, share the branch resource name (e.g. `projects/my-project/branches/production`) and database resource name. If no, I'll walk you through creating one."
6. **Data mode** — ask: "Do you want demo data (5 stores, controlled stock scenarios, great for demos) or realistic randomized data seeded from scratch?"
7. **Genie analytics tab** — ask: "Do you want the optional AI/BI Genie chat tab in the app? (If yes, the Genie space will be created automatically — this requires running the sample data pipeline first: data generator → DLT analytics → forecast job, ~10–15 min. This happens as part of the deploy.)"
8. **Demand forecast model** — ask: "Which demand forecast model would you like? Options: `weighted_moving_average` (default, no extra infra), `exponential_smoothing`, `prophet`, or `model_serving` (requires a Model Serving endpoint)"

Once all answers are collected:

1. Update `databricks.yml` — set `workspace.host`, `sql_warehouse_id`, `postgres_branch`, `postgres_database`, `catalog`, `forecast_model` in the appropriate target(s).
2. Run the deploy:
   - **Randomized data** (with or without Genie): `./deploy.sh --profile <profile> --target full --sample-data`
   - **Demo data without Genie**: `./deploy.sh --profile <profile> --target demo`
   - **Demo data with Genie**: run `--target full --sample-data` first (creates the DLT pipeline and UC gold tables Genie needs), then `./deploy.sh --profile <profile> --target demo` to load controlled demo data and wire up the Genie space
3. `deploy.sh` handles Genie automatically: it checks whether UC gold tables exist, runs the sample data pipeline if not, creates the Genie space, patches `databricks.yml` with the new space ID (in the correct target section), and redeploys with the Genie resource bound.

**If the user needs a new SQL Warehouse**, create a serverless one:

```bash
databricks warehouses create --profile <profile> --name "inventory-intelligence" \
  --cluster-size Small --auto-stop-mins 30 --max-num-clusters 1 \
  --enable-serverless-compute
```

Use the `id` from the response as the warehouse ID.

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

To make this example your own:

- **Catalog**: Set the `catalog` variable in each pipeline's `databricks.yml` to your Unity Catalog catalog name.
- **Lakebase**: Point the app's `databricks.yml` at your own Lakebase project, branch, and database.
- **Tables**: The seed script creates the OLTP schema with 5 stores, 25 products, and 90 days of sales history. After seeding, configure Lakehouse Sync to replicate the `inventory` schema tables.
- **Sync Tables**: Manually create the three reverse sync configurations (see the README for the exact table mappings).
- **Forecast Model**: Set the `forecast_model` variable in the demand forecast pipeline to `weighted_moving_average` (default), `exponential_smoothing`, `prophet`, or `model_serving`.
- **Genie Space**: Create a Genie space over your gold tables and set the `genie_space_id` in the app bundle to activate the Analytics tab.
