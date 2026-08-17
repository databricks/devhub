---
title: Custom agent endpoints
sidebar_label: Custom agents
description: Call a Knowledge Assistant, Supervisor Agent, or custom Python agent from your AppKit app. Wire any of them into the Model Serving plugin.
---

# Custom agent endpoints

When your AppKit app needs more than a foundation model response or a Genie-style data query, you call a **custom agent**: an LLM shaped by instructions, tools, document grounding, or multi-agent orchestration. This page covers custom agents that your app reaches at a Model Serving endpoint, which the Model Serving plugin calls like any foundation model. If instead you want the agent to run inside your App, see the [agents plugin](/docs/appkit/v0/plugins/agents) (beta).

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A deployed agent endpoint.

## Three ways to get an endpoint

Three Databricks products produce agent endpoints. The table summarizes when to use each; subsections below link to the setup docs.

| Builder                                     | Use when                                                                                            | Setup                                                                                                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Knowledge Assistant](#knowledge-assistant) | You need Q&A over documents (PDFs, Markdown, Office files) with citations                           | Click-through UI in the workspace                                                                                                                                  |
| [Supervisor Agent](#supervisor-agent)       | You need to coordinate existing Genie Agents, other agents, Unity Catalog functions, or MCP servers | Click-through UI (produces a queryable agent endpoint)                                                                                                             |
| [Custom Python agent](#custom-python-agent) | No builder fits; you need arbitrary orchestration, custom tools, or a proprietary framework         | Write Python with `ResponsesAgent`, deploy to an endpoint via `agents.deploy()` (legacy path — prefer the [agents plugin](/docs/appkit/v0/plugins/agents) on Apps) |

### Knowledge Assistant

Turns a folder of documents (plain text, PDFs, Markdown, Office files in a Unity Catalog volume) or an AI Search (formerly Vector Search) index into a Q&A chatbot with source citations. Good for product docs, HR policies, support knowledge bases. Databricks builds and deploys the agent endpoint for you.

See [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant).

### Supervisor Agent

Coordinates subagents (Genie Agents, other agent endpoints, Unity Catalog functions, MCP servers) to complete a task, handling delegation and result synthesis. Good for workflows that span domains, for example searching research reports and querying usage data in the same conversation. Like Knowledge Assistant, the builder produces a single agent endpoint.

See [Supervisor Agent](https://docs.databricks.com/aws/en/agents/agent-bricks/multi-agent-supervisor). Query the agent endpoint the builder creates (Playground **Get code**). The [Supervisor API](https://docs.databricks.com/aws/en/agents/agent-bricks/supervisor-api) is a separate Beta product for building a custom agent loop programmatically — not an alternate setup path for Supervisor Agent.

### Custom Python agent

Author an agent in Python when neither builder covers your use case. The Databricks path is the `ResponsesAgent` interface plus a framework of your choice (OpenAI Agents SDK, LangGraph, LlamaIndex), with MLflow handling tracing. Databricks recommends deploying the agent on Databricks Apps; deploying to a Model Serving endpoint (via `agents.deploy()`) is a legacy path.

:::note[Prefer building the agent on Apps]

For an AppKit app, the recommended way to build a custom agent is the [agents plugin](/docs/appkit/v0/plugins/agents) (beta). The agent runs inside your App, so there's no separate serving endpoint to deploy or wire up.

This page covers a narrower case: calling a custom agent as an endpoint from a separate AppKit app. That requires a Model Serving endpoint, either a builder (Knowledge Assistant, Supervisor Agent) or a deployed Python agent. Reach for it only when the agent must be a shared endpoint that several apps call, not the app itself.

:::

Authoring is out of scope for this page. For the Python (non-AppKit) track, where a `ResponsesAgent` agent is deployed to Apps, see [Author an AI agent](https://docs.databricks.com/aws/en/agents/agent-framework/author-agent) and [Migrate from Model Serving to Apps](https://docs.databricks.com/aws/en/agents/agent-framework/migrate-agent-to-apps) on docs.databricks.com.

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

When you add the agent endpoint as an app resource (Databricks Apps UI or CLI) with **Can query** selected, Databricks grants your app's service principal `CAN QUERY` on the endpoint.

For the full wiring pattern, including `createApp`, `useServingStream`, and custom route handlers, see [Call a governed endpoint from AppKit](/docs/agents/ai-gateway#call-a-governed-endpoint-from-appkit).

## What the response looks like

If streaming, responses arrive as `useServingStream` chunks; if non-streaming, `useServingInvoke` returns the complete object. The request shape is typically OpenAI Chat Completions-compatible (`messages`, `max_tokens`, optional `stream`). Endpoints built on `ResponsesAgent` use the OpenAI Responses API (`input` instead of `messages`). The response shape depends on the builder. Rather than guess, look it up in Playground:

1. Open your agent endpoint in the workspace and click **Open in Playground**.
2. Click **Get code** and pick **Curl API** or **Python API**.
3. Run the example and inspect the response to see the exact fields.

Broad patterns to expect:

- **Knowledge Assistant**: text answers with source citations. The endpoint returns document references alongside the answer, ready to render as citations for verifiability. See [Knowledge Assistant](https://docs.databricks.com/aws/en/agents/agent-bricks/knowledge-assistant#query-the-agent-endpoint).
- **Supervisor Agent**: a synthesized answer drawn from whatever subagents the supervisor routed to (Genie Agents, Knowledge Assistants, Unity Catalog functions, MCP servers). The MLflow trace captures the full sequence of model calls and tool executions.
- **Custom Python agent**: whatever the author designed. Agents built on the `ResponsesAgent` interface use the OpenAI Responses API (`input` instead of `messages`).

## Per-user permissions

Serving routes in AppKit run on behalf of the authenticated user by default. If the agent hits user-scoped data (for example a Supervisor Agent that routes to a Genie Agent the user can query), the user only sees the data they're allowed to see. No extra auth code.

For server logic outside the built-in plugin routes (for example, custom Express routes), call `AppKit.serving("assistant").asUser(req).invoke(...)` to keep per-user behavior. For background work without a request (scheduled tasks, workers), omit `asUser` and the call runs as the app's service principal.

## Where to next

Try the [AI Chat App](/templates/ai-chat-app) for a complete AppKit and agent setup, or browse the [templates catalog](/templates) for more patterns.

To host the agent inside your App instead, see the [agents plugin](/docs/appkit/v0/plugins/agents) (beta).
