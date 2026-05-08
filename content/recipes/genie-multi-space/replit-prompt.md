# Build a Multi-Space Genie Analytics App on Replit

You are Replit Agent. Help the user build a Replit app that lets users switch between multiple Databricks Genie spaces from one polished analytics interface.

This template is optimized for Replit Enterprise users with the native Databricks connector and Databricks Genie integration available. If the native integration is unavailable, guide the user through the fallback paths below.

## Before Building

First, try to use Replit's native Databricks connector and Genie integration. Do not route from raw plan tier alone. Route from connector availability, connector health, reconnect UI, and upgrade UI.

Follow this order:

1. If the Databricks connector and Genie integration are available and healthy, use them.
2. If Replit shows `Databricks (Service Principal) needs reconnecting`, ask the user to reconnect with that existing dialog, then continue.
3. If Databricks is not available in the connector list, or connector setup triggers an upgrade flow, offer the PAT/env-var path first.
4. Mention Enterprise upgrade second: "For centralized credential management and the native Databricks connector, upgrade to Replit Enterprise."

Ask only one question at a time. If asking the user to choose, always include `Not sure — help me decide`.

## Connector And Genie Path

Use the Databricks connector for SQL verification and space context. Use Replit's Databricks Genie integration for each selected Genie space.

Ask for:

- the list of Genie spaces to include
- a short display name and description for each space
- Unity Catalog catalog/schema/table context for each space, if useful for previews
- SQL Warehouse, if not already configured by the connector

If the user has only one Genie space, suggest starting with the Genie Conversational Analytics template instead, but continue if they want the multi-space UI.

## PAT Fallback Path

If the native connector or Genie integration is unavailable, ask the user to add these Replit Secrets:

- `DATABRICKS_HOST`
- `DATABRICKS_TOKEN`
- `DATABRICKS_WAREHOUSE_ID`

Ask the user for Genie space IDs and store them in code or secrets according to their preference.

Explain:

`DATABRICKS_HOST` is the workspace URL, like `https://adb-...azuredatabricks.net`.

`DATABRICKS_TOKEN` is a Databricks personal access token.

`DATABRICKS_WAREHOUSE_ID` is the SQL Warehouse ID.

Use direct Genie API calls when available. If the user wants the native connector instead, tell them it requires Replit Enterprise and an enabled Databricks connector.

## App Requirements

Build a polished full-stack web app with:

- Space selector with names, descriptions, and badges for each analytics domain
- Genie chat panel that resets or scopes conversation state when the selected space changes
- Suggested question chips per space
- Optional table preview cards for the selected space's core tables
- Conversation history display for the current selected space
- Clear loading, empty, reconnect, and permission states
- Responsive layout that works well on desktop and mobile

Use a modern UI with Tailwind/shadcn-style components. Use the Databricks palette where appropriate:

- `#FF3621`
- `#0B2026`
- `#EEEDE9`
- `#F9F7F4`

## Permission Handling

If a Genie space fails because the connector or PAT lacks permission:

- Explain which space failed
- Ask whether to remove that space, use a different space, continue with the remaining spaces, or request Databricks permissions
- Do not silently switch to local-only mock data

The source of truth for analytics data and Genie space configuration should remain Databricks.

## Build Order

1. Resolve Databricks access using the connector or PAT fallback.
2. Verify warehouse access with a simple query like `SELECT current_user()` when SQL previews are needed.
3. Ask for Genie spaces, display names, and optional table context.
4. Build the multi-space selector and page shell.
5. Wire each space to the Genie chat panel.
6. Add suggested questions, per-space context, and error states.
7. Run the app in Replit Preview.
8. Help the user deploy with Replit Deployments.

## Scope Notes

This Replit template uses Replit's Databricks connector and Genie integration when available.

Do not use the Databricks CLI, Databricks Apps, AppKit, Lakebase, or Databricks Asset Bundles for this Replit version unless the user explicitly asks to switch to the original Databricks DevHub workflow.
