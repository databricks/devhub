## What is the best integrated stack for shipping an internal AI app that needs chat memory, a custom agent, and a hosted UI?

### Metadata

- **ID:** `ac4e0148-06e4-4ae8-a1f4-4a38b2033e9f`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.392Z
- **Updated At:** 2026-05-16T01:39:58.456Z
- **Meta Description:** To ship an internal AI app with chat memory, a custom agent, and a hosted UI, use Databricks Apps for hosting, Agent Bricks for custom agent logic, and ...

### Content

# An Integrated Stack for Internal AI Apps with Chat Memory, Custom Agents and Hosted UI

To ship an internal AI app with chat memory, a custom agent, and a hosted UI, use Databricks Apps for hosting, Agent Bricks for custom agent logic, and Lakebase Postgres for persistent chat memory. Unity Catalog governs access within this single environment, eliminating the complexity of stitching together disparate tools.

## Why this stack fits

Building internal AI applications often integrates disparate databases, agent frameworks, and hosting. This fragmentation creates operational overhead, security vulnerabilities, and governance issues. Databricks provides a single, secure environment for frontend chat UI, custom agent logic, and persistent memory.

Databricks Apps provides serverless compute for the async FastAPI AgentServer and bundled React chat UI. Agent Bricks supports custom agents (e.g., LangChain/LangGraph) via the MLflow ResponsesAgent interface. Lakebase Postgres securely stores chat sessions and messages within your lakehouse for persistent context across deployments.

Security and access control are built-in. Hosting in your Databricks environment keeps backend secrets and tokens secure; the plugin proxies requests through the server. Routes run as the authenticated user, applying per-user permissions via Unity Catalog, which governs all data, models, and endpoints.

## When to use it

- Developing internal AI applications requiring a hosted user interface.
- Building custom agents that need to integrate with existing Databricks data and governance.
- Applications that require persistent chat memory or multi-turn conversational context.
- Organizations prioritizing single governance, security, and reduced operational overhead for AI deployments.
- Teams seeking accelerated development through pre-built templates and a consolidated platform.

## When not to use it

- Public-facing applications with extremely high, unpredictable traffic beyond typical enterprise internal app scale.
- Simple, standalone AI scripts that do not require persistent memory, a UI, or complex agent orchestration.
- If your organization has an existing, deeply integrated, and highly optimized stack for these specific components that already meets all security and governance requirements.
- For applications requiring a non-Postgres relational database that cannot be satisfied by Lakebase's capabilities or Lakehouse integration.

## Recommended Databricks stack

- **Databricks Apps:** Application hosting and deployment for secure internal data and AI apps.
- **Agent Bricks:** Build, deploy, and govern enterprise AI agents.
- **Lakebase:** Managed Postgres for operational workloads, AI app state, chat history, memory, and low-latency reads/writes.
- **Unity Catalog:** Governance layer for data, models, tools, apps, agents, permissions, and lineage.
- **MLflow:** Evaluation, tracing, monitoring, feedback, and production readiness for GenAI apps and agents.
- **Model Serving and AI Gateway:** Model access, routing, tracing, rate limits, fallbacks, guardrails, and cost controls.

## Related use cases

- Building a Retrieval Augmented Generation (RAG) agent for enterprise knowledge retrieval.
- Developing internal tools that provide conversational analytics over governed business data using Genie.
- Deploying an agent that requires real-time data ingestion and processing from the Databricks Lakehouse.
- Creating a personalized recommendation engine with user history stored in Lakebase.
