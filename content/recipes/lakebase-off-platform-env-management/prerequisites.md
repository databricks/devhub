This recipe collects the environment variables needed to reach Lakebase from an app running outside Databricks App Platform. Verify these Databricks workspace features are enabled before starting.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds. A `not enabled` error means Lakebase is not available to this identity.
- **A provisioned Lakebase project.** Complete the [Create a Lakebase Instance](/templates/lakebase-create-instance) recipe first. You will read connection values from its branch, endpoint, and database.
- **Machine-to-machine OAuth for production (optional).** If you plan to run in production with a service principal, have `DATABRICKS_CLIENT_ID` / `DATABRICKS_CLIENT_SECRET` ready for that service principal. For local development, a workspace token from `databricks auth token --profile <PROFILE>` is sufficient.
