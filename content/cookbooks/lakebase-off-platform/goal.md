## What you are building

A connection from an app hosted outside the Databricks Apps platform (for example on AWS, Vercel, or Netlify) to Lakebase Postgres. The app uses portable environment configuration, token management with automatic credential refresh, and Drizzle ORM for type-safe database access.

### Components

1. **Lakebase Environment Management** — set up a Zod-validated environment configuration for secure Lakebase connection values.
2. **Lakebase Token Management** — implement token fetch, cache, and automatic refresh for Lakebase Postgres credentials.
3. **Drizzle ORM with Lakebase** — configure a Drizzle ORM pool with auto-refreshing credentials and migration support.
