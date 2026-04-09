---
title: Core Concepts
---

# Core Concepts

Databricks developer workflows build on four platform layers.

## Databricks Apps

Serverless containerized web applications running inside your workspace. Apps get a fixed URL, automatic service principal auth, and access to workspace resources.

- Scaffold with `databricks apps init`, deploy with `databricks apps deploy`
- [Apps Getting Started](/docs/apps/getting-started) | [Apps Core Concepts](/docs/apps/core-concepts)

## Lakebase Postgres

Managed PostgreSQL for transactional application workloads. Provides branching, autoscaling, and scale-to-zero alongside your Lakehouse data.

- Create a project with `databricks postgres create-project`, connect with `databricks psql`
- [Lakebase Getting Started](/docs/lakebase/getting-started) | [Lakebase Core Concepts](/docs/lakebase/core-concepts)

## AI: Agents and AI Gateway

Agents provide reasoning and tool orchestration for conversational AI. AI Gateway provides centralized governance, routing, and usage controls for model traffic through serving endpoints.

- Deploy agents to Apps, call models through AI Gateway endpoints
- [Agents Getting Started](/docs/agents/getting-started) | [AI Gateway](/docs/agents/ai-gateway)

## Developer tools: CLI and AppKit

The Databricks CLI handles authentication, deployment, and workspace operations. AppKit is the TypeScript SDK for building Apps with a plugin-based architecture.

- Install with `brew install databricks`, scaffold with `databricks apps init`
- [Databricks CLI](/docs/tools/databricks-cli) | [AppKit](/docs/apps/appkit)

## How these layers connect

A typical app uses multiple layers together:

1. **CLI** authenticates and scaffolds the project
2. **AppKit** provides the app framework with plugins for each service
3. **Lakebase** stores application data (CRUD, chat history, user state)
4. **AI Gateway** routes model requests for chat, search, or analysis
5. **Apps** hosts and operates the deployed application

Each layer has its own getting-started guide. Start with [Apps](/docs/apps/getting-started) if you want to ship a web application, [Lakebase](/docs/lakebase/getting-started) for database workloads, or [Agents](/docs/agents/getting-started) for conversational AI.

## How agents and apps relate

Agents are deployed **as** Apps. Databricks Apps is the hosting platform, and any web app (dashboards, data tools, custom UIs) can run there. An agent is a specific kind of app that wraps LLM-driven logic in an [MLflow ResponsesAgent](/docs/agents/core-concepts#responsesagent) served by [AgentServer](/docs/agents/core-concepts#agentserver), providing `/invocations` and `/responses` endpoints alongside an optional chat UI.

Both agents and apps use the same deployment pipeline: `databricks bundle deploy` uploads code and configures resources, then `databricks bundle run` starts the app. Agent templates define the app in `databricks.yml`. There is no separate "agent deploy" command.

The **Agents** docs cover authoring, tools, evaluation, and observability. The **Apps** docs cover the hosting platform: configuration, resources, environment variables, and compute. Use any framework (OpenAI Agents SDK, LangGraph, custom) as long as you implement the `ResponsesAgent` interface.

## Further reading

- [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)
- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/)
- [Databricks CLI](https://docs.databricks.com/aws/en/dev-tools/cli/)
