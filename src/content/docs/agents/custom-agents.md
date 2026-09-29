---
title: Custom agent endpoints
sidebar_label: Custom agents
description: Host a custom agent in your AppKit app with the agents plugin, backed by a Model Serving endpoint or the AI Gateway. Stream it with useAgentChat.
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0/plugins/agents
    - /docs/appkit/v0/plugins/execution-context
    - https://docs.databricks.com/aws/en/agents/
    - https://docs.databricks.com/aws/en/agents/custom-agents/author-agent
  note: "databricks-agent-bricks covers the Knowledge Assistant and Supervisor builders. Custom Python agent authoring is docs-only (no skill yet). AppKit plugin behavior (agents, adapters) is verified against the installed @databricks/appkit and the reference app, not the TypeDoc plugin pages."
---

# Custom agent endpoints

When your AppKit app needs more than a foundation model response or a Genie-style data query, you use a **custom agent**: an LLM shaped by instructions, tools, document grounding, or multi-agent orchestration. You run one from AppKit with the [`agents` plugin](/docs/appkit/v0/plugins/agents), which hosts the agent in your App and serves it at built-in routes, with no separate endpoint to provision.

The agent's model comes from a **model adapter**: `DatabricksAdapter.fromModelServing` for a Model Serving endpoint (a foundation model, or an agent already deployed as an endpoint such as a Knowledge Assistant), or `DatabricksAdapter.fromAiGateway` for a model service through the gateway.

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).

## Define the agent

Each agent is a folder under `server/agents/<id>/`, where the folder name is the agent id. Its `agent.ts` default-exports a created agent; the plugin discovers them at startup, so there is no map to maintain.

```typescript title="server/agents/assistant/agent.ts"
import { createAgent, DatabricksAdapter } from "@databricks/appkit/beta";

// The model adapter is async, so resolve it before the export.
const model = await DatabricksAdapter.fromModelServing(
  "databricks-claude-sonnet-4-6",
);

export default createAgent({
  instructions: "You are a helpful assistant.",
  model,
});
```

Register the plugin with no arguments; it discovers `server/agents/*/agent.ts`:

```typescript title="server/server.ts"
import { createApp } from "@databricks/appkit";
import { agents } from "@databricks/appkit/beta";

await createApp({ plugins: [agents()] });
```

For a production build, list `server/agents/*/agent.ts` as build entries (for example in `tsdown`) so the compiled `dist/agents/<id>/agent.js` is emitted for discovery. Without it, the agent is absent from the deployed bundle and the plugin finds nothing.

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

> This replaces the Model Serving plugin (`serving()` + `useServingStream` / `useServingInvoke`), deprecated as of AppKit 0.77.0 in favor of the `agents` plugin. To call a foundation model or a deployed endpoint, point an agent's model adapter at it (`fromModelServing`) rather than registering the `serving` plugin. The identity model differs: the `serving()` routes ran on behalf of the signed-in user (OBO), while an agent's model call runs as the app service principal.

See the [`agents` plugin reference](/docs/appkit/v0/plugins/agents) for markdown agents, tool scoping, sub-agents, and server-side invocation (`runAgent`) from a custom route.

## Call an agent someone else built

A **Knowledge Assistant**, **Supervisor Agent**, or **custom Python agent** is created outside your app and deployed as a Model Serving endpoint. To call one, back an agent's model adapter with that endpoint name (`fromModelServing("<endpoint>")`), exactly as above. These are the builders that produce such an endpoint:

| Builder             | Use when                                                                       | Set up                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Knowledge Assistant | Q&A over your documents, with citations                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant) (workspace UI)                                                                                                                                                               |
| Supervisor Agent    | Coordinate Genie Agents, other agents, Unity Catalog functions, or MCP servers | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor) (workspace UI), or the [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) (deprecated, retires September 30, 2026) to build one in code |
| Custom Python agent | Nothing else fits: your own orchestration, tools, or framework                 | [Author an agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) in Python                                                                                                                                                                              |

The Knowledge Assistant and Supervisor Agent builders are click-through in the workspace. You can also create them from your coding agent with the [`databricks-agent-bricks`](/docs/tools/ai-tools/agent-skills) agent skill. When you add the endpoint as an app resource (Databricks Apps UI or CLI), Databricks grants your app's service principal `CAN QUERY` on it.

## Per-user permissions

The agent plugin's `/chat` route runs the model call as the app **service principal** by default (OBO for the model call is not yet wired). The **plugin tools an agent calls** (declared as `plugin:<name>`) do run on behalf of the signed-in user, so when an agent reaches user-scoped data through a plugin tool (for example an analytics or Genie tool), the user sees only what they're allowed to, with no extra auth code. See [execution context](/docs/appkit/v0/plugins/execution-context) for how AppKit resolves the identity, and [Authentication for agents](https://docs.databricks.com/aws/en/agents/custom-agents/agent-authentication) for how a deployed agent authenticates to other resources.

## Where to next

Try the [AI Chat App](/templates/ai-chat-app) for a complete AppKit and agent setup, or browse the [templates catalog](/templates) for more patterns.
