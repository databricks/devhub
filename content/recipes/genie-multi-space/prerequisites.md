This recipe upgrades an existing single-space Genie app to switch between multiple spaces. Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **AI/BI Genie enabled.** Run `databricks genie list-spaces --profile <PROFILE>` and confirm the command succeeds.
- **Two or more Genie spaces configured.** The list above must return at least two spaces — one per entry you want in the selector. If you have fewer, create additional spaces in **AI/BI Genie** in the Databricks UI.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds.
- **A scaffolded AppKit app with the Genie feature.** Complete the [Genie Conversational Analytics](/resources/genie-conversational-analytics) recipe first. This recipe only covers the upgrade from one space to many — not the initial Genie wiring.
