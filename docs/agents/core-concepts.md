---
title: Core Concepts
---

# Core Concepts

## ResponsesAgent

[MLflow ResponsesAgent](https://mlflow.org/docs/latest/genai/flavors/responses-agent-intro/) is the recommended interface for building agents on Databricks. It follows the [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) schema and provides:

- Automatic tracing of agent interactions
- Streaming support (token-by-token output)
- Tool-calling message history
- Compatibility with AI Playground, Agent Evaluation, and Agent Monitoring

You can use any framework (OpenAI Agents SDK, LangGraph, custom) as long as you implement the ResponsesAgent interface. The [`agent-openai-agents-sdk`](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk) template, used throughout these docs as the primary example, uses the OpenAI Agents SDK.

## AgentServer

[MLflow AgentServer](https://mlflow.org/docs/latest/genai/serving/) is an async FastAPI server that hosts your agent. It exposes:

- `/invocations`: standard MLflow inference endpoint
- `/responses`: OpenAI Responses-compatible endpoint
- `/`: a built-in chat UI for interactive testing

Both `/invocations` and `/responses` support streaming (`"stream": true`). AgentServer provides automatic tracing for methods decorated with `@invoke()` and `@stream()`, plus autologging for LLM calls. You typically don't need to customize the server setup unless adding custom routes (in the `agent-openai-agents-sdk` template, this is `agent_server/start_server.py`).

## Tools and MCP

Agents call tools to interact with data and services. Databricks supports:

- **Built-in tools**: code interpreter (`system.ai.python_exec`), Vector Search retriever, Unity Catalog functions
- **MCP servers**: agent templates connect to [Databricks MCP servers](https://docs.databricks.com/aws/en/generative-ai/mcp/) for access to workspace tools and data sources
- **Custom tools**: define tools in your agent code using your framework's tool API, such as the OpenAI Agents SDK tool decorator

See [Agent Framework tools](https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-tool) for the full list of supported tool types.

## Auth model

Each deployed agent app gets a dedicated **service principal** with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET` injected at runtime. Grant the service principal access to resources (MLflow experiments, serving endpoints, Genie spaces, Vector Search) in `databricks.yml` or the workspace UI.

**On-behalf-of (OBO) user auth** forwards the requesting user's identity instead of the service principal. In the `agent-openai-agents-sdk` template, use `get_user_workspace_client()` from `agent_server.utils` for user-scoped operations.

**Querying deployed agents requires OAuth.** Personal Access Tokens (PATs) are not supported. Use `databricks auth token` to get an OAuth token.

## Configuration files

The [`agent-openai-agents-sdk`](https://github.com/databricks/app-templates/tree/main/agent-openai-agents-sdk) template uses these key files:

- **`agent_server/agent.py`**: your agent logic. Define tools, system prompts, and agent behavior here.
- **`agent_server/evaluate_agent.py`**: evaluation dataset and scorers for testing agent quality.
- **`databricks.yml`**: declares the app, resources, permissions, and deployment targets. Resources like serving endpoints, Genie spaces, and Vector Search indexes are granted to the app's service principal here.
- **`app.yaml`**: runtime configuration (startup command, environment variables).
- **`pyproject.toml`**: Python dependencies managed by uv. Add packages with `uv add <package>`.

## Deployment targets

**Databricks Apps** (recommended): full control over code, server, and deployment. Uses Declarative Automation Bundles (`databricks bundle deploy` + `databricks bundle run`). The `agent-openai-agents-sdk` template targets this path.

**Model Serving** (alternate): register your agent in Unity Catalog and deploy with the Python API (`from databricks.agents import deploy`). Creates a managed serving endpoint. For new use cases, Databricks recommends Apps instead. See [Deploy an agent for generative AI](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent) for the Model Serving workflow.

## Source of truth

- [Author an AI agent](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent)
- [MLflow ResponsesAgent](https://mlflow.org/docs/latest/genai/flavors/responses-agent-intro/)
- [Agent Framework tools](https://docs.databricks.com/aws/en/generative-ai/agent-framework/agent-tool)
- [MCP on Databricks](https://docs.databricks.com/aws/en/generative-ai/mcp/)
- [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth)
