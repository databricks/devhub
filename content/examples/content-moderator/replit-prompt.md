# Build a Content Moderation Console with Databricks on Replit

You are Replit Agent. Help the user build a Databricks-backed content moderation console: an internal app for reviewing submitted content, tracking moderation decisions, analyzing policy violations, and optionally scoring submissions with Databricks Model Serving.

This template is optimized for Replit Enterprise users with the native Databricks connector enabled. If the connector is unavailable, guide the user through the fallback paths below.

## Before Building

First, try to use Replit's native Databricks connector. Do not route from raw plan tier alone. Route from connector availability, connector health, reconnect UI, and upgrade UI.

Follow this order:

1. If the Databricks connector is available and healthy, use it.
2. If Replit shows `Databricks (Service Principal) needs reconnecting`, ask the user to reconnect with that existing dialog, then continue.
3. If Databricks is not available in the connector list, or connector setup triggers an upgrade flow, offer the PAT/env-var path first.
4. Mention Enterprise upgrade second: "For centralized credential management and the native Databricks connector, upgrade to Replit Enterprise."

Ask only one question at a time. If asking the user to choose, always include `Not sure — help me decide`.

## Connector Path

Use the Databricks connector to execute SQL against the user's Databricks SQL Warehouse.

Ask for:

- Unity Catalog catalog name
- Unity Catalog schema name
- SQL Warehouse, if not already configured by the connector

Create or reuse this table:

```sql
CREATE TABLE IF NOT EXISTS <catalog>.<schema>.moderation_submissions (
  submission_id STRING,
  content_text STRING,
  content_type STRING,
  source_channel STRING,
  submitted_by STRING,
  submitted_at TIMESTAMP,
  moderation_status STRING,
  policy_category STRING,
  severity STRING,
  model_score DOUBLE,
  reviewer STRING,
  reviewer_note STRING,
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

If the table is empty, offer to seed it with realistic demo submissions across multiple content types, policy categories, and moderation statuses.

## PAT Fallback Path

If the native connector is unavailable, ask the user to add these Replit Secrets:

- `DATABRICKS_HOST`
- `DATABRICKS_TOKEN`
- `DATABRICKS_WAREHOUSE_ID`

Explain:

`DATABRICKS_HOST` is the workspace URL, like `https://adb-...azuredatabricks.net`.

`DATABRICKS_TOKEN` is a Databricks personal access token.

`DATABRICKS_WAREHOUSE_ID` is the SQL Warehouse ID.

Use these env vars to call the Databricks SQL Statement Execution API.

If the user wants Databricks Model Serving for automatic scoring, also ask for:

- `DATABRICKS_MODEL_SERVING_ENDPOINT`

Use the PAT to call the Model Serving endpoint only if the user explicitly wants AI scoring.

If the user wants the native connector instead, tell them it requires Replit Enterprise and an enabled Databricks connector.

## App Requirements

Build a polished full-stack web app with:

- Moderation dashboard showing pending reviews, approved/rejected counts, average severity, review throughput, and policy category distribution
- Submission queue with search, filters, severity badges, policy category badges, and moderation status tabs
- Submission detail page with full content, model score, suggested category, reviewer decision controls, and reviewer notes
- Review workflow for approve, reject, escalate, and mark as needs more context
- Analytics charts powered by SQL Warehouse queries
- Genie-powered analytics panel for questions like "Which policy categories are increasing?" and "Which reviewers have the longest queues?"
- Optional AI scoring flow using Databricks Model Serving when `DATABRICKS_MODEL_SERVING_ENDPOINT` is configured
- Empty states, loading states, and clear connection/permission errors

Use a modern UI with Tailwind/shadcn-style components. Use the Databricks palette where appropriate:

- `#FF3621`
- `#0B2026`
- `#EEEDE9`
- `#F9F7F4`

## Permission Handling

If SQL fails because the connector or PAT lacks permission:

- Explain the failed operation
- Ask whether to use an existing table, switch to read-only mode, or request Databricks permissions
- Do not silently switch to local-only storage

If Model Serving fails or is unavailable:

- Keep the moderation queue and SQL dashboard functional
- Ask whether to continue without AI scoring, configure a serving endpoint, or switch to manual-only moderation

The source of truth for moderation data should remain Databricks.

## Build Order

1. Resolve Databricks access using the connector or PAT fallback.
2. Verify warehouse access with a simple query like `SELECT current_user()`.
3. Ask for catalog and schema.
4. Create or verify the `moderation_submissions` table.
5. Seed demo data if needed.
6. Build the moderation dashboard and submission queue.
7. Build the submission detail and review workflow.
8. Wire reads, writes, and analytics queries to Databricks SQL.
9. Add Genie conversational analytics when available.
10. Add optional Model Serving scoring only if the user provides a serving endpoint.
11. Run the app in Replit Preview.
12. Help the user deploy with Replit Deployments.

## Scope Notes

This Replit template uses Databricks SQL Warehouse access through Replit's connector or PAT fallback, plus Genie when Replit's Databricks Genie integration is available.

Databricks Model Serving is optional in this Replit version. Use it only when the user configures PAT access and provides a serving endpoint.

Do not use the Databricks CLI, Databricks Apps, AppKit, Lakebase, or Databricks Asset Bundles for this Replit version unless the user explicitly asks to switch to the original Databricks DevHub workflow.
