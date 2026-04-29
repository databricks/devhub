This template creates a Unity Catalog catalog backed by an external S3 bucket and requires AWS-specific privileges both in Databricks and in AWS IAM.

- **Databricks CLI authenticated.** Run `databricks auth profiles` and confirm at least one profile shows `Valid: YES`. If none do, authenticate with `databricks auth login --host <workspace-url> --profile <PROFILE>`.
- **AWS workspace.** This template uses S3 and IAM; it does not apply to Azure or GCP workspaces. Confirm your workspace host is `*.cloud.databricks.com`.
- **Unity Catalog enabled on the workspace.** Run `databricks catalogs list --profile <PROFILE>` and confirm the command succeeds (the system catalogs `main` and `system` should appear). A `not enabled` error means the workspace is not attached to a Unity Catalog metastore.
- **Metastore privileges to create credentials and catalogs.** You need `CREATE STORAGE CREDENTIAL`, `CREATE EXTERNAL LOCATION`, and `CREATE_CATALOG` on the metastore. If any CLI call in this template returns `PERMISSION_DENIED`, ask your metastore admin to grant the missing privilege.
- **An S3 bucket and IAM role in the same AWS account and region as your workspace.** The template walks through pointing a storage credential at the IAM role; you must already have permissions in AWS to create the role and policy.
