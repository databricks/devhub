This recipe connects an off-platform Node.js app (e.g. AWS, Vercel, Netlify) to Lakebase Postgres. Verify these Databricks workspace features are enabled before starting.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds. A `not enabled` error means Lakebase is not available to this identity.
- **A provisioned Lakebase project.** Complete the [Create a Lakebase Instance](/resources/lakebase-create-instance) recipe first so you have an endpoint host, database, and endpoint resource path available as `PGHOST`, `PGDATABASE`, and `LAKEBASE_ENDPOINT`.
- **An env management setup for off-platform auth.** Complete the [Lakebase Env Management for Off-Platform Apps](/resources/lakebase-off-platform-env-management) and [Lakebase Token Management](/resources/lakebase-token-management) recipes first — this recipe imports `env` and `getLakebasePostgresToken` from those modules.
