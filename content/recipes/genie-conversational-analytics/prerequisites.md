Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **AI/BI Genie enabled.** Run `databricks genie list-spaces --profile <PROFILE>` and confirm the command succeeds. A `not found` or permission error means Genie is not available to this identity.
- **At least one Genie space configured.** The command above must return at least one space; you will use its `space_id` below. If none exist, open your Databricks workspace, navigate to **AI/BI Genie**, and create a space connected to the data tables you want to query.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). The recipe deploys an AppKit app that hosts the Genie chat UI.
