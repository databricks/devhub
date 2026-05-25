Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Lakebase Postgres available in the workspace.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds (an empty list is fine — you are about to create the first project). A `not enabled` or permission error means Lakebase is not available to this identity.
