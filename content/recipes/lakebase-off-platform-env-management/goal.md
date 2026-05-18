## Lakebase Environment Management for Off-Platform Apps

Define and validate the environment variables needed to connect to Lakebase from apps deployed outside Databricks App Platform.

When done, you will have:

- All Lakebase connection values collected from the Databricks CLI
- A Zod-based environment validation module that fails fast on missing or invalid variables
- Support for both token auth (local dev) and M2M OAuth (production)
- An `.env.example` file documenting every required variable for your team and CI
