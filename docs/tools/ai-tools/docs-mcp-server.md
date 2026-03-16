---
title: Docs MCP Server
---

# Docs MCP Server

Use MCP to connect agents to Databricks-managed, external, or custom tool servers with dynamic tool discovery.

## What MCP gives you

- standard protocol for exposing tools/resources to LLM agents
- dynamic tool listing instead of hardcoded integrations
- reusable patterns across IDE assistants and runtime agents

## Databricks MCP modes

- **Managed MCP**: preconfigured Databricks-backed servers.
- **External MCP**: connect servers hosted outside Databricks.
- **Custom MCP**: host your own MCP server as a Databricks App.

## Recommended usage patterns

- let the LLM choose tools based on descriptions
- avoid hardcoding tool names in prompts or code
- avoid strict parsing assumptions for tool output formats

## Basic validation flow

After configuring MCP in your agent/IDE runtime:

- confirm the server appears in tool listings
- run one read-only tool call
- verify the response is consumable by your prompt/application flow
- then enable write/action tools only where needed by policy

## Source of truth

- [Model Context Protocol (MCP) on Databricks](https://docs.databricks.com/aws/en/generative-ai/mcp)
- [Use Databricks managed MCP servers](https://docs.databricks.com/aws/en/generative-ai/mcp/managed-mcp)
