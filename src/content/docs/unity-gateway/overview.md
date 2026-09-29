---
title: Unity Gateway
sidebar_label: Overview
description: Call governed LLM endpoints from your AppKit app using the Model Serving plugin. Unity Gateway adds rate limits, usage tracking, guardrails, and cost attribution.
sourceOfTruth:
  skills:
    - databricks-model-serving
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/ai-gateway/ai-governance
  note: "databricks-model-serving covers the serving-endpoint call path and Unity Gateway rate limits. Full Unity Gateway governance, model services, and MCP governance are docs-only (no skill yet)."
---

# Unity Gateway

Adding an LLM feature to your app (chat, summarization, an agent) normally means signing up with a model provider, putting an API key in your app, and building your own rate limiting and cost tracking. **Unity Gateway** (formerly Unity AI Gateway) removes that: your app calls a governed model endpoint by name, and Databricks applies rate limits, guardrails, usage tracking, and cost controls centrally. You build the feature; the platform governs the traffic.

From your AppKit app, you call a governed endpoint with the Model Serving plugin. This page covers the AppKit wiring and the CLI for inspecting and provisioning endpoints. For a full product introduction, see the [Unity Gateway overview](https://docs.databricks.com/aws/en/ai-gateway/).

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A serving endpoint your app can query. Most workspaces come with Databricks-hosted foundation models (prefixed `databricks-`, for example `databricks-claude-sonnet-4-6`) preconfigured with Unity Gateway. Model IDs change over time, so check the [supported models](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models) list for current names, or run [List available endpoints](#list-available-endpoints) to see what your workspace exposes.

## Call a governed endpoint from AppKit

The [Model Serving plugin](/docs/appkit/v0/plugins/model-serving) handles the HTTP plumbing, auth, and streaming. Endpoint names come from environment variables at runtime, so the same code runs locally and in production.

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

### Query a model service

A **model service** is a Unity Catalog model API, such as `system.ai.claude-sonnet-4-5`, queried by fully qualified name. The Model Serving plugin can't call one, so point the OpenAI SDK at the gateway's OpenAI-compatible endpoint, or send a raw request, forwarding the signed-in user's token. Both transports hit the same endpoint:

```typescript title="server/server.ts" tab="OpenAI SDK"
import OpenAI from "openai";

AppKit.server.extend((app) => {
  app.post("/api/ask", async (req, res) => {
    const rawToken = req.headers["x-forwarded-access-token"];
    const userToken = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (!userToken) {
      res
        .status(401)
        .json({ error: "User authorization (OBO) is not enabled" });
      return;
    }
    // Normalize DATABRICKS_HOST to an absolute URL (prepend a scheme if missing).
    const host = process.env.DATABRICKS_HOST ?? "";
    const baseUrl = host.startsWith("http") ? host : `https://${host}`;
    const client = new OpenAI({
      baseURL: `${baseUrl}/ai-gateway/mlflow/v1`,
      apiKey: userToken,
    });
    try {
      // The SDK retries a rate-limited request (HTTP 429) automatically.
      const completion = await client.chat.completions.create({
        model: "system.ai.claude-sonnet-4-5", // fully qualified UC name
        messages: [{ role: "user", content: req.body.prompt }],
        max_tokens: 256,
      });
      res.json(completion);
    } catch (err) {
      // The SDK throws on a non-2xx response (a missing ai-gateway scope is a 403).
      const status = (err as { status?: number }).status ?? 500;
      res
        .status(status)
        .json({ error: err instanceof Error ? err.message : String(err) });
    }
  });
});
```

```typescript title="server/server.ts" tab="Raw fetch"
AppKit.server.extend((app) => {
  app.post("/api/ask", async (req, res) => {
    const rawToken = req.headers["x-forwarded-access-token"];
    const userToken = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    if (!userToken) {
      res
        .status(401)
        .json({ error: "User authorization (OBO) is not enabled" });
      return;
    }
    // Normalize DATABRICKS_HOST to an absolute URL (prepend a scheme if missing);
    // production code should fail fast if it is unset.
    const host = process.env.DATABRICKS_HOST ?? "";
    const baseUrl = host.startsWith("http") ? host : `https://${host}`;
    const url = `${baseUrl}/ai-gateway/mlflow/v1/chat/completions`;
    // Minimal example: production code should validate req.body.prompt first.
    const init = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "system.ai.claude-sonnet-4-5", // fully qualified UC name
        messages: [{ role: "user", content: req.body.prompt }],
        max_tokens: 256,
      }),
    };
    // No SDK, so retry HTTP 429 yourself, honoring Retry-After. Production code
    // should also pass an AbortSignal to fetch to bound the request.
    let resp = await fetch(url, init);
    for (let attempt = 0; resp.status === 429 && attempt < 2; attempt++) {
      const retryAfter = Number(resp.headers.get("retry-after"));
      const delay = Math.min(retryAfter > 0 ? retryAfter : 2 ** attempt, 5);
      await new Promise((r) => setTimeout(r, delay * 1000));
      resp = await fetch(url, init);
    }
    // Forward the upstream content type: gateway errors are often HTML or text.
    res
      .status(resp.status)
      .type(resp.headers.get("content-type") ?? "application/json")
      .send(await resp.text());
  });
});
```

- **Scope:** this needs the `ai-gateway` scope in `user_api_scopes` (separate from `model-serving`); without it the gateway returns a 403. See [App configuration](/docs/apps/configuration#auth-model).
- **Rate limits:** the OpenAI SDK retries a 429 for you; the raw path has to run that retry loop itself, as shown above.
- **Availability:** `system.ai.*` models aren't in every workspace (region, Unity Catalog, and entitlement all apply), so a name in `system.ai` isn't a guarantee. The **Unity Gateway UI** shows which ones you can actually query; `system.ai` and Catalog Explorer list them globally. See [model services](https://docs.databricks.com/aws/en/ai-gateway/model-services) and [Query model services](https://docs.databricks.com/aws/en/ai-gateway/query-model-services).

## Governance and Unity Gateway

Governance is enforced on Databricks, not in AppKit. Your app calls the endpoint and the gateway applies the policy. Unity Gateway is the control plane for AI traffic. It routes model and MCP requests and enforces rate limits, cost controls, service policies, and usage tracking. Unity Catalog governs the models, MCP servers, and functions behind it. For the current features and setup, including the beta features you enable from the account console Previews page, see [AI governance with Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/ai-governance).

For AppKit, the Model Serving plugin calls serving endpoints by name. This includes foundation models (the `databricks-` prefix), Knowledge Assistants, Supervisor Agents, and custom Python agents. The plugin does not call Unity Gateway model services; to call one from your app, see [Query a model service](#query-a-model-service).

These controls are configured on Databricks by platform or admin teams, not in your app, but requests through a governed endpoint are subject to whatever applies:

| Capability                  | What it governs                                                                                        | Learn more                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model services**          | Governed LLM endpoints as Unity Catalog objects, over a Databricks or external model                   | [Overview](https://docs.databricks.com/aws/en/ai-gateway/model-services), [create](https://docs.databricks.com/aws/en/ai-gateway/create-model-services), [govern](https://docs.databricks.com/aws/en/ai-gateway/govern-model-services), [query](https://docs.databricks.com/aws/en/ai-gateway/query-model-services) |
| **Model-provider services** | External model providers registered for governed, discoverable access                                  | [Overview](https://docs.databricks.com/aws/en/ai-gateway/model-provider-services), [govern](https://docs.databricks.com/aws/en/ai-gateway/govern-model-provider-services)                                                                                                                                           |
| **Rate limits**             | Per-service and per-user request and token quotas on model and MCP services (HTTP 429 over limit)      | [Rate limits](https://docs.databricks.com/aws/en/ai-gateway/rate-limits)                                                                                                                                                                                                                                            |
| **Usage tracking**          | Per-request logging to the `system.ai_gateway.usage` system table, for dashboards and cost analysis    | [Usage tracking](https://docs.databricks.com/aws/en/ai-gateway/usage-tracking)                                                                                                                                                                                                                                      |
| **Budgets**                 | Spend thresholds, shared or per user, that send an alert or block requests; backs `--budget-policy-id` | [Budgets](https://docs.databricks.com/aws/en/ai-gateway/budgets)                                                                                                                                                                                                                                                    |
| **MCP server governance**   | Applies when an agent endpoint you call routes to an MCP server internally                             | [Register](https://docs.databricks.com/aws/en/ai-gateway/register-mcp-service), [govern](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service)                                                                                                                                                          |

For the earlier per-endpoint approach, see [Governance for model serving endpoints (legacy)](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints), where you toggle features per endpoint and usage logs to `system.serving.endpoint_usage`.

## List available endpoints

Use the CLI to see which endpoints your workspace exposes and which ones already have Unity Gateway features configured. Each command below shows a common invocation and its full set of flags. Run `databricks serving-endpoints <command> --help` for current flag behavior, since the CLI is the source of truth.

```bash title="Common"
databricks serving-endpoints list -o json
```

```bash title="All Options"
databricks serving-endpoints list \
  --limit $LIMIT \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Foundation Model API endpoints (prefixed `databricks-`) are available in most workspaces with Unity Gateway built in. For example, `databricks-claude-sonnet-4-6`. Availability varies by workspace.

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

