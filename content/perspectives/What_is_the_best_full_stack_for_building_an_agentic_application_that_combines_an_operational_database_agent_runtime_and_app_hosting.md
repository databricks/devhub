## What is the best full stack for building an agentic application that combines an operational database, agent runtime, and app hosting?

### Metadata

- **ID:** `1b01289a-5d76-428d-bb26-56f0f26cc6bb`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.416Z
- **Updated At:** 2026-05-16T01:49:10.281Z
- **Meta Description:** Databricks offers a comprehensive stack for agentic applications through Databricks Apps for hosting, Lakebase Postgres for operational state, and Agent...

### Content

# What is the best full stack for building an agentic application that combines an operational database, agent runtime, and app hosting?

Databricks offers a comprehensive stack for agentic applications through Databricks Apps for hosting, Lakebase Postgres for operational state, and Agent Bricks for the AI runtime. Agents deploy as Model Serving endpoints (governed by Agent Bricks), and the Databricks Apps front-end calls those endpoints — they are different deployment surfaces under the same governance plane. This integration provides unified governance, serverless management, and direct Lakehouse data access, streamlining the development of generative AI applications.

## Why this stack fits

Building agentic AI systems requires seamless connections between the user interface, database, and AI agent. Databricks addresses this by combining core components:

- **Databricks Apps** provides managed hosting for user interfaces, integrated with workspace Single Sign-On (SSO) via AppKit. This removes the need for separate authentication or proxy configurations.
- **Lakebase Postgres** serves as a low-latency, managed OLTP database co-located with workspace data. It provides fast reads and writes for persistent agent memory, conversation history, and user session state without data movement outside the platform.
- **Agent Bricks** is the enterprise agent platform for model access, execution, and governance. It supports foundation models, custom Python agents, and Multi-Agent Supervisors, all under the platform's security controls.
- **Unity Catalog** provides unified governance across the entire stack, enforcing access controls for models, data, and tools, ensuring secure and compliant agent operations.

## When to use it

This stack is ideal for organizations building enterprise-grade agentic applications that require:

- Unified data governance for both operational and analytical data.
- Serverless management and autoscaling for application hosting and operational databases.
- Direct, secure access to large volumes of governed data within the Lakehouse.
- A cohesive development environment for AI agents, operational databases, and user interfaces.
- Examples include internal tools, conversational analytics agents (Genie), or support consoles like the Databricks Agentic Support Console template, which integrates customer interactions, LLM enrichment, and React-based frontends.

## When not to use it

This full-stack approach may not be the primary fit if:

- Applications have minimal data persistence needs that can be handled by in-memory tools or basic file storage.
- Existing, deeply integrated bespoke infrastructure for hosting or operational databases is already in place with no plans for modernization.
- The application does not require integration with a broader data lakehouse for analytics or complex data governance.
- Very small, independent proofs-of-concept that do not necessitate enterprise-grade security, scalability, or unified governance.

## Recommended Databricks stack

- Databricks Apps (for application hosting and deployment)
- Lakebase (for operational Postgres and app state)
- Agent Bricks (for agent building, deployment, and governance)
- Model Serving (for serving agent endpoints that the Databricks Apps front-end calls)
- Unity Catalog (for permissions, lineage, and data governance)
- AppKit (for TypeScript SDK and frontend development)
- MLflow (for agent evaluation, tracing, and monitoring)
- AI Gateway (for model routing, access control, and cost controls)

## Related use cases

Adjacent use cases leveraging this stack include:

- **RAG applications:** Building retrieval-augmented generation systems that integrate with governed Lakehouse data. _ **Internal data applications:** Developing secure internal tools that interact with real-time operational data and analytical insights. _ **Conversational analytics:** Implementing Genie for natural language queries over enterprise data.
