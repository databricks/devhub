---
title: Custom agent endpoints
sidebar_label: Custom agents
description: Call a Knowledge Assistant, Supervisor Agent, or custom Python agent from your AppKit app. Wire any of them into the Model Serving plugin.
sourceOfTruth:
  skills:
    - databricks-agent-bricks
  docs:
    - /docs/appkit/v0/plugins/model-serving
    - https://docs.databricks.com/aws/en/agents/agent-bricks/
    - https://docs.databricks.com/aws/en/agents/custom-agents/author-agent
  note: "databricks-agent-bricks covers the Knowledge Assistant and Supervisor builders. Custom Python agent authoring is docs-only (no skill yet)."
---

# Custom agent endpoints

When your AppKit app needs more than a foundation model response or a Genie-style data query, you use a **custom agent**: an LLM shaped by instructions, tools, document grounding, or multi-agent orchestration. You can run one from AppKit in the following ways:

- **Run it inside your App** with the [`agents` plugin](/docs/appkit/v0/plugins/agents). You define the agent in code or markdown, or run a managed Supervisor through the Supervisor API adapter, with no separate endpoint to deploy. Start here for a new agent you build yourself.
- **Call an agent that is already a serving endpoint** with the [Model Serving plugin](/docs/appkit/v0/plugins/model-serving). Use this for a Knowledge Assistant, or any agent already deployed as a shared endpoint.

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- For the endpoint path below, an agent already deployed as a serving endpoint.

## Run an agent inside your App

The [`agents` plugin](/docs/appkit/v0/plugins/agents) hosts the agent in your App. You define it in markdown or code, wire in tools, and it serves at built-in routes, with no endpoint to provision. For a new custom or supervisor agent, start here.

For a Supervisor that coordinates Genie spaces, Unity Catalog functions, or other agents, the Supervisor API adapter runs the agent as a managed service on Databricks:

```typescript title="server/server.ts"
import { createApp } from "@databricks/appkit";
import {
  agents,
  createAgent,
  DatabricksAdapter,
} from "@databricks/appkit/beta";

await createApp({
  plugins: [
    agents({
      agents: {
        assistant: createAgent({
          instructions: "You are a helpful assistant.",
          model: DatabricksAdapter.fromSupervisorApi({
            model: "databricks-claude-sonnet-4-6",
          }),
        }),
      },
    }),
  ],
});
```

See the [`agents` plugin reference](/docs/appkit/v0/plugins/agents) for markdown agents, tool scoping, sub-agents, and hosted Supervisor tools.

## Call an existing agent endpoint

Some agents are reached as a Model Serving endpoint instead of running in-app. A Knowledge Assistant always is, and a Supervisor Agent or custom Python agent can be. The Model Serving plugin calls any of them by name, like a foundation model. These are the builders that produce such an endpoint:

| Builder             | Use when                                                                       | Set up                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge Assistant | Q&A over your documents, with citations                                        | [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant) (workspace UI)                                                                                                                      |
| Supervisor Agent    | Coordinate Genie Agents, other agents, Unity Catalog functions, or MCP servers | [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor) (workspace UI), or the [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) to build one in code |
| Custom Python agent | Nothing else fits: your own orchestration, tools, or framework                 | [Author an agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) in Python                                                                                                                                     |

The Knowledge Assistant and Supervisor Agent builders are click-through in the workspace. You can also create them from your coding agent with the [`databricks-agent-bricks`](/docs/tools/ai-tools/agent-skills) agent skill. The [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) defines a Supervisor Agent in Python, for teams that prefer code over the workspace UI.

Deploying a custom agent to its own Model Serving endpoint with `agents.deploy()` is a legacy path. Prefer running it in-app (above), or see [Author an agent](https://docs.databricks.com/aws/en/agents/custom-agents/author-agent) and [Migrate to Databricks Apps](https://docs.databricks.com/aws/en/agents/custom-agents/migrate-agent-to-apps).

## Wire it up

The Model Serving plugin calls agent endpoints the same way it calls foundation model endpoints. Point the plugin at your agent's env var:

```typescript title="server/server.ts"
serving({
  endpoints: {
    assistant: { env: "DATABRICKS_AGENT_ENDPOINT" },
  },
}),
```

Bind the env var to a `serving-endpoint` resource in `app.yaml`:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_AGENT_ENDPOINT
    valueFrom: serving-endpoint
```

When you add the agent endpoint as an app resource (Databricks Apps UI or CLI), Databricks grants your app's service principal `CAN QUERY` on the endpoint.

For the full wiring pattern, including `createApp`, `useServingStream`, and custom route handlers, see [Call a governed endpoint from AppKit](/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit).

## What the response looks like

Streaming responses arrive as `useServingStream` chunks. Non-streaming calls return the complete object from `useServingInvoke`. The request shape is usually OpenAI Chat Completions-compatible (`messages`, `max_tokens`, optional `stream`). Endpoints built on `ResponsesAgent` use the OpenAI Responses API instead (`input` in place of `messages`).

The response shape depends on the builder, so look it up rather than guess:

1. Open your agent endpoint in the workspace and click **Open in Playground**.
2. Click **Get code** and pick **Curl API** or **Python API**.
3. Run the example and inspect the response to see the exact fields.

## Per-user permissions

Serving routes in AppKit run on behalf of the authenticated user by default. If the agent hits user-scoped data (for example a Supervisor Agent that routes to a Genie Agent the user can query), the user only sees the data they're allowed to see. No extra auth code.

For server logic outside the built-in plugin routes (for example, custom Express routes), call `AppKit.serving("assistant").asUser(req).invoke(...)` to keep per-user behavior. For background work without a request (scheduled tasks, workers), omit `asUser` and the call runs as the app's service principal.

## Where to next

Try the [AI Chat App](/templates/ai-chat-app) for a complete AppKit and agent setup, or browse the [templates catalog](/templates) for more patterns.
