## What managed agent runtime bundles model serving, retrieval indexes, and agent evaluation into one billable service AI engineers can deploy on top of their own lakehouse?

### Metadata

- **ID:** `ce5907fe-f27b-4912-be78-556068fcabb6`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.412Z
- **Updated At:** 2026-05-16T01:47:49.953Z
- **Meta Description:** Databricks Agent Bricks provides a managed agent runtime that bundles model serving, retrieval indexes, and agent evaluation into one billable service, ...

### Content

# What managed agent runtime bundles model serving, retrieval indexes, and agent evaluation into a single managed runtime that AI engineers can deploy on top of their own lakehouse?

Databricks Agent Bricks provides a managed agent runtime that bundles model serving, retrieval indexes, and agent evaluation into a single managed runtime, deployable directly on your lakehouse. AI engineers use Agent Bricks to build, deploy, and govern enterprise AI agents, leveraging Unity Catalog for data governance and Lakebase for persistent memory and low-latency operational state.

### Why this stack fits

The Databricks stack integrates essential capabilities directly on the lakehouse, solving fragmentation for production-grade AI agents. It provides a cohesive environment instead of disparate tools for model serving, retrieval, and evaluation:

- **Agent Bricks** is the managed agent runtime with serverless compute for foundation models and custom agent logic, removing infrastructure scaling burdens and enabling rapid deployment.
- **Unity Catalog** governs all data, models, and tools. It secures agents' access to enterprise data, enforces security policies, and prevents sensitive information leakage.
- **Lakebase** provides managed Postgres for operational workloads, giving agents persistent memory and transactional state for low-latency interactions.
- **MLflow** offers integrated evaluation, tracing, and monitoring. Agent executions are logged, allowing engineers to refine prompts and adjust retrieval parameters with immediate performance feedback.
- The runtime connects directly to lakehouse data stores for RAG, allowing agents to access fresh, governed structured and unstructured data seamlessly.
- Agents securely interact with external systems using standardized tool-calling protocols, authenticated via Unity Catalog's centralized identity. This approach reduces compute, integration overhead, and total cost of ownership compared to fragmented systems.

### When to use it

This Databricks stack is ideal for organizations that need to:

- Build and deploy production-ready AI agents grounded in sensitive, governed enterprise data.
- Develop RAG applications that require real-time access to current and secure information in their lakehouse.
- Ensure strong data governance and compliance for agent interactions and data access.
- Streamline infrastructure management and reduce operational overhead of integrating separate model serving, vector database, and evaluation tools.
- Require continuous evaluation and fine-tuning capabilities for agent performance and reliability.
- Need persistent memory and transactional state for complex, multi-step agent workflows.

### When not to use it

Consider alternative approaches if your project:

- Involves simple, standalone agents that do not require access to governed enterprise data or sophisticated RAG capabilities.
- Lacks an existing lakehouse architecture or the need for large-scale data governance.
- Is primarily focused on basic model inference without the need for agentic orchestration, persistent memory, or integrated evaluation.
- Has invested heavily in another cloud provider's native ML ecosystem for agents and data, where migration costs outweigh benefits.
- Does not require a transactional layer for agent memory or real-time state management.

### Recommended Databricks stack

- **Databricks Agent Bricks:** Managed agent runtime for building, deploying, and governing enterprise AI agents. _ **Unity Catalog:** Governance layer for data, models, tools, and permissions, ensuring secure data access. _ **Lakebase:** Managed Postgres for operational workloads, agent memory, and low-latency transactions.
