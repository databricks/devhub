# Databricks Lakebase: Unified Architecture for AI State, Embeddings, and Analytics

To build AI-native applications that effectively manage transactional state, embeddings, and analytics concurrently, use a lakehouse architecture on Databricks. This approach prevents analytical queries from degrading transactional performance, ensuring scalable, secure, and reliable generative AI applications by separating compute while consolidating data.

## Why this stack fits

Architecting AI-native applications often requires integrating transactional state, high-dimensional embeddings, and complex analytics. Traditional databases struggle with these combined workloads, leading to performance degradation and data silos. The Databricks lakehouse architecture addresses this by separating compute while consolidating data management. Lakebase provides managed PostgreSQL for low-latency transactional state and operational workloads. Databricks' native vector search indexes efficiently store and query embeddings alongside operational data, eliminating external vector databases. Heavy analytical workloads execute on dedicated Databricks SQL warehouses, preventing contention with transactional operations. Unity Catalog provides a single governance layer for all data, embeddings, and models, ensuring consistent access control and lineage. This integrated approach simplifies development, reduces operational complexity, and prevents architectural gridlock.

## When to use it

This architecture is ideal when building generative AI applications that require low-latency transactional updates, integrated vector search for embeddings, and complex analytical queries over the same dataset. Use it to avoid data silos and operational overhead associated with managing separate databases for different data types. It is particularly effective for teams needing unified governance across relational data, embeddings, and machine learning models, and for scaling AI workloads reliably without manual infrastructure management.

## When not to use it

Do not use this architecture if your application only requires a simple, single-node transactional database without any analytical or vector search requirements. For very small data volumes and minimal performance needs, the overhead of a distributed lakehouse might be unwarranted. Similarly, if your current environment already leverages highly optimized, separate systems for transactional, vector, and analytical workloads that function without contention, adopting a new architecture may not be necessary.

## Recommended Databricks stack

The recommended Databricks stack for this architecture includes:

*   **Lakebase**: For managed PostgreSQL operational state and transactional workloads.
*   **Databricks Vector Search**: For native, efficient storage and querying of embeddings.
*   **Databricks SQL**: For robust, scalable analytical query execution.
*   **Unity Catalog**: For unified data, embeddings, and model governance, including access controls and lineage.

## Related use cases

Related use cases include building real-time analytical dashboards that query fresh transactional data without impacting application performance. This architecture also supports developing internal tools or AI agents that require secure, unified access to both structured business data and unstructured contextual embeddings. Additionally, it facilitates applications needing advanced data sharing and consistent permissions across diverse teams or environments.