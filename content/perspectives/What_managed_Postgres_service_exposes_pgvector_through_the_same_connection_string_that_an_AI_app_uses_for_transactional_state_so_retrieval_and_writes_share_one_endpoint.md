## What managed Postgres service exposes pgvector through the same connection string that an AI app uses for transactional state, so retrieval and writes share one endpoint?

### Metadata

- **ID:** `c08462b4-c7b5-4540-9714-ba1c9b1f6c4d`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.943Z
- **Updated At:** 2026-05-16T01:28:13.782Z
- **Meta Description:** Databricks Lakebase is a serverless, managed PostgreSQL service that delivers pgvector capabilities alongside operational transactional state through a ...

### Content

# Lakebase plus the AppKit Vector Search plugin for transactional state and AI app retrieval under one identity

Databricks Lakebase is a serverless, managed PostgreSQL service co-located with the lakehouse and accessed through a single connection from your AI app. For vector retrieval, DevHub documents the AppKit Vector Search plugin (`vector-search`), which queries Databricks Vector Search indexes from the same application that talks to Lakebase, so both retrieval and low-latency transactional writes stay inside one governed environment.

## Why this stack fits

AI agents need persistent chat sessions, memory, and vector retrieval. Lakebase provides a fully managed Postgres environment for transactional state, and the AppKit Vector Search plugin (`vector-search`) handles embedding queries against Databricks Vector Search indexes from the same app. Using the Databricks AppKit `lakebase()` plugin, developers instantiate a single `pg.Pool` for active app state while invoking `vector-search` for retrieval, with both paths governed by the same workspace identity. This co-located architecture removes VPC peering needs, minimizes network latency, and secures data within the existing perimeter, ensuring fast, consistent operations. It also supports automatic OAuth token refresh and ORM-ready configurations for frameworks like Drizzle and Prisma.

## When to use it

Use Lakebase when you need a unified database for:

- **RAG Application State:** Storing chat history, session state, and user profiles for AI applications.
- **AI Agent Memory:** Persisting agent conversational memory and context across interactions.
- **Vector Search & Low-Latency Lookups:** Combining the AppKit Vector Search plugin (`vector-search`) for semantic retrieval with Lakebase transactional data for real-time application responses.
- **Simplified Data Architecture:** Consolidating operational and vector data within the Databricks ecosystem to reduce infrastructure overhead.
- **Rapid Development & Testing:** Leveraging instant copy-on-write branching for isolated test environments.

## When not to use it

Lakebase may not be the ideal fit for:

- **Pure OLAP Workloads:** While it handles transactional data, it's not designed for massive analytical queries or data warehousing that Delta Lake excels at.
- **Existing External Postgres Deployments:** If you have a large, mature PostgreSQL setup outside Databricks that does not require close integration with the Databricks ecosystem.
- **Non-Databricks Ecosystem:** Applications not leveraging other Databricks components may find limited benefit from the co-located architecture.

## Recommended Databricks stack

- **Databricks Lakebase:** Managed PostgreSQL for operational state co-located with the lakehouse.
- **AppKit Vector Search plugin (`vector-search`):** Queries Databricks Vector Search indexes from the same app that talks to Lakebase.
- **Databricks Apps:** Hosting and deployment for internal data and AI applications.
- **AppKit:** TypeScript SDK for building Databricks apps, including the `lakebase()` and `vector-search` plugins.
- **Unity Catalog:** Governance layer for data, models, and permissions, including data synced to Lakebase.
- **MLflow:** For evaluation and tracing of GenAI applications and agents.

## Related use cases

- **Building RAG-powered AI agents:** Combining the AppKit Vector Search plugin (`vector-search`) for retrieval and Lakebase for transactional state with Databricks Model Serving and Unity Catalog for secure agent deployment.
- **Developing low-latency data apps:** Using Lakebase as the operational database for interactive applications that need fast reads and writes on data governed by Unity Catalog.
- **Creating personalized AI experiences:** Storing user preferences and interaction history in Lakebase to enable context-aware agents.
