---
title: AI Gateway
---

# AI Gateway

AI Gateway is a governance and monitoring layer for model serving endpoints. It provides centralized control over permissions, rate limits, usage tracking, payload logging, and AI guardrails.

## List available endpoints

```bash
databricks serving-endpoints list --profile <PROFILE>
```

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

```bash
databricks serving-endpoints get <endpoint-name> -o json --profile <PROFILE>
```

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

```bash
databricks serving-endpoints query <endpoint-name> \
  --json '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}' \
  --profile <PROFILE>
```

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

```bash
databricks serving-endpoints create <endpoint-name> \
  --json '{
    "config": {
      "served_entities": [
        {
          "name": "<entity-name>",
          "entity_name": "<foundation-model-or-registered-model>",
          "workload_size": "Small",
          "scale_to_zero_enabled": true
        }
      ]
    }
  }' \
  --profile <PROFILE>
```

Wait for the endpoint to reach READY state:

```bash
databricks serving-endpoints get <endpoint-name> -o json --profile <PROFILE>
```

## Governance features

AI Gateway features vary by endpoint type. Configure them in the Serving UI or via the REST API (`PUT /api/2.0/serving-endpoints/{name}/ai-gateway`).

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

See the [Streaming AI Chat recipe](/resources/ai-chat-app-template#streaming-ai-chat-with-model-serving) for the full implementation with auth helpers.

## Coding agent integrations (Beta)

AI Gateway provides a unified invoice, usage dashboard, and governance for AI coding tools. Supported tools: Claude Code, Cursor, Codex CLI, Cline, Gemini CLI, and Goose.

To set up an integration, go to **AI Gateway** in your workspace sidebar and open the **Coding agents** section. A setup wizard walks you through configuring each tool, including generating an API key (PAT).

See [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta) for additional details.

## Related recipes

| Recipe                                                                                                        | Description                              |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [Query AI Gateway Endpoints](/resources/ai-chat-app-template#query-ai-gateway-endpoints)                      | Access foundation models with AppKit SDK |
| [Streaming AI Chat](/resources/ai-chat-app-template#streaming-ai-chat-with-model-serving)                     | Streaming chat with Vercel AI SDK        |
| [Create a Model Serving Endpoint](/resources/ai-chat-app-template#create-a-databricks-model-serving-endpoint) | Provision and test a new endpoint        |

## Source of truth

- [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/)
- [AI Gateway for serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
- [Configure AI Gateway on serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints)
- [Integrate with coding agents (Beta)](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-beta)
