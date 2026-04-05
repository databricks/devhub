## Set Up Unity Catalog with External Storage

Create a Unity Catalog catalog backed by an external S3 bucket. For most use cases, the default metastore-managed storage works fine and requires no extra setup — just `databricks catalogs create <CATALOG_NAME>`. Use this recipe when you specifically need external storage.

> **Note:** Sync Tables — syncing data from the lakehouse back to Lakebase — currently requires the source Unity Catalog catalog to use external storage. Default managed storage does not work with synced tables yet. If you plan to sync lakehouse data back to Lakebase, follow this recipe. This requirement is expected to be removed in a future release.

### When to use this

- You plan to use Sync Tables to sync lakehouse data back to Lakebase — external storage is currently required for this
- You want to control the S3 bucket location, encryption, and lifecycle policies
- You need cross-account or cross-workspace access to the underlying data

### Prerequisites

- A Databricks workspace with Unity Catalog enabled
- An S3 bucket in the same AWS region as your workspace
- An IAM role with read/write access to the S3 bucket (defined in the same AWS account as the bucket)
- `CREATE_CATALOG` and `CREATE STORAGE CREDENTIAL` privileges on the metastore

### 1. Create an IAM role for the storage credential

Create an IAM role in AWS that grants Databricks access to your S3 bucket. The trust policy must allow the Databricks account to assume the role.

Minimal IAM policy for the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": ["arn:aws:s3:::<BUCKET_NAME>", "arn:aws:s3:::<BUCKET_NAME>/*"]
    }
  ]
}
```

Note the IAM role ARN (e.g., `arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>`).

### 2. Create a storage credential

Register the IAM role as a storage credential in Unity Catalog:

```bash
databricks storage-credentials create <CREDENTIAL_NAME> \
  --json '{
    "aws_iam_role": {
      "role_arn": "arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>"
    }
  }' --profile <PROFILE>
```

Verify:

```bash
databricks storage-credentials get <CREDENTIAL_NAME> --profile <PROFILE>
```

### 3. Create an external location

Map the S3 bucket path to the storage credential:

```bash
databricks external-locations create <LOCATION_NAME> \
  s3://<BUCKET_NAME>/<PREFIX> \
  <CREDENTIAL_NAME> \
  --comment "External storage for analytics catalog" \
  --profile <PROFILE>
```

Verify:

```bash
databricks external-locations get <LOCATION_NAME> --profile <PROFILE>
```

### 4. Create a catalog with external storage

Create the catalog and point its managed storage to the external location:

```bash
databricks catalogs create <CATALOG_NAME> \
  --storage-root s3://<BUCKET_NAME>/<PREFIX> \
  --comment "Catalog for operational and analytics data" \
  --profile <PROFILE>
```

All managed tables created in this catalog store their data in the specified S3 path instead of the metastore default.

Verify:

```bash
databricks catalogs get <CATALOG_NAME> --profile <PROFILE>
```

### 5. Create a schema

Create a schema within the catalog for your tables:

```bash
databricks schemas create <SCHEMA_NAME> <CATALOG_NAME> \
  --comment "Schema for lakehouse tables" \
  --profile <PROFILE>
```

Verify:

```bash
databricks schemas list <CATALOG_NAME> --profile <PROFILE>
```

### What you end up with

- A **storage credential** linked to your IAM role for S3 access
- An **external location** mapping an S3 path to the credential
- A **Unity Catalog catalog** storing managed table data in your S3 bucket
- A **schema** ready for tables from Lakebase Change Data Feed, Lakehouse Sync, or Lakeflow Pipelines

### Troubleshooting

| Issue                                          | Fix                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `PERMISSION_DENIED` on credential creation     | Confirm you have `CREATE STORAGE CREDENTIAL` on the metastore     |
| `ACCESS_DENIED` on S3 during validation        | Verify the IAM role trust policy allows Databricks to assume it   |
| Bucket not found                               | Confirm the bucket exists in the same AWS region as the workspace |
| Catalog creation fails with storage root error | Verify the external location covers the specified S3 path         |

#### References

- [Create a storage credential and external location for S3](https://docs.databricks.com/aws/en/connect/unity-catalog/cloud-storage/s3/s3-external-location-manual)
- [Create catalogs](https://docs.databricks.com/aws/en/catalogs/create-catalog.html)
- [External locations CLI](https://docs.databricks.com/aws/en/dev-tools/cli/reference/external-locations-commands)
- [Storage credentials CLI](https://docs.databricks.com/aws/en/dev-tools/cli/reference/storage-credentials-commands)