<!-- cli-options:serving-endpoints list -->

| Option            | Description                              |
| ----------------- | ---------------------------------------- |
| `--limit`         | Maximum number of results to return.     |
| `--debug`         | enable debug logging                     |
| `--output`, `-o`  | output type: text or json (default text) |
| `--profile`, `-p` | ~/.databrickscfg profile                 |
| `--target`, `-t`  | bundle target to use (if applicable)     |

<!-- /cli-options -->

## Inspect an endpoint

```bash
databricks serving-endpoints get databricks-claude-sonnet-4-6 -o json
```

Check for `ai_gateway` in the response to confirm Unity Gateway is configured on the endpoint. `get` takes no command-specific flags beyond the global ones, so run `databricks serving-endpoints get --help` if you need them.

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
  --n 1 \
  --temperature 0.7 \
  --stream \
  --client-request-id $REQUEST_ID \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

<!-- cli-options:serving-endpoints query -->

| Option                | Description                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `--client-request-id` | Optional user-provided request identifier that will be recorded in the inference table and the usage tracking table.         |
| `--json`              | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes))                                   |
| `--max-tokens`        | The max tokens field used ONLY for **completions** and **chat external & foundation model** serving endpoints.               |
| `--n`                 | The n (number of candidates) field used ONLY for **completions** and **chat external & foundation model** serving endpoints. |
| `--stream`            | The stream field used ONLY for **completions** and **chat external & foundation model** serving endpoints.                   |
| `--temperature`       | The temperature field used ONLY for **completions** and **chat external & foundation model** serving endpoints.              |
| `--debug`             | enable debug logging                                                                                                         |
| `--output`, `-o`      | output type: text or json (default text)                                                                                     |
| `--profile`, `-p`     | ~/.databrickscfg profile                                                                                                     |
| `--target`, `-t`      | bundle target to use (if applicable)                                                                                         |

<!-- /cli-options -->

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
  --json @config.json \
  --budget-policy-id $BUDGET_POLICY_ID \
  --description "My model endpoint" \
  --route-optimized \
  --no-wait \
  --timeout 20m \
  --debug \
  -o json \
  --target $TARGET \
  --profile $DATABRICKS_PROFILE
```

Wait for the endpoint to reach `READY` state before querying it. For a step-by-step walkthrough, see the [Create a Model Serving Endpoint](/templates/model-serving-endpoint-creation) template.

<!-- cli-options:serving-endpoints create -->

| Option               | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `--budget-policy-id` | The budget policy to be applied to the serving endpoint.                                   |
| `--description`      |                                                                                            |
| `--json`             | either inline JSON string or @path/to/file.json with request body (default JSON (0 bytes)) |
| `--no-wait`          | do not wait to reach NOT_UPDATING state                                                    |
| `--route-optimized`  | Enable route optimization for the serving endpoint.                                        |
| `--timeout`          | maximum amount of time to reach NOT_UPDATING state (default 20m0s)                         |
| `--debug`            | enable debug logging                                                                       |
| `--output`, `-o`     | output type: text or json (default text)                                                   |
| `--profile`, `-p`    | ~/.databrickscfg profile                                                                   |
| `--target`, `-t`     | bundle target to use (if applicable)                                                       |

<!-- /cli-options -->

## Coding agent integrations

Unity Gateway can also govern AI coding tools like Claude Code, Codex, Cursor, and Gemini CLI, so their requests share one invoice, usage dashboard, and set of rate limits. Databricks recommends the [Unity Gateway CLI (`ug`)](https://github.com/databricks/unity-gateway), which installs, authenticates, and configures a supported agent with the gateway in one command (`uv tool install git+https://github.com/databricks/unity-gateway`, then `ug claude`, `ug codex`, and so on). The older `ucode` command still works, but `ug` is now the primary command. See [Integrate with coding agents](https://docs.databricks.com/aws/en/ai-gateway/coding-agent-integration-model-services) for the setup steps and the current list of supported tools.

## Where to next

Try the [AI Chat App](/templates/ai-chat-app) to wire a governed endpoint into your app, or see how agents use the gateway in [Agent Bricks](/docs/agents/overview): [Genie Agents](/docs/agents/genie) and [Custom agent endpoints](/docs/agents/custom-agents).
