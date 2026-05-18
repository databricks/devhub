## Drizzle ORM with Lakebase in an Off-Platform App

Connect Drizzle ORM to Lakebase in any Node.js server outside Databricks App Platform, with automatic credential refresh and migration support.

When done, you will have:

- A Lakebase-backed connection pool with automatic token refresh via password callback
- Drizzle ORM initialized with your schema and ready for type-safe queries
- A migration script that builds a temporary connection URL with fresh Lakebase credentials
- A working Drizzle Kit configuration for schema generation and migrations
