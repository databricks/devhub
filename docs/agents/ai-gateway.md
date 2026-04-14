---
title: Model serving and AI Gateway
sidebar_label: Model serving & AI Gateway
---

# Model serving and AI Gateway

Your agent calls a model serving endpoint. AI Gateway is the governance layer on that endpoint: it tracks usage, enforces rate limits, logs payloads, and blocks unsafe content (Llama Guard for safety, Presidio for PII). This page covers how to list endpoints, query them, and configure governance features.

:::note[When you need this]
Configure AI Gateway when you need rate limits, usage tracking, payload logging, or content safety. Calling a foundation model directly does not require it.
:::

## List available endpoints

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
  },
  {
    "config": {
      "served_entities": [
        {
          "entity_name": "my-registered-model",
          "name": "my-custom-endpoint",
          "workload_size": "Small"
        }
      ]
    },
    "name": "my-custom-endpoint",
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

<details>
<summary>Example output</summary>

```json
{
  "ai_gateway": {
    "usage_tracking_config": { "enabled": true }
  },
  "config": {
    "config_version": 1,
    "served_entities": [
      {
        "foundation_model": {
          "description": "Claude Sonnet 4.6 is a state-of-the-art, hybrid reasoning model...",
          "display_name": "Claude Sonnet 4.6",
          "docs": "https://docs.databricks.com/machine-learning/foundation-models/supported-models.html#claude-sonnet-4-6",
          "name": "system.ai.databricks-claude-sonnet-4-6"
        },
        "name": "databricks-claude-sonnet-4-6"
      }
    ]
  },
  "creation_timestamp": 1747872000000,
  "name": "databricks-claude-sonnet-4-6",
  "permission_level": "CAN_QUERY",
  "route_optimized": false,
  "state": {
    "config_update": "NOT_UPDATING",
    "ready": "READY"
  },
  "task": "llm/v1/chat"
}
```

</details>

## Query an endpoint

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
| `--client-request-id` | no       | Request identifier for inference/usage tables         |
| `--debug`             | no       | Enable debug logging                                  |
| `-o json`             | no       | Output as JSON (default: text)                        |
| `--target`            | no       | Bundle target to use (if applicable)                  |
| `--profile`           | no       | Databricks CLI profile name                           |

</details>

<details>
<summary>Example response</summary>

```json
{
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 9,
    "total_tokens": 17
  }
}
```

</details>

## Create a serving endpoint

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

Wait for the endpoint to reach READY state:

```bash title="Common"
databricks serving-endpoints get my-model-endpoint -o json
```

```bash title="All Options"
databricks serving-endpoints get $ENDPOINT_NAME \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

## Governance features

AI Gateway features vary by endpoint type. Configure them in the Serving UI or through the REST API (`PUT /api/2.0/serving-endpoints/{name}/ai-gateway`).

| Feature               | What it does                                                     |
| --------------------- | ---------------------------------------------------------------- |
| **Usage tracking**    | Records request/token counts to `system.serving.endpoint_usage`  |
| **Payload logging**   | Logs request/response payloads to Unity Catalog inference tables |
| **Rate limits**       | QPM/TPM limits per user, group, or service principal             |
| **AI Guardrails**     | Safety filters (Llama Guard) and PII detection (Presidio)        |
| **Fallbacks**         | Route to backup endpoints on failure                             |
| **Traffic splitting** | Split traffic across multiple served entities                    |

See [Configure AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints) for the full configuration guide.

## Using AI Gateway in AppKit apps

For AppKit-based apps, query endpoints through the Databricks SDK:

```typescript
import { getWorkspaceClient } from "@databricks/appkit";

const workspaceClient = getWorkspaceClient({});
const result = await workspaceClient.servingEndpoints.query({
  name: process.env.DATABRICKS_ENDPOINT || "<endpoint-name>",
  messages: [{ role: "user", content: "Hello" }],
  max_tokens: 1000,
});
```

For streaming responses with the Vercel AI SDK, use `createOpenAI` pointed at the AI Gateway URL:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const databricks = createOpenAI({
  baseURL: `https://${process.env.DATABRICKS_WORKSPACE_ID}.ai-gateway.cloud.databricks.com/mlflow/v1`,
  apiKey: token,
});

const result = streamText({
  model: databricks.chat("<endpoint-name>"),
  messages,
  maxOutputTokens: 1000,
});
```

See the [Streaming AI Chat recipe](/resources/ai-chat-app#streaming-ai-chat-with-model-serving) for the full implementation with auth helpers.

## Coding agent integrations (Beta)

AI Gateway provides a unified invoice, usage dashboard, and governance for AI coding tools. Supported tools: Claude Code, Cursor, Codex CLI, Cline, Gemini CLI, and Goose.

To set up an integration, go to **AI Gateway** in your workspace sidebar and open the **Coding agents** section. A setup wizard walks you through configuring each tool, including generating an API key (PAT).

See [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta) for additional details.

## Related guides

| Guide                                                                         | Description                              |
| ----------------------------------------------------------------------------- | ---------------------------------------- |
| [Query AI Gateway Endpoints](/resources/foundation-models-api)                | Access foundation models with AppKit SDK |
| [Streaming AI Chat](/resources/ai-chat-model-serving)                         | Streaming chat with Vercel AI SDK        |
| [Create a Model Serving Endpoint](/resources/model-serving-endpoint-creation) | Provision and test a new endpoint        |

## Further reading

- [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/)
- [AI Gateway for serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
- [Configure AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints)
- [Integrate with coding agents (Beta)](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta)
