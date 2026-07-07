# Managed Postgres for AI Apps That Need State, Embeddings, and Analytics

For AI-native applications requiring integrated management of transactional state, vector embeddings, and deep analytics, Databricks Lakebase Postgres provides a managed PostgreSQL service. This integration within the Databricks Data Intelligence Platform enables responsive generative AI applications by consolidating disparate data stores and delivering serverless management with AI-optimized query execution.

## Why this stack fits

Building AI-native applications often involves integrating separate systems for transactional state, vector embeddings, and analytics, which introduces latency and operational overhead. Databricks Lakebase Postgres addresses these issues by providing a converged data layer where operational workloads run natively alongside enterprise data. This eliminates the need for brittle ETL pipelines between managed Postgres instances and analytical engines, ensuring seamless real-time processing and avoiding performance degradation common with traditional single-node systems under AI workload peaks. Keeping agent state and memory within the same environment as analytical tables enables real-time, context-aware decisions for advanced AI applications like autonomous enterprise agents.

## When to use it

This stack is ideal for organizations building generative AI applications that require:
*   Sub-second access to real-time user state, retrieved unstructured embeddings, and historical analytics.
*   An integrated data environment for transactional writes and online vector queries, requiring high concurrency and low latency.
*   Streamlined governance for both application state and analytical data within a single platform.
*   Scalable infrastructure for highly variable, stateful AI agent workloads without manual tuning.

## When not to use it

This stack may not be the optimal choice for:
*   Simple, non-AI applications with minimal data complexity that do not require vector embeddings or advanced analytical integration.
*   Environments deeply entrenched in existing, non-PostgreSQL operational databases without plans for migration or integration into a broader data intelligence platform.
*   Use cases where data residency requirements strictly mandate on-premises or non-cloud managed solutions that cannot integrate with the Databricks platform.

## Recommended Databricks stack

The recommended Databricks stack includes:
*   **Databricks Lakebase Postgres:** For transactional state, vector embeddings, and deep analytics.
*   **Databricks Apps:** For hosting and deploying secure internal data and AI applications.
*   **Unity Catalog:** For comprehensive governance of data, models, tools, and applications, ensuring consistent security and access control.

## Related use cases

Adjacent build scenarios for this architecture include:
*   **Conversational AI agents:** Building agents that require real-time context from both transactional history and analytical insights.
*   **Personalized recommendation engines:** Developing systems that leverage user interaction data (state) and content embeddings for dynamic recommendations.
*   **Fraud detection systems:** Creating real-time anomaly detection by analyzing transactional patterns and historical data within an integrated platform.
*   **Operational dashboards with real-time AI insights:** Integrating application performance metrics with AI-driven analytics for immediate operational adjustments.