## SaaS Subscription Tracker

This example demonstrates a straightforward internal CRUD tool built on Databricks: a SaaS subscription tracker where teams log the tools they use, who owns each subscription, what it costs, and when it renews. A Genie space provides self-serve analytics over the subscription data.

### Data Flow

All subscription data lives in a single Lakebase Postgres table and is served directly to the app:

1. **Lakebase Postgres** stores the `saas_tracker.subscriptions` table with name, vendor, cost, billing cycle, owner, status, and renewal dates.
2. The **SaaS Tracker App** (Databricks App) reads and writes subscriptions through Express API routes backed by Lakebase.
3. **SQL Warehouse queries** power the analytics dashboard (spend overview, spend by category).
4. A **Genie Space** configured over the subscriptions table lets users ask natural language questions about spend, owners, and renewals.

### What to Adapt

To make this example your own:

- **Lakebase**: Point the app's `databricks.yml` at your own Lakebase project, branch, and database.
- **SQL Warehouse**: Set the warehouse ID for the analytics queries.
- **Genie Space**: Create a Genie space over the `saas_tracker.subscriptions` table and set the space ID.
- **Categories**: Adjust the category list in the server routes and form component to match your organization's departments.
- **Seed Data**: The seed script creates 18 realistic demo subscriptions. Replace with your own data or use the app's Add form.
