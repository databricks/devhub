Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Lakebase Postgres available.** Run `databricks postgres list-projects --profile <PROFILE>` and confirm the command succeeds. A `not enabled` error means Lakebase is not available to this identity.
- **A provisioned Lakebase project.** Complete the [Create a Lakebase Instance](/templates/lakebase-create-instance) template first. You will enable the `vector` extension against its primary endpoint.
- **`databricks psql` available in your CLI.** Run `databricks psql --help` and confirm the subcommand exists. If it does not, upgrade the Databricks CLI (see [Set Up Your Local Dev Environment](/templates/set-up-your-local-dev-environment)).
