Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **An OpenAI-compatible chat endpoint in Model Serving.** Run `databricks serving-endpoints list --profile <PROFILE>` and confirm at least one OpenAI-compatible chat endpoint is listed (e.g. `databricks-gpt-5-4-mini`, `databricks-meta-llama-3-3-70b-instruct`, or `databricks-claude-sonnet-4`). Endpoint availability varies by workspace and region; note the one you plan to set as `DATABRICKS_ENDPOINT`.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). A permission or `not enabled` error means Apps is not available to this identity in this workspace.
