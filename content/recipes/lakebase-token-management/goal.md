## Lakebase Token Management

Fetch, cache, and automatically refresh the short-lived Postgres credentials that Lakebase requires, supporting both token auth and M2M OAuth.

When done, you will have:

- A token manager that fetches and caches Lakebase Postgres credentials with automatic refresh before expiry
- Support for direct token auth (local development) and M2M OAuth (production)
- A local dev script that refreshes your workspace token in your env file
