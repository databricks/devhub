---
title: AI Gateway
sidebar_label: AI Gateway
description: Call governed LLM endpoints from your AppKit app using the Model Serving plugin. AI Gateway adds rate limits, usage tracking, guardrails, and cost attribution.
---

# AI Gateway

**AI Gateway** is a Databricks governance layer for LLM endpoints and MCP servers. It tracks usage, enforces rate limits, logs payloads, filters unsafe content and PII, and attributes cost. From your AppKit app, you call a governed endpoint with the Model Serving plugin. This page covers the AppKit wiring, the governance features, and the CLI for inspecting and provisioning endpoints.

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A serving endpoint your app can query. Most workspaces come with Databricks-hosted [foundation models](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/) (prefixed `databricks-`, for example `databricks-claude-sonnet-4-6`) preconfigured with AI Gateway. See [List available endpoints](#list-available-endpoints) to confirm.

## Call a governed endpoint from AppKit

The [Model Serving plugin](/docs/appkit/v0/plugins/serving) handles the HTTP plumbing, auth, and streaming. Endpoint names come from environment variables at runtime, so the same code runs locally and in production.

### Register the plugin

```typescript title="server/server.ts"
import { createApp, server, serving } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [
    server(),
    serving({
      endpoints: {
        chat: { env: "DATABRICKS_SERVING_ENDPOINT_NAME" },
      },
    }),
  ],
});
```

`chat` is an alias you pick. The plugin resolves it at request time by reading `DATABRICKS_SERVING_ENDPOINT_NAME`. Bind the env var in `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_SERVING_ENDPOINT_NAME
    valueFrom: serving-endpoint
```

When you deploy, Databricks Apps injects the endpoint name into the container. For local dev, set the env var in `.env`.

### Stream from a React component

```tsx title="client/src/ChatPanel.tsx"
import { useState } from "react";
import { useServingStream } from "@databricks/appkit-ui/react";

export function ChatPanel() {
  const [prompt, setPrompt] = useState("");
  const { stream, chunks, streaming, error, reset } = useServingStream(
    { messages: [{ role: "user", content: prompt }], max_tokens: 500 },
    { alias: "chat" },
  );

  return (
    <>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={() => stream()} disabled={streaming || !prompt}>
        Send
      </button>
      <button onClick={reset}>Clear</button>
      {chunks.map((chunk, i) => (
        <pre key={i}>{JSON.stringify(chunk)}</pre>
      ))}
      {error && <p>{error}</p>}
    </>
  );
}
```

The first argument is the request body. The second holds options, including the alias. The hook manages the SSE connection, aborts on unmount, and accumulates parsed chunks into state. For a non-streaming call, use `useServingInvoke` with the same shape.

For chat models, extract text from each chunk (typically `chunk.choices?.[0]?.delta?.content`) and concatenate for display. During development, rendering raw chunks as JSON confirms the shape before you build your display logic.

### Call it from a route handler

For agent orchestration, pre/post-processing, or logging on the backend, call the plugin directly. The plugin's built-in HTTP routes run as the authenticated user by default. In a custom route handler like this one, call `.asUser(req)` explicitly to get the same per-user behavior.

```typescript title="server/server.ts"
AppKit.server.extend((app) => {
  app.post("/api/summarize", async (req, res) => {
    const { text } = req.body;
    const result = await AppKit.serving("chat")
      .asUser(req)
      .invoke({
        messages: [
          { role: "system", content: "Summarize the text in two sentences." },
          { role: "user", content: text },
        ],
      });
    res.json(result);
  });
});
```

### Named versus default mode

The examples above use **named mode** with an explicit alias. Omit the config to register a `default` alias backed by `DATABRICKS_SERVING_ENDPOINT_NAME`. Named mode scales to multiple endpoints (chat, classifier, embeddings) in the same app.

## Two AI Gateway surfaces

:::note[Two surfaces, one plugin]

You might see AI Gateway in two places in your workspace:

- **Classic**: features toggled on an existing Model Serving endpoint. Usage logs to `system.serving.endpoint_usage`. The Model Serving plugin calls these endpoints directly.
- **Beta standalone**: a separate product with its own endpoints under the **LLMs** tab of the AI Gateway UI. Usage logs to `system.ai_gateway.usage`. The Model Serving plugin doesn't call these directly. For Databricks-hosted Beta endpoints, click **View legacy endpoint** in the workspace UI to get the underlying Model Serving endpoint name, then point the plugin at that.

- [AI Gateway landing](https://docs.databricks.com/aws/en/ai-gateway/)
- [AI Gateway for LLM endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-beta)
- [Configure AI Gateway on model serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints)

:::

## Governance features

AI Gateway features vary by endpoint type. Configure them in the workspace UI or through the REST API (`PUT /api/2.0/serving-endpoints/{name}/ai-gateway`).

| Feature               | What it does                                                         |
| --------------------- | -------------------------------------------------------------------- |
| **Usage tracking**    | Records request and token counts to `system.serving.endpoint_usage`  |
| **Payload logging**   | Logs request and response payloads to Unity Catalog inference tables |
| **Rate limits**       | QPM and TPM limits per user, group, or service principal             |
| **AI Guardrails**     | Safety filters (Llama Guard) and PII detection (Presidio)            |
| **Fallbacks**         | Route to backup endpoints on failure                                 |
| **Traffic splitting** | Split traffic across multiple served entities                        |

See [Configure AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints) for the full configuration guide. For the newer standalone experience, see [AI Gateway for LLM endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-beta).

AI Gateway also governs MCP server access. AppKit apps don't configure this directly. It applies when an agent endpoint you call (for example ABMAS or a custom Python agent) routes to an MCP server internally. See [custom agent endpoints](/docs/agents/custom-agents).

## List available endpoints

Use the CLI to see which endpoints your workspace exposes and which ones already have AI Gateway features configured.

```bash title="Common"
databricks serving-endpoints list -o json
```

```bash title="All Options"
databricks serving-endpoints list \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option      | Required | Description                          |
| ----------- | -------- | ------------------------------------ |
| `--debug`   | no       | Enable debug logging                 |
| `-o json`   | no       | Output as JSON (default: text)       |
| `--target`  | no       | Bundle target to use (if applicable) |
| `--profile` | no       | Databricks CLI profile name          |

</details>

Foundation Model API endpoints (prefixed `databricks-`) are available in most workspaces with AI Gateway built in. For example, `databricks-claude-sonnet-4-6`. Availability varies by workspace.

<details>
<summary>Example output (truncated)</summary>

```json
[
  {
    "ai_gateway": {
      "usage_tracking_config": { "enabled": true }
    },
    "config": {
      "served_entities": [
        {
          "foundation_model": {
            "display_name": "Claude Sonnet 4.6",
            "name": "system.ai.databricks-claude-sonnet-4-6"
          },
          "name": "databricks-claude-sonnet-4-6"
        }
      ]
    },
    "name": "databricks-claude-sonnet-4-6",
    "state": { "config_update": "NOT_UPDATING", "ready": "READY" },
    "task": "llm/v1/chat"
  }
]
```

</details>

## Inspect an endpoint

```bash title="Common"
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

```bash title="All Options"
databricks serving-endpoints get $ENDPOINT_NAME \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option      | Required | Description                          |
| ----------- | -------- | ------------------------------------ |
| `NAME`      | yes      | Serving endpoint name                |
| `--debug`   | no       | Enable debug logging                 |
| `-o json`   | no       | Output as JSON (default: text)       |
| `--target`  | no       | Bundle target to use (if applicable) |
| `--profile` | no       | Databricks CLI profile name          |

</details>

Check for `ai_gateway` in the response to confirm AI Gateway is configured on the endpoint.

## Query from the terminal

Useful for smoke-testing an endpoint before wiring it into your app.

```bash title="Common"
databricks serving-endpoints query databricks-claude-sonnet-4-6 \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'
```

```bash title="All Options"
databricks serving-endpoints query $ENDPOINT_NAME \
  --json '{"messages": [{"role": "user", "content": "Hello"}]}' \
  --max-tokens 100 \
  --temperature 0.7 \
  --n 1 \
  --stream \
  --client-request-id $REQUEST_ID \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option                | Required | Description                                           |
| --------------------- | -------- | ----------------------------------------------------- |
| `NAME`                | yes      | Serving endpoint name                                 |
| `--json`              | no       | Inline JSON or `@path/to/file.json` with request body |
| `--max-tokens`        | no       | Max tokens for completions and chat endpoints         |
| `--temperature`       | no       | Sampling temperature                                  |
| `--n`                 | no       | Number of candidates to generate                      |
| `--stream`            | no       | Enable streaming responses                            |
| `--client-request-id` | no       | Request identifier for inference and usage tables     |
| `--debug`             | no       | Enable debug logging                                  |
| `-o json`             | no       | Output as JSON (default: text)                        |
| `--target`            | no       | Bundle target to use (if applicable)                  |
| `--profile`           | no       | Databricks CLI profile name                           |

</details>

## Provision an endpoint

```bash title="Common"
databricks serving-endpoints create my-model-endpoint \
  --json '{
    "config": {
      "served_entities": [
        {
          "name": "my-entity",
          "entity_name": "my-registered-model",
          "workload_size": "Small",
          "scale_to_zero_enabled": true
        }
      ]
    }
  }'
```

```bash title="All Options"
databricks serving-endpoints create $ENDPOINT_NAME \
  --json @$CONFIG_FILE \
  --route-optimized \
  --budget-policy-id $BUDGET_POLICY_ID \
  --description "$DESCRIPTION" \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<details>
<summary>Options</summary>

| Option               | Required | Description                                                  |
| -------------------- | -------- | ------------------------------------------------------------ |
| `NAME`               | yes      | Endpoint name (alphanumeric, dashes, underscores)            |
| `--json`             | yes      | Inline JSON or `@path/to/file.json` with endpoint config     |
| `--route-optimized`  | no       | Enable route optimization                                    |
| `--budget-policy-id` | no       | Budget policy to apply                                       |
| `--description`      | no       | Endpoint description                                         |
| `--no-wait`          | no       | Return immediately instead of waiting for NOT_UPDATING state |
| `--timeout`          | no       | Max time to wait for completion (default: 20m)               |
| `--debug`            | no       | Enable debug logging                                         |
| `-o json`            | no       | Output as JSON (default: text)                               |
| `--target`           | no       | Bundle target to use (if applicable)                         |
| `--profile`          | no       | Databricks CLI profile name                                  |

</details>

Wait for the endpoint to reach `READY` state before querying it.

## Coding agent integrations

AI Gateway can also govern AI coding tools. Route requests from Cursor, Codex CLI, and Gemini CLI through a Databricks AI Gateway endpoint to get one invoice, one usage dashboard, and one place to manage permissions and rate limits across your organization.

To set up an integration, open **AI Gateway** in your workspace sidebar, go to the **LLMs** tab, and open the **Coding agents** section. Follow the tool-specific instructions (base URL, API key, model provider).

See [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta) for the full walkthrough and the current list of supported tools.

## Related templates

| Template                                                                      | Description                           |
| ----------------------------------------------------------------------------- | ------------------------------------- |
| [Query AI Gateway Endpoints](/templates/foundation-models-api)                | Access foundation models from AppKit  |
| [Streaming AI Chat](/templates/ai-chat-model-serving)                         | Streaming chat with the Vercel AI SDK |
| [Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation) | Provision and test a new endpoint     |
| [AI Chat App](/templates/ai-chat-app)                                         | Streaming chat with history           |

## Further reading

- [AI Gateway landing](https://docs.databricks.com/aws/en/ai-gateway/)
- [AI Gateway for LLM endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-beta)
- [Configure AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints)
- [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta)
- [AppKit Model Serving plugin reference](/docs/appkit/v0/plugins/serving)
- [AppKit execution context](/docs/appkit/v0/plugins/execution-context)
