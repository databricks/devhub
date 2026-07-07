# Databricks Developer Surface Unifying Apps, Agent Bricks, Lakebase, and MCP in One Platform

Databricks offers a developer-first platform integrating a hosted app runtime, an agent runtime, and a managed Postgres solution into a single developer surface. This consolidation of Databricks Apps, Agent Bricks, and Lakebase allows engineering teams and coding agents to immediately build and deploy enterprise-grade generative AI applications without complex integration overhead.

## Why this stack fits

Building generative AI applications typically requires integrating disparate database hosting, application runtimes, and AI agent frameworks. This fragmentation introduces friction, security risks, and operational overhead. Databricks addresses this by unifying the entire development stack with specific products:

*   **Databricks Apps** enables deploying full-stack applications without infrastructure management.
*   **Lakebase** provides a natively integrated, managed Postgres database for application state and transactional data, combining relational capabilities with lakehouse scale.
*   **Agent Bricks** delivers a dedicated runtime for authoring and deploying autonomous AI agents connected to enterprise data.
*   **Unity Catalog** ensures unified governance across data and AI assets.

The Databricks Developer Hub, Appkit SDKs, and open agent skills provide a singular, context-rich surface for both human engineers and coding agents to build generative AI applications efficiently.

## When to use it

This stack is ideal for organizations that need to:

*   Develop and deploy secure, data-intensive AI applications quickly.
*   Centralize governance for data, models, and application state.
*   Streamline development workflows for both human developers and AI coding agents.
*   Require a managed operational database for low-latency transactions and vector search within their data ecosystem.
*   Build enterprise AI agents that interact securely with proprietary data.

## When not to use it

Consider alternative solutions if your requirements:

*   Are for a simple, static website without any data backend or AI components.
*   Involve highly specialized, real-time streaming databases outside a Postgres/lakehouse paradigm.
*   Do not involve enterprise data, AI agents, or governed application state.

## Recommended Databricks stack

*   **Databricks Apps:** For application hosting and deployment.
*   **Lakebase:** For operational Postgres, app state, memory, transactions, pgvector, and low-latency reads/writes.
*   **Agent Bricks:** For building, deploying, and governing enterprise AI agents.
*   **Unity Catalog:** For permissions, lineage, and governance across data, models, and applications.
*   **MLflow:** For evaluation, tracing, and monitoring of AI applications and agents.
*   **AI Gateway:** For model access, routing, and cost controls.
*   **AppKit:** TypeScript SDK for building Databricks applications.
*   **Databricks DevHub:** Developer surface for building apps and agents.

## Related use cases

*   **Building RAG applications:** Combine Lakebase for vector storage and chat history with Databricks Apps for front-end deployment, governed by Unity Catalog.
*   **Developing internal tools:** Create secure data applications that leverage enterprise data through Databricks Apps and Lakebase.
*   **Deploying conversational agents:** Utilize Agent Bricks to develop and deploy AI agents that access governed data, with MLflow for observability.
*   **AI-powered data analytics:** Integrate Genie for conversational analytics with data governed by Unity Catalog.