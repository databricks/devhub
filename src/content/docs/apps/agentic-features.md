---
title: Agentic features
sidebar_label: Agentic features
description: Add agentic features to your Databricks App with the AppKit agents plugin. Declare agents in your app's code, back them with a Model Serving endpoint or the AI Gateway, and stream them with useAgentChat.
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/agents
    - /docs/appkit/v0/plugins/execution-context
    - https://docs.databricks.com/aws/en/agents/
    - https://docs.databricks.com/aws/en/agents/custom-agents/agent-authentication
    - https://docs.databricks.com/aws/en/agents/legacy/
    - https://docs.databricks.com/aws/en/genie-agents/
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/model-serving
    - https://docs.databricks.com/aws/en/dev-tools/databricks-apps/unity-gateway
    - https://docs.databricks.com/aws/en/ai-gateway/migrate-to-unity-gateway
  note: "databricks-genie-agents covers Genie Agents, which replace the legacy Knowledge Assistant and Supervisor Agent (canonical agents/legacy). Code agents point to the Agent Bricks CLI (/docs/agents/cli). AppKit plugin behavior (agents, adapters, execution identity and the auth option) is verified against the published @databricks/appkit package source and its shipped plugin docs, not the TypeDoc plugin pages."
---

# Agentic features

When your AppKit app needs more than a foundation model response or a Genie-style data query, you add an **agent** to it: an LLM shaped by instructions, tools, document grounding, or multi-agent orchestration. You declare it with the [`agents` plugin](/docs/appkit/v0/plugins/agents), which runs the agent in your app's runtime and serves it at built-in routes, with no separate endpoint to provision. The agent works on the data your app already has access to, and users interact with it through your app's UI.

:::note[Building a standalone agent?]

These agents belong to the app: they deploy, scale, and share permissions with it. To build a standalone agent that deploys on its own, with an HTTP API your other apps and services call, use the [Agent Bricks CLI](/docs/agents/cli).

:::

The agent's model comes from a **model adapter**. For a foundation model, use `DatabricksAdapter.fromAiGateway` with a model service (for example `system.ai.claude-sonnet-4-6`), which you add to the app as an [AI Gateway model service resource](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/unity-gateway). The `databricks-` foundation model serving endpoints are marked Legacy in the [app resource picker](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/model-serving). Use `DatabricksAdapter.fromModelServing` for a Model Serving endpoint you already have, such as a custom model or an existing Knowledge Assistant.

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).

## Define the agent

Each agent is a folder under `server/agents/<id>/`, where the folder name is the agent id. Its `agent.ts` default-exports a created agent; the plugin discovers them at startup, so there is no map to maintain.

```typescript title="server/agents/assistant/agent.ts"
import { createAgent, DatabricksAdapter } from "@databricks/appkit/beta";

// The model adapter is async, so resolve it before the export.
const model = await DatabricksAdapter.fromAiGateway({
  model: "system.ai.claude-sonnet-4-6",
});

export default createAgent({
  instructions: "You are a helpful assistant.",
  model,
});
```

Add the model service to the app as a resource, which grants the app's service principal `EXECUTE` on it:

```yaml title="databricks.yml"
resources:
  apps:
    my-app:
      resources:
        - name: model
          uc_securable:
            securable_full_name: system.ai.claude-sonnet-4-6
            securable_type: MODEL_SERVICE
            permission: EXECUTE
```

Register the plugin with no arguments, next to the `server` plugin that serves its routes; it discovers `server/agents/*/agent.ts`:

```typescript title="server/server.ts"
import { createApp, server } from "@databricks/appkit";
import { agents } from "@databricks/appkit/beta";

await createApp({ plugins: [server(), agents()] });
```

The production build must emit `dist/agents/<id>/agent.js` for discovery. The `appkitServerConfig()` tsdown preset in current `apps init` templates includes `server/agents/` automatically; with a custom tsdown config, list `server/agents/*/agent.ts` as build entries, or the agent is absent from the deployed bundle. Once `dist/agents/` exists, the plugin reads it even in `pnpm run dev`, so rebuild after you add an agent.

> Earlier AppKit versions took an inline map, `agents({ agents: { assistant: createAgent(...) } })`. That form is deprecated as of AppKit 0.64.0 in favor of the file-based discovery above.

## Stream it from React

The `useAgentChat` hook streams a turn from the agent's built-in chat route:

