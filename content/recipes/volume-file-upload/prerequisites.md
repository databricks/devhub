Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **Unity Catalog enabled with access to a catalog and schema.** Run `databricks catalogs list --profile <PROFILE>` and confirm at least one writable catalog is listed. You also need `USE_CATALOG` on the catalog and `USE_SCHEMA` + `CREATE_VOLUME` on the schema where the recipe creates the managed Volume. A `PERMISSION_DENIED` error on `databricks volumes create` in Step 1 means one of those grants is missing.
- **Databricks Apps enabled.** Run `databricks apps list --profile <PROFILE>` and confirm the command succeeds (an empty list is fine). The recipe deploys an AppKit app that reads and writes through the `files` plugin.
