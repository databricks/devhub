This template fetches and caches Lakebase Postgres credentials from a Node.js process. Verify these Databricks workspace features are enabled before starting.

- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds. A `not enabled` error means Lakebase is not available to this identity.
- **A provisioned Lakebase project.** Complete the [Create a Lakebase Instance](/templates/lakebase-create-instance) template first so you have a `LAKEBASE_ENDPOINT` resource path to pass to the credentials API.
- **An env management setup.** Complete the [Lakebase Env Management for Off-Platform Apps](/templates/lakebase-off-platform-env-management) template first — this template imports the validated `env` module and expects `DATABRICKS_HOST`, `LAKEBASE_ENDPOINT`, and either `DATABRICKS_TOKEN` or `DATABRICKS_CLIENT_ID` + `DATABRICKS_CLIENT_SECRET` to be set.
