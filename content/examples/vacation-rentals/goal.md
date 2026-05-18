## Vacation Rentals Operations Console

This template demonstrates an internal operations console for a vacation rentals platform ("Wanderbricks"). Operators see revenue performance by destination, work through a booking queue with per-booking flags and agent notes, and ask natural-language questions about the business through an embedded Genie chat panel.

### Data Flow

The app composes four Databricks primitives behind a single React UI:

1. **SQL Warehouse** runs analytics queries (revenue by destination, single booking detail) over the seeded `samples.wanderbricks.{bookings,properties,destinations,reviews}` tables. Queries live in `config/queries/*.sql` and are executed through the AppKit `analytics` plugin.
2. **Lakebase Postgres** stores operator-owned state in the `app.booking_flags` and `app.booking_notes` tables. The Express server creates the schema and tables on startup and exposes CRUD routes for flagging bookings and adding agent notes.
3. **Genie Space** ("Wanderbricks") is configured over the booking, property, and destination tables. The AppKit `genie` plugin embeds a chat panel so users can ask spend, occupancy, and rating questions in natural language.
4. **Databricks App** ties it together: an Express + AppKit server, a Vite/React/Tailwind client, deployed via a Databricks Asset Bundle that declares the SQL warehouse, Genie space, and Lakebase database as app resources.

### What to Adapt

Setup, environment variables, and bundle deployment are documented in the repository's **`template/README.md`**.

To make this template your own:

- **Source data**: Point the analytics SQL files at your own catalog and schema instead of `samples.wanderbricks.*`. Adjust the joins to match your booking, property, and destination model.
- **SQL Warehouse**: Set `sql_warehouse_id` in `databricks.yml` to the warehouse you want the app to query.
- **Lakebase**: Replace `postgres_branch` and `postgres_database` with your own Lakebase project, branch, and database. The `app.booking_flags` and `app.booking_notes` tables are created automatically on first run.
- **Genie Space**: Create a Genie space over your booking tables and set `genie_space_id` and `genie_space_name` in `databricks.yml`.
- **Domain wording**: The UI is themed around vacation rentals (destinations, bookings, agent notes). For other operations consoles (logistics, support, partnerships), rename the routes and components and re-point the analytics queries — the Lakebase + Genie + analytics scaffolding stays the same.
