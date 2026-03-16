---
title: Core Concepts
---

# Agents Core Concepts

Use these concepts to design agents that are reliable, governable, and debuggable in production.

## Agent

An agent is an LLM-driven runtime that can plan and call tools, then return structured output to a client.

## Runtime model

For new workloads, Databricks recommends deploying agent applications on Databricks Apps for full code and server control.

## Tooling surface

Agents can call Databricks-native resources and MCP tools. Tool discovery should be dynamic rather than hardcoded.

## Governance boundary

Permissions and identity controls determine what data and actions an agent can access. Treat these controls as part of the agent contract.

A practical contract includes:

- allowed tools/resources
- expected output format
- fallback behavior when permissions or tools fail

## Evaluation and tracing

Agent quality is not only answer accuracy; it includes tool choice, latency, cost, and safety. Use tracing and evaluation loops from day one.
