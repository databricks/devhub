## Agentic Support Console

This example brings together the full Databricks developer stack into a single operational data application: an AI-powered support console where every customer message is automatically triaged by an LLM, and support agents review, approve, or override the suggestion from a purpose-built internal tool.

### Data Flow

Customer interactions flow from your application's OLTP database (Lakebase Postgres) through the lakehouse via CDC, get enriched by an AI agent, and are served back to the support console through reverse sync:

1. **OLTP writes** land in Lakebase Postgres (users, orders, support cases, messages).
2. **Lakehouse Sync** replicates every change into Unity Catalog as CDC history tables (bronze layer).
3. A **Lakeflow Declarative Pipeline** transforms CDC history into current-state silver tables and analytical gold materialized views (daily revenue, support overview, user profiles, case context).
4. A **Lakeflow Job** runs every minute, finds unanswered messages, builds rich context from gold tables, calls an LLM via AI Gateway, and merges suggested responses into a Delta table.
5. **Sync Tables** (reverse sync) replicate gold tables back into Lakebase for sub-10ms reads.
6. The **Support Console** (Databricks App) reads from both OLTP and synced gold tables to present cases, AI suggestions, and analytics.

### What to Adapt

To make this example your own:

- **Catalog**: Set the `catalog` variable in each pipeline's `databricks.yml` to your Unity Catalog catalog name.
- **Lakebase**: Point the app's `databricks.yml` at your own Lakebase project, branch, and database.
- **Tables**: The seed script creates the OLTP schema. After seeding, configure Lakehouse Sync to replicate your `public` schema tables.
- **Sync Tables**: Manually create the four reverse sync configurations (see the README for the exact table mappings).
- **AI Gateway**: Set the `endpoint` variable to your preferred model serving endpoint.
- **Genie Space**: Create a Genie space over your gold tables and set the `genie_space_id` in the app bundle.
