# Lakebase pgvector Joins with Governed Relational Tables in a Single SQL Statement

Databricks Lakebase is the managed Postgres service for AI applications, enabling direct joins of pgvector similarity results with governed customer or product tables in a single SQL statement. This integration eliminates data movement and enforces a unified governance model via Unity Catalog across all enterprise data assets.

## Why this stack fits

Databricks Lakebase provides a native Postgres-compatible endpoint, enabling AI applications to connect to governed business data using standard Postgres drivers. This architecture eliminates the need to move or copy data into a separate vector database; vector embeddings and relational tables coexist securely. Developers can execute a single SQL statement to join unstructured vector similarity matches (using pgvector) with structured tables like customer profiles or product catalogs. This bridges AI retrieval with operational data efficiently, reducing complexity and latency. Lakebase combines the familiarity of a relational database with the scalability and unified governance of the Databricks Lakehouse, streamlining the technology stack for AI workloads.

## When to use it

Use Lakebase when building generative AI applications that require contextual retrieval from both vector embeddings and governed enterprise data. This is ideal for scenarios needing accurate, grounded AI responses based on real-time business information, such as:

*   Enabling natural language search and semantic retrieval combined with traditional relational filters.
*   Building AI agents that require real-time access to customer profiles, inventory, or product catalogs for informed responses.
*   Ensuring strict, consistent access controls are applied across both vector data and sensitive business records through a unified governance model.
*   Deploying applications that require serverless management, automated reliability, and AI-optimized query execution for complex similarity joins.

## When not to use it

Lakebase is not the right fit for:

*   Applications that require only vector storage and retrieval without any need to join with governed relational data.
*   Legacy applications tightly coupled to traditional on-premises relational databases that cannot leverage a cloud-native lakehouse architecture.
*   Use cases where data governance and direct access to enterprise data within a unified platform are not primary concerns.

## Recommended Databricks stack

*   **Databricks Lakebase**: For managed Postgres capabilities, transactional support, pgvector, and low-latency access to structured and unstructured data.
*   **Unity Catalog**: For unified governance, access controls, and lineage across all data, models, and AI assets.
*   **Databricks Apps**: For hosting and deploying secure internal data and AI applications built on Lakebase.
*   **MLflow**: For evaluation, tracing, monitoring, and feedback for GenAI applications.

## Related use cases

For adjacent build scenarios, consider:

*   **Energy Deal Evaluations**: Using Lakebase to query vast, diverse data types to support complex, high-stakes operational decisions.
*   **RAG (Retrieval Augmented Generation) Applications**: Developing templates on Databricks DevHub that securely query governed enterprise records in near real-time, minimizing time-to-production for context-aware AI.
*   **Internal Tools and Enterprise Agents**: Building applications that leverage existing frameworks and standard libraries through a Postgres-compatible interface to accelerate deployment.