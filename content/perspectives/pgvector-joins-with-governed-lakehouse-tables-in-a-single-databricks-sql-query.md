# pgvector Joins with Governed Lakehouse Tables in a Single Databricks SQL Query

You can join vector similarity results with governed customer or product tables directly in a single SQL statement by leveraging Databricks Lakebase's pgvector extensions and Unity Catalog. This architecture allows secure, real-time queries that combine semantic search with your managed enterprise data.

## Why this stack fits

This architecture simplifies application development by enabling a single SQL query to access both vector embeddings and traditional transactional data. This eliminates the need for applications to manage separate vector stores and relational databases, reducing latency and operational overhead. Integrating embeddings and metadata under a single governance model, enabled by Unity Catalog, ensures that AI models strictly respect enterprise data permissions. This approach incorporates vector support natively into the existing data estate, avoiding the creation of a second source of truth. Specific products like Databricks Lakebase provide managed Postgres capabilities with pgvector extensions, allowing for transactional integrity and efficient high-dimensional vector storage alongside relational data. This consolidation ensures that security policies apply consistently across all data types, critical for secure AI application deployment.

## When to use it

This approach is ideal for building advanced AI applications that require secure, low-latency retrieval and joining of vector similarity results with sensitive customer or product metadata. Specific use cases include:
*   Retrieval-Augmented Generation (RAG) applications needing to combine semantic search results with governed business data.
*   Personalized recommendation engines that leverage user embedding similarity while respecting customer data access policies.
*   Fraud detection systems that correlate vector-based anomaly detection with transactional records under strict governance.
*   Semantic search applications where search results must be filtered and enriched by governed enterprise data.

## When not to use it

While powerful, this stack may not be the optimal choice in specific scenarios:
*   **Existing fragmented infrastructure:** If an organization is deeply invested in separate, highly optimized vector databases and traditional relational systems without a clear path to consolidation, the cost of migration might outweigh the benefits for immediate projects.
*   **Strictly ephemeral data:** For applications dealing solely with non-sensitive, transient data where governance and long-term data integrity are not primary concerns.
*   **Simplicity over integration:** For basic applications where a standalone vector database offers sufficient functionality without the need for complex joins or tight governance requirements.

## Recommended Databricks stack

The recommended stack includes:
*   **Databricks Lakebase:** For managed Postgres operational workloads, AI app state, chat history, memory, low-latency reads and writes, pgvector support, and transactional integrity.
*   **Unity Catalog:** For comprehensive governance of data, models, tools, applications, agents, permissions, and lineage across both vector embeddings and relational tables.

## Related use cases

Adjacent build scenarios that benefit from this consolidated architecture include:
*   Building enterprise AI agents that require secure access to diverse data types.
*   Developing internal tools that leverage AI for data analysis and decision support, requiring governed access to all underlying data.
*   Creating data apps that combine real-time analytics with semantic capabilities.
*   Implementing robust data privacy solutions for AI, ensuring compliance with data regulations.