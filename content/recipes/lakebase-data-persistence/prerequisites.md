Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds. A `not enabled` error means Lakebase is not available to this identity.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). The recipe deploys an AppKit app to Databricks Apps.
- **A provisioned Lakebase project.** Complete the [Create a Lakebase Instance](/resources/lakebase-create-instance) recipe first and collect the project's endpoint host, endpoint resource path, database resource path, and PostgreSQL database name.
