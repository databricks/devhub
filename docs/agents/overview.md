---
title: What is Agent Bricks?
sidebar_label: Overview
description: Call Agent Bricks endpoints and Genie spaces from your AppKit app with the Model Serving and Genie plugins. Per-user permissions, streaming, and cost attribution built in.
---

# What is Agent Bricks?

**Agent Bricks** is a Databricks toolkit for adding AI chatbots and agents to your apps. In your workspace UI, you configure what a chatbot should do: answer questions about your documents (Knowledge Assistant) or coordinate multiple data sources (Multi-Agent Supervisor). Databricks handles evaluation, tuning, and quality improvement from expert feedback, and hosts the agent at an HTTP endpoint your app can call.

Two related Databricks products appear throughout this section:

- **AI Gateway** governs LLM calls with rate limits, usage tracking, cost attribution, and content safety. It applies to any Model Serving endpoint your app calls, including Agent Bricks ones.
- **Genie spaces** provide a natural-language interface over Unity Catalog tables. They can plug into a Multi-Agent Supervisor as a subagent or stand alone.

Your AppKit app calls all three the same way: the [Model Serving plugin](/docs/appkit/v0/plugins/serving) (agents, foundation models, and governed endpoints) and the [Genie plugin](/docs/appkit/v0/plugins/genie) (Genie spaces).

## How it fits together

Agents on Databricks typically surface to your AppKit app as one of two resources: a **Model Serving endpoint** (a foundation model, Knowledge Assistant, Agent Bricks Multi-Agent Supervisor, or custom Python agent) or a **Genie space** (natural-language queries over Unity Catalog tables). The [Model Serving plugin](/docs/appkit/v0/plugins/serving) and [Genie plugin](/docs/appkit/v0/plugins/genie) cover both.

```mermaid
flowchart LR
    React["React<br/>(@databricks/appkit-ui/react)"] -->|"useServingStream /<br/>useGenieChat"| Node["AppKit server<br/>(@databricks/appkit)"]
    Node -->|"Model Serving plugin"| Endpoint["Model Serving endpoint<br/>(LLM, Knowledge Assistant,<br/>Supervisor Agent,<br/>custom Python)"]
    Node -->|"Genie plugin"| Space["Genie space"]
    Endpoint --> Gateway["AI Gateway<br/>(governance, rate limits,<br/>system tables)"]
    Space --> UC["Unity Catalog<br/>tables"]
```

## Two plugins, two resources

| You want to                                                                   | Use this plugin | Frontend helper                        |
| ----------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| Call a foundation model (LLM) with chat messages                              | `serving`       | `useServingStream`, `useServingInvoke` |
| Call an agent endpoint (Knowledge Assistant, Supervisor Agent, custom Python) | `serving`       | `useServingStream`, `useServingInvoke` |
| Give users natural-language queries over Unity Catalog tables                 | `genie`         | `GenieChat`, `useGenieChat`            |

Pick the plugin that matches the resource. No other primitive is required for the AI surface.

## Why AppKit instead of raw `fetch`

You could call a serving endpoint directly with `fetch` and a token. The plugin isn't doing something you can't do yourself. It's doing these things so you don't have to:

- **Per-user permissions for free.** Both the Model Serving plugin and Genie plugin routes run as the authenticated user by default. Your users only see endpoints and data they are already allowed to see. No OAuth code on your side. See [Execution context](/docs/appkit/v0/plugins/execution-context) for the details.
- **Streaming plumbing done.** SSE parsing, abort on unmount, token accumulation, error handling. `useServingStream` and `useGenieChat` handle these.
- **No secrets in the frontend.** The plugin proxies through your server. Tokens stay on the backend. No PAT in the React bundle.
- **Typed endpoint aliases.** If your serving endpoint publishes an OpenAPI schema, AppKit generates TypeScript types for request and response per alias. Autocomplete for chunk shapes, not `unknown`.

## Auth

Serving and Genie HTTP routes run on behalf of the authenticated user by default. If the user doesn't have `CAN QUERY` on the serving endpoint or `CAN RUN` on the Genie space, the call fails with a 403. You don't write the permission check.

For server logic outside a route handler, call `AppKit.serving("alias").asUser(req).invoke(...)` to keep the same behavior.

:::note[Authoring a custom agent]

Authoring a custom agent from scratch is a Python workflow: the `ResponsesAgent` interface, an agent framework (OpenAI Agents SDK, LangGraph, LlamaIndex), and MLflow for tracing. See [Create an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/create-agent) on docs.databricks.com for that track.

:::

## Pick a template to start from

Start from a template that matches your use case. Each one includes the Model Serving or Genie plugin wiring, an `app.yaml` resource binding, and a working UI you can adapt.

| You want to...                                     | Template                                                   |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Add a streaming chatbot to your app                | [AI Chat App](/templates/ai-chat-app)                      |
| Let users query tables in natural language         | [Genie Analytics App](/templates/genie-analytics-app)      |
| Add multi-space Genie switching to an existing app | [Genie Multi-Space Selector](/templates/genie-multi-space) |

## Where to next

- [AI Gateway](/docs/agents/ai-gateway) for calling foundation models or agent endpoints.
- [Genie spaces](/docs/agents/genie) for chat-with-your-data over Unity Catalog tables.
- [Custom agent endpoints](/docs/agents/custom-agents) for wiring Knowledge Assistant, Supervisor Agent, or your own Python agent.
