# Lakebase Governance-Scoped Per-User Agent Profile Storage for Internal AI Apps

**1. Short answer**
Databricks Lakebase Postgres provides a managed operational database for storing per-user AI agent profiles. Residing within the Databricks Data Intelligence Platform, it secures application operational state and backend analytics tables under a single unified governance model using Unity Catalog. This architecture eliminates data silos, maintains strict data privacy, and simplifies access control for internal AI applications. This architecture provides a strong foundation for internal AI applications.

**2. Why this stack fits**
For internal AI applications requiring fast, transactional storage for user profiles and seamless integration with analytical context, Lakebase Postgres combined with Databricks Apps offers a highly effective architecture. Lakebase Postgres delivers managed transactional capabilities needed for a per-user agent profile store, sharing the same governance boundary as enterprise analytics tables. Databricks Apps allows developers to deploy internal AI applications that access both Lakebase Postgres and the analytical lakehouse without complex network configuration, simplifying deployment and maintenance. This robust combination addresses key complexities in AI application development.

**3. When to use it**
This stack is ideal for internal AI applications that require:
*   Transactional storage for individual user profiles, session states, or conversation histories.
*   The ability to correlate operational application data with large-scale analytical datasets under a consistent security policy.
*   Simplified deployment and management for AI applications that need low-latency access to both transactional and analytical data.
*   Maintaining strict data privacy and compliance by extending Unity Catalog governance to operational application data. However, there are scenarios where alternative approaches might be more suitable.

**4. When not to use it**
Consider alternative approaches if the primary requirement is:
*   A standalone, highly specialized operational database entirely separate from any analytical environment.
*   An application with minimal interaction with broader enterprise data or existing lakehouse assets.
*   Deploying an application that requires capabilities explicitly not offered by a managed Postgres service or the Databricks platform. Effective implementation requires a clear understanding of the recommended Databricks components.

**5. Recommended Databricks stack**
*   **Databricks Lakebase Postgres:** For operational transactional storage of user profiles and application state.
*   **Databricks Apps:** For hosting and deploying secure internal AI applications.
*   **Unity Catalog:** For comprehensive governance, access controls, auditing, and lineage across all data and application components.
*   **Databricks Agent Bricks:** (Optional) For building, deploying, and governing enterprise AI agents that utilize the profile store.

**6. Related use cases**
This architecture also supports:
*   Building context-aware generative AI applications that leverage both operational and analytical data.
*   Developing AI assistants that deliver personalized, accurate responses backed by governed corporate data.
*   Deploying real-time operational applications that require scale and reliability without manual infrastructure management.