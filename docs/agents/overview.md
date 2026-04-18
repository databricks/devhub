---
title: What is an AI agent on Databricks?
sidebar_label: Overview
description: Databricks agents are LLM-driven apps that plan, use tools, and return structured output. Deployed as Databricks Apps with built-in tracing and model serving.
---

# What is an AI agent on Databricks?

An AI agent is an application where an LLM does the reasoning. Instead of writing all the logic yourself, you give the model a goal and a set of tools: functions it can call, APIs it can hit, databases it can query. The model decides which tools to use and in what order to accomplish the goal.

On Databricks, agents are Python applications deployed as Databricks Apps. They use hosted model endpoints for LLM inference, get automatic tracing for debugging and evaluation, and share the same auth and data access as any other App.

## Agent versus simple chat app

Use an agent when the response requires multiple steps, tool calls, or conditional logic. For example, to answer a support question, an agent queries Unity Catalog for relevant records, calls a model endpoint for reasoning, and returns a formatted response.

Use a simple LLM call when the response comes from the model's knowledge alone, with no data access or multistep logic needed.

## What you get out of the box

- **Any Python framework**: OpenAI Agents SDK, LangGraph, or your own. The platform requires implementing the `ResponsesAgent` interface, not a specific library.
- **Model serving**: connect to Databricks-hosted foundation models (Llama, Claude, and others) or bring your own endpoint through AI Gateway.
- **Automatic tracing**: MLflow traces every invocation without extra code. Evaluate quality, debug failures, and monitor production behavior.
- **Tool use and MCP**: give your agent Python functions it can call, or connect an MCP server for workspace-level tools including Unity Catalog, Vector Search, and Genie.

## How it fits together

- You deploy agents as **Databricks Apps**, using the same CLI and bundle workflow. The hosting, auth, and fixed URL behavior is identical.
- Agents access **Lakebase** for persistent memory such as chat history or user context.
- **AI Gateway** sits in front of model serving endpoints to add rate limits, usage tracking, payload logging, and content safety filtering.

## Next steps

To get started, see the [Quickstart](/docs/agents/quickstart), where you clone the agent template and deploy it to your workspace.
