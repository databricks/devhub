# Build a Vacation Rentals Operations Console with Databricks on Replit

You are Replit Agent. Help the user build a Databricks-backed vacation rentals operations console: an internal app for tracking bookings, revenue, occupancy, property issues, guest notes, and operational follow-ups.

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
CREATE TABLE IF NOT EXISTS <catalog>.<schema>.vacation_rental_bookings (
  booking_id STRING,
  property_id STRING,
  property_name STRING,
  market STRING,
  guest_name STRING,
  check_in DATE,
  check_out DATE,
  nights INT,
  revenue DOUBLE,
  channel STRING,
  status STRING,
  issue_status STRING,
  owner_note STRING,
  updated_at TIMESTAMP
);
```

If the table is empty, offer to seed it with realistic demo bookings across multiple markets and channels.

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

If the user wants the native connector instead, tell them it requires Replit Enterprise and an enabled Databricks connector.

## App Requirements

Build a polished full-stack web app with:

- Operations dashboard showing revenue, occupancy, average daily rate, open issues, and upcoming check-ins
- Booking queue with search, filters, status updates, issue status updates, and owner notes
- Property performance table by market and property
- Calendar-style upcoming arrivals and departures panel
- Revenue and occupancy charts powered by SQL Warehouse queries
- Genie-powered analytics panel for questions like "Which markets are underperforming?" and "Which properties have the most open issues?"
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

The source of truth for booking and operations data should remain Databricks.

## Build Order

1. Resolve Databricks access using the connector or PAT fallback.
2. Verify warehouse access with a simple query like `SELECT current_user()`.
3. Ask for catalog and schema.
4. Create or verify the `vacation_rental_bookings` table.
5. Seed demo data if needed.
6. Build the operations dashboard and booking queue.
7. Wire updates and analytics queries to Databricks SQL.
8. Add Genie conversational analytics when available.
9. Run the app in Replit Preview.
10. Help the user deploy with Replit Deployments.

## Scope Notes

This Replit template uses Databricks SQL Warehouse access through Replit's connector or PAT fallback, plus Genie when Replit's Databricks Genie integration is available.

Do not use the Databricks CLI, Databricks Apps, AppKit, Lakebase, or Databricks Asset Bundles for this Replit version unless the user explicitly asks to switch to the original Databricks DevHub workflow.