```tsx title="client/src/Chat.tsx"
import { useState } from "react";
import { useAgentChat } from "@databricks/appkit-ui/react";

export function Chat() {
  const [prompt, setPrompt] = useState("");
  const { content, isStreaming, send, reset } = useAgentChat({
    agent: "assistant",
  });

  return (
    <>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button
        onClick={() => void send(prompt)}
        disabled={isStreaming || !prompt}
      >
        Send
      </button>
      <button onClick={reset}>Clear</button>
      <p>{content}</p>
    </>
  );
}
```

`content` accumulates the assistant's text as it streams. The agent stream yields OpenAI Responses-API-shaped events, so read text from `content` (and use the hook's `onEvent` for tool calls) rather than Chat Completions `choices`.

> This replaces the Model Serving plugin (`serving()` + `useServingStream` / `useServingInvoke`), deprecated as of AppKit 0.77.0 in favor of the `agents` plugin. To call a foundation model or a deployed endpoint, point an agent's model adapter at it (`fromAiGateway` or `fromModelServing`) rather than registering the `serving` plugin. The identity model differs: the `serving()` routes ran on behalf of the signed-in user (OBO), while an agent's model call runs as the app service principal by default. [Per-user permissions](#per-user-permissions) covers the option to run it as the user.

See the [`agents` plugin reference](/docs/appkit/v0/plugins/agents) for markdown agents, tool scoping, sub-agents, and server-side invocation (`runAgent`) from a custom route.

## Use an existing or externally built agent

For a new low-code agent over your documents and data, Databricks recommends a [Genie Agent](https://docs.databricks.com/aws/en/genie-agents/). Your app queries a Genie Agent with the [`genie` plugin](/docs/lakehouse/genie). For a new agent written in code, use the [Agent Bricks CLI](/docs/agents/cli). It deploys the agent as its own app, so your app calls its HTTP API (`<app-url>/api/invocations`, with an OAuth token) instead of a model adapter.

An existing Knowledge Assistant or Supervisor Agent is deployed as a Model Serving endpoint. Both are [legacy offerings](https://docs.databricks.com/aws/en/agents/legacy/), so don't build new ones. To call one, back an agent's model adapter with the endpoint name (`fromModelServing("<endpoint>")`), as above, provided the endpoint implements the chat-completions streaming protocol (Knowledge Assistants and chat-style endpoints do). Add the endpoint as an [app resource](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/model-serving) with **Can query**, which grants your app's service principal `CAN QUERY`.

## Per-user permissions

By default, an agent runs with mixed identity. The model call and hand-rolled `tool({ execute })` tools run as the app **service principal**. The **plugin tools an agent calls** (declared as `plugin:<name>`) run on behalf of the signed-in user, so when an agent reaches user-scoped data through a plugin tool (for example an analytics or Genie tool), the user sees only what they're allowed to, with no extra auth code.

To run the whole agent as the user, including the model call, set `auth: "on-behalf-of-user"` on the `agents()` plugin or on one agent. The model adapter must then resolve its client per call, or the app fails at startup:

```typescript title="server/agents/assistant/agent.ts"
import { getExecutionContext } from "@databricks/appkit";
import { createAgent, DatabricksAdapter } from "@databricks/appkit/beta";

const model = await DatabricksAdapter.fromAiGateway({
  model: "system.ai.claude-sonnet-4-6",
  workspaceClient: () => getExecutionContext().client,
});

export default createAgent({
  instructions: "You are a helpful assistant.",
  model,
  auth: "on-behalf-of-user",
});
```

A request without a user token is then rejected with a 401, with no fallback to the service principal. The user's token also needs the scope for the model call: `ai-gateway` in `user_api_scopes` for `fromAiGateway`, or `model-serving` for `fromModelServing`. Each user also needs [`EXECUTE` on the model service](https://docs.databricks.com/aws/en/ai-gateway/migrate-to-unity-gateway) (all account users have it by default on `system.ai` model services), or [`CAN QUERY` on the serving endpoint](https://docs.databricks.com/aws/en/security/auth/access-control/#serving-endpoints).

Anything that runs as the user needs user authorization enabled for the workspace and the matching scopes in the app's `user_api_scopes` ([Auth model](/docs/apps/configuration#auth-model)). See [execution context](/docs/appkit/v0/plugins/execution-context) for how AppKit resolves the identity, and [Authentication for agents](https://docs.databricks.com/aws/en/agents/custom-agents/agent-authentication) for how a deployed agent authenticates to other resources.

## Where to next

Try the [AI Chat App](/templates/ai-chat-app) for a complete AppKit and agent setup, or browse the [templates catalog](/templates) for more patterns.
