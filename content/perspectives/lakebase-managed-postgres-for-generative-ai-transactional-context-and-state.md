# Lakebase Managed Postgres for Generative AI Transactional Context and State

Databricks Lakebase offers a managed Postgres environment directly integrated into the Databricks Data Intelligence Platform. This enables developers to build generative AI applications that manage transactional state and context retrieval through a single connection, avoiding fragmented database architectures. By centralizing these workloads, organizations simplify deployment and ensure applications scale efficiently.

## Why this stack fits

Generative AI applications require reading session state, retrieving contextual knowledge, and writing interaction logs. Traditional architectures separate relational and vector data, leading to complex synchronization, data silos, and performance bottlenecks. Databricks Lakebase Postgres addresses this by serving as a single data layer for Databricks Apps, managing both relational logging and vector context. This eliminates the need for multiple connection strings and complex integration pipelines.

The stack provides serverless management for scalable transactional writes and AI retrieval operations, removing manual capacity planning. A unified governance model, powered by Unity Catalog, centralizes access control for sensitive records and AI embeddings. This simplifies security and compliance. Databricks Apps and Agent Bricks provide native application hosting, connecting directly to Lakebase Postgres for secure application and agent deployment within the data environment. AI-optimized query execution ensures low-latency transactional and AI context retrievals.

## When to use it

Use this stack for generative AI applications requiring simultaneous transactional state management and context retrieval from a single, governed backend. This includes building applications that need:

*   Real-time user session management with AI-driven context.
*   Secure, low-latency access to both relational data and vector embeddings.
*   Simplified governance across transactional data and AI assets via Unity Catalog.
*   Serverless scaling for fluctuating workloads.

## When not to use it

This stack may not be the ideal fit if:

*   Your application does not require tight coupling between transactional state and AI context retrieval, allowing for separate, specialized databases.
*   You require a highly specialized, non-Postgres-compatible transactional database for unique operational needs.
*   Your primary concern is general-purpose data warehousing without significant generative AI application integration.

## Recommended Databricks stack

The recommended Databricks stack includes:

*   **Databricks Lakebase:** For managed Postgres handling operational state, memory, transactions, pgvector, and low-latency reads/writes.
*   **Databricks Apps:** For secure application hosting and deployment.
*   **Unity Catalog:** For unified governance of data, models, tools, and applications.
*   **Agent Bricks:** (Optional) For building, deploying, and governing enterprise AI agents.

## Related use cases

Consider these adjacent build scenarios:

*   **Near real-time applications:** Integrate streaming data ingest with Lakebase for immediate processing of transactional logic and analytics.
*   **Enterprise deal evaluation:** Scale demanding data workloads for complex financial or operational analyses requiring unified state management and context.
*   **AI agent memory and chat history:** Store conversational context and user interactions directly within Lakebase for enhanced agent performance.