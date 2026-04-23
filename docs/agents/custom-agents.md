---
title: Custom agent endpoints
sidebar_label: Custom agents
description: Call a Knowledge Assistant, Supervisor Agent, or custom Python agent from your AppKit app. Same Model Serving plugin wiring for all three.
---

# Custom agent endpoints

When your AppKit app needs more than a foundation model response or a Genie-style data query, you call a **custom agent**: an LLM shaped by instructions, tools, document grounding, or multi-agent orchestration. On Databricks, custom agents deploy as Model Serving endpoints, so the Model Serving plugin calls them like any foundation model.

## Prerequisites

- Databricks CLI `v0.296+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A deployed agent endpoint.

## Three ways to get an endpoint

Three Databricks products produce agent endpoints. The table summarizes when to use each; subsections below link to the setup docs.

| Builder                                                                     | Use when                                                                                            | Setup                                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [Knowledge Assistant](#knowledge-assistant)                                 | You need Q&A over documents (PDFs, Markdown, Office files) with citations                           | Click-through UI in the workspace                                |
| [Agent Bricks Multi-Agent Supervisor](#agent-bricks-multi-agent-supervisor) | You need to coordinate existing Genie spaces, other agents, Unity Catalog functions, or MCP servers | Click-through UI in the workspace                                |
| [Custom Python agent](#custom-python-agent)                                 | No builder fits; you need arbitrary orchestration, custom tools, or a proprietary framework         | Write Python with `ResponsesAgent`, deploy via `agents.deploy()` |

### Knowledge Assistant

Turns a folder of documents (plain text, PDFs, Markdown, Office files in a Unity Catalog volume) or a vector search index into a Q&A chatbot with source citations. Good for product docs, HR policies, support knowledge bases. Databricks builds and deploys the agent endpoint for you.

See [Knowledge Assistant](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/knowledge-assistant).

### Agent Bricks Multi-Agent Supervisor

Coordinates subagents (Genie spaces, other agent endpoints, Unity Catalog functions, MCP servers) to complete a task, handling delegation and result synthesis. Good for workflows that span domains, for example searching research reports and querying usage data in the same conversation. Like Knowledge Assistant, the builder produces a single agent endpoint.

See [Agent Bricks Multi-Agent Supervisor](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/multi-agent-supervisor).

### Custom Python agent

Author an agent in Python when neither builder covers your use case. The Databricks path is the `ResponsesAgent` interface plus a framework of your choice (OpenAI Agents SDK, LangGraph, LlamaIndex), with MLflow handling tracing. Agents deploy as Model Serving endpoints (via `agents.deploy()`) or as full Databricks Apps. The App-based path produces a standalone app, not an endpoint you'd call from another AppKit app.

See [Create an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/create-agent) on docs.databricks.com. Authoring is out of scope for this page.

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

If streaming, responses arrive as `useServingStream` chunks; if non-streaming, `useServingInvoke` returns the complete object. The request shape is typically OpenAI Chat Completions-compatible (`messages`, `max_tokens`, optional `stream`). Endpoints built on `ResponsesAgent` use the OpenAI Responses API (`input` instead of `messages`). The response shape depends on the builder. Rather than guess, look it up in Playground:

1. Open your agent endpoint in the workspace and click **Open in Playground**.
2. Click **Get code** and pick **Curl API** or **Python API**.
3. Run the example and inspect the response to see the exact fields.

Broad patterns to expect:

- **Knowledge Assistant**: text answers with source citations. The endpoint returns document references alongside the answer, ready to render as citations for verifiability. See [Knowledge Assistant](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/knowledge-assistant#query-the-agent-endpoint).
- **Agent Bricks Multi-Agent Supervisor**: a synthesized answer drawn from whatever subagents the supervisor routed to (Genie spaces, Knowledge Assistants, Unity Catalog functions, MCP servers). The MLflow trace captures the full sequence of model calls and tool executions.
- **Custom Python agent**: whatever the author designed. Agents built on the `ResponsesAgent` interface use the OpenAI Responses API (`input` instead of `messages`).

## Per-user permissions

Serving routes in AppKit run on behalf of the authenticated user by default. If the agent hits user-scoped data (for example a Supervisor Agent that routes to a Genie space the user can query), the user only sees the data they're allowed to see. No extra auth code.

For server logic outside the built-in plugin routes (for example, custom Express routes), call `AppKit.serving("assistant").asUser(req).invoke(...)` to keep per-user behavior. For background work without a request (scheduled tasks, workers), omit `asUser` and the call runs as the app's service principal.

## Related templates

| Template                                                       | Description                           |
| -------------------------------------------------------------- | ------------------------------------- |
| [Agentic Support Console](/templates/agentic-support-console)  | Full agent-driven support UI example  |
| [Query AI Gateway Endpoints](/templates/foundation-models-api) | Calling foundation models from AppKit |
| [Streaming AI Chat](/templates/ai-chat-model-serving)          | Streaming chat with the Vercel AI SDK |

## Further reading

- [Knowledge Assistant](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/knowledge-assistant)
- [Agent Bricks Multi-Agent Supervisor](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/multi-agent-supervisor)
- [Create an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/create-agent)
- [Supervisor API](https://docs.databricks.com/aws/en/generative-ai/agent-bricks/supervisor-api)
- [AppKit Model Serving plugin reference](/docs/appkit/v0/plugins/serving)
