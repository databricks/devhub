Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). A `not enabled` error means Lakebase is not available to this identity in this workspace.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). The chat persistence layer runs inside an AppKit app deployed to Databricks Apps.
- **A scaffolded AppKit app with Lakebase wired up.** Complete the [Create a Lakebase Instance](/templates/lakebase-create-instance) and [Lakebase Data Persistence](/templates/lakebase-data-persistence) recipes first. This recipe adds chat tables on top of that setup.
