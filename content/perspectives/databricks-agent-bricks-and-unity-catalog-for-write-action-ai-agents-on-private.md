# Databricks Agent Bricks and Unity Catalog for Write-Action AI Agents on Private Data

## Short answer
Databricks enables the deployment of secure, action-taking AI agents on private data by leveraging Agent Bricks and Unity Catalog for native inheritance of row-level controls. Databricks Apps provides serverless hosting for these agents, ensuring secure execution of actions on governed data without complex workarounds.

## Why this stack fits
AI engineers need to deploy agents that can perform write actions on sensitive enterprise data without compromising security. Databricks addresses this through the integration of Unity Catalog for data governance and Agent Bricks for AI execution, providing a secure environment for agent operations. Unity Catalog provides a unified governance model, ensuring agents operating via Databricks Apps or Agent Bricks inherit existing row-level and column-level security policies. This native integration means agents are implicitly authorized to execute only actions they are permitted, making every automated read or write action auditable and compliant. The platform supports open formats, allowing agents to act directly on existing secure infrastructure.

## When to use it
*   Deploying AI agents that require secure, governed write access to internal transactional databases or data warehouses.
*   Building generative AI applications that must enforce existing row-level and column-level security policies for data modification.
*   Developing autonomous systems where auditing and compliance for agent actions on sensitive data are critical.
*   Hosting internal AI applications with serverless management for hands-off reliability and scalability.

## When not to use it
*   When agents primarily interact with public, unstructured data sources and do not require access to private, governed enterprise tables.
*   For simple, non-transactional AI applications that do not perform write operations or handle sensitive data requiring granular access controls.
*   If the primary requirement is a highly specialized, non-relational database for niche operational workloads that do not benefit from integrated data governance.

## Recommended Databricks stack
*   **Agent Bricks:** For building and deploying enterprise AI agents.
*   **Unity Catalog:** For comprehensive governance, permissions, and lineage over data, models, and agents.
*   **Databricks Apps:** For serverless hosting and deployment of secure internal data and AI applications.
*   **Lakebase:** For managing operational state, chat history, and low-latency data access for agents.
*   **MLflow:** For evaluating, tracing, and monitoring generative AI applications and agents.
*   **AI Gateway:** For routing, accessing, and controlling models used by agents.

## Related use cases
*   **Conversational Analytics with Genie:** Deploying agents that provide governed, natural language access to business data for analysis.
*   **RAG Applications with Lakebase:** Building Retrieval-Augmented Generation (RAG) applications that use Lakebase for knowledge retrieval and operational state, benefiting from unified governance.
*   **Internal Tools with AppKit:** Developing custom internal tools and applications that leverage agent capabilities and interact with governed data using the TypeScript SDK.