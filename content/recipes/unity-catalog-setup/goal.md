Create a Unity Catalog catalog backed by an external S3 bucket for scenarios that require custom storage control.

When done, you will have:

- An IAM role granting Databricks access to your S3 bucket
- A storage credential and external location registered in Unity Catalog
- A Unity Catalog catalog using your external S3 bucket as its storage root
- Infrastructure ready for Sync Tables, cross-account access, or custom lifecycle policies
