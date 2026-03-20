## Query AI Gateway Endpoints

Access Databricks foundation models through AI Gateway endpoints with built-in governance, monitoring, and production-readiness features.

### 1. Understand AI Gateway endpoints

**AI Gateway** is a governance layer on top of model serving endpoints that provides permissions, rate limiting, payload logging, and AI guardrails. Currently in beta, AI Gateway is becoming the default way to access foundation models in Databricks.

**Note**: AI Gateway is built into all Foundation Model API endpoints. If you need to access non-AI Gateway endpoints, use the Databricks SDK's `servingEndpoints.query()` method directly.

### 2. Check if AI Gateway is available

All Foundation Model API endpoints have AI Gateway built-in. To verify, check if a known FM endpoint has the `ai_gateway` configuration:

```bash
databricks serving-endpoints get <your-endpoint> --profile <PROFILE> --output json | grep -q '"ai_gateway"' && echo "✓ AI Gateway available" || echo "✗ No AI Gateway"
```

### 3. Choose your model

List available AI Gateway endpoints in your workspace:

```bash
databricks serving-endpoints list --profile <PROFILE>
```

Common AI Gateway endpoint names:

- `databricks-meta-llama-3-3-70b-instruct`
- `databricks-gemini-3-1-flash-lite`
- `databricks-dbrx-instruct`

> **Note**: When using this template with a coding agent, specify which endpoint to use based on what's available in your workspace. Endpoint names may vary.

> **Important**: Endpoint availability varies by workspace. Always run `databricks serving-endpoints list` to check what's available before configuring your app.

### 4. Configure environment variables

For local development (`.env`):

```bash
DATABRICKS_ENDPOINT=<your-endpoint>
```

For deployment (`app.yaml`):

```yaml
env:
  - name: DATABRICKS_ENDPOINT
    value: "<your-endpoint>"
```

### 5. Query AI Gateway endpoints

```typescript
import { getWorkspaceClient } from "@databricks/appkit";

// {} tells the SDK to use default auth chain (env vars / profile).
// Do NOT omit — getWorkspaceClient() with no argument will throw.
const workspaceClient = getWorkspaceClient({});
const endpoint = process.env.DATABRICKS_ENDPOINT || "<your-endpoint>";

async function queryModel(messages: any[]) {
  const result = await workspaceClient.servingEndpoints.query({
    name: endpoint,
    messages: messages,
    max_tokens: 1000,
  });

  return result;
}
```

**For streaming responses:** For OpenAI-compatible models, use the Vercel AI SDK's `createOpenAI` provider with AI Gateway:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const databricks = createOpenAI({
  baseURL: `https://${process.env.DATABRICKS_WORKSPACE_ID}.ai-gateway.cloud.databricks.com/mlflow/v1`,
  apiKey: token,
});

const result = streamText({
  model: databricks.chat(endpoint), // e.g., "databricks-gpt-5-4-mini"
  messages,
  maxOutputTokens: 1000,
});

// AI SDK v6: pipe the text stream to the Express response
result.pipeTextStreamToResponse(res);
```

> **Auth for streaming**: The streaming example above requires a bearer token for `createOpenAI()`. See the [Streaming AI Chat recipe](#streaming-ai-chat-with-model-serving) for the full auth helper pattern using `@databricks/sdk-experimental`.

> **Note**: This pattern works with OpenAI-compatible models (`databricks-gpt-5-4-mini`, `databricks-gpt-oss-120b`). Native Databricks models use the MLflow unified API.
>
> **Workspace ID**: AppKit auto-discovers this at runtime. For explicit setup, run `databricks api get /api/2.1/unity-catalog/current-metastore-assignment --profile <PROFILE>` and use the `workspace_id` field.

See the [Streaming AI Chat recipe](/resources/ai-chat-app-template#streaming-ai-chat-with-model-serving) for a complete implementation.

### 6. Test the endpoint

Query an AI Gateway endpoint:

```bash
databricks serving-endpoints query <your-endpoint> \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}' \
  --profile <PROFILE>
```

#### References

- [AI Gateway Overview](https://docs.databricks.com/aws/en/ai-gateway/overview-beta)
- [AI Gateway and Serving Endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) - For streaming implementations
