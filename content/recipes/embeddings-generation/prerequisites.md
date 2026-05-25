Verify these Databricks workspace features are enabled before starting. If any check fails, ask your workspace admin to enable the feature.

- **An embedding endpoint in Model Serving.** Run `databricks serving-endpoints list --profile <PROFILE>` and confirm at least one embedding endpoint is listed (for example `databricks-gte-large-en` or `databricks-bge-large-en`, both 1024-dimension). Endpoint availability varies by workspace; note the endpoint name you plan to set as `DATABRICKS_EMBEDDING_ENDPOINT`.
