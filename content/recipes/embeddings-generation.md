## Generate Embeddings with AI Gateway

Generate text embeddings from a Databricks AI Gateway endpoint using the Databricks SDK.

### 1. Find an embedding endpoint

```bash
databricks serving-endpoints list --profile <PROFILE>
```

Common embedding endpoints: `databricks-gte-large-en` (1024d), `databricks-bge-large-en` (1024d).

### 2. Configure environment

`.env`:

```bash
DATABRICKS_EMBEDDING_ENDPOINT=databricks-gte-large-en
```

`app.yaml`:

```yaml
env:
  - name: DATABRICKS_EMBEDDING_ENDPOINT
    value: "databricks-gte-large-en"
```

### 3. Embedding helper

Create `server/lib/embeddings.ts`:

`server/lib/embeddings.ts`:

```typescript
import { getWorkspaceClient } from "@databricks/appkit";

const workspaceClient = getWorkspaceClient({});

export async function generateEmbedding(text: string): Promise<number[]> {
  const endpoint =
    process.env.DATABRICKS_EMBEDDING_ENDPOINT || "databricks-gte-large-en";
  const result = await workspaceClient.servingEndpoints.query({
    name: endpoint,
    input: text,
  });
  return result.data![0].embedding!;
}
```

No additional dependencies — uses `@databricks/appkit` already in your project.

### 4. Verify

```bash
databricks serving-endpoints query <embedding-endpoint> \
  --json '{"input": "Hello, world!"}' \
  --profile <PROFILE>
```

Response includes a `data` array with `embedding` (float array).

#### References

- [Query embedding models](https://docs.databricks.com/aws/en/machine-learning/model-serving/query-embedding-models)
