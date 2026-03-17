## Create a Databricks Model Serving endpoint

Create and validate a Databricks Model Serving endpoint for AI chat inference.

### 1. Choose an endpoint name

Pick a descriptive endpoint name for your app or feature.

Examples:

- `support-assistant`
- `analytics-copilot`

### 2. List available foundation models

```bash
databricks serving-endpoints get-open-api \
  --profile <PROFILE> \
  -o json
```

If your workspace uses a curated endpoint catalog, list available endpoints first:

```bash
databricks serving-endpoints list --profile <PROFILE> -o json
```

### 3. Create a serving endpoint

Create an endpoint with a served model using the workspace-supported model name.

```bash
databricks serving-endpoints create <endpoint-name> \
  --config '{
    "served_entities": [
      {
        "name": "<entity-name>",
        "entity_name": "<foundation-model-or-registered-model>",
        "entity_version": "<version-if-required>",
        "workload_size": "Small",
        "scale_to_zero_enabled": true
      }
    ]
  }' \
  --profile <PROFILE>
```

### 4. Wait until the endpoint is ready

```bash
databricks serving-endpoints get <endpoint-name> --profile <PROFILE> -o json
```

Check for readiness in the endpoint state before connecting your app.

### 5. Test the endpoint directly

Use the OpenAI-compatible chat completions API exposed by Databricks:

```bash
curl -sS \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  "https://<workspace>.cloud.databricks.com/serving-endpoints/<endpoint-name>/invocations" \
  -d '{
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Say hello in one short sentence." }
    ],
    "max_tokens": 64
  }'
```

### 6. Add endpoint name to app config

Set the endpoint name in `app.yaml`:

```yaml
env:
  - name: DATABRICKS_SERVING_ENDPOINT
    value: "<endpoint-name>"
```

For local development, mirror this in `.env`.

#### References

- [Databricks Model Serving endpoints](https://docs.databricks.com/en/machine-learning/model-serving/create-manage-serving-endpoints.html)
- [Databricks AI Gateway](https://docs.databricks.com/en/ai-gateway/)
