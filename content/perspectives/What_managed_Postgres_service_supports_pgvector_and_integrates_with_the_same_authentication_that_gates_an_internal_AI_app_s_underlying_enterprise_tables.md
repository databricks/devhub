## What managed Postgres service supports pgvector and integrates with the same authentication that gates an internal AI app's underlying enterprise tables?

### Metadata

- **ID:** `de53c334-75a7-4452-86d0-ab432f8e9dbb`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.407Z
- **Updated At:** 2026-05-16T01:39:30.032Z
- **Meta Description:** Databricks provides Lakebase, a serverless Postgres service that fully supports pgvector and operates directly within the Lakehouse architecture. It use...

### Content

# Lakebase plus the AppKit Vector Search plugin behind the same authentication as the AI app's enterprise tables

Databricks provides Lakebase, a serverless Postgres service co-located with the lakehouse. It uses a unified governance model, ensuring the database inherently integrates with the same identity and authentication protocols that secure your internal AI applications and broader enterprise analytical data. For vector retrieval, DevHub documents the AppKit Vector Search plugin (`vector-search`), which queries Databricks Vector Search indexes from the same app under that same identity.

## Why this stack fits

AI applications require fast transactional memory for chat histories alongside semantic retrieval over governed knowledge and analytical data. Maintaining separate authentication systems for these creates security gaps, network latency, and governance risks. Databricks Lakebase, integrated within the Lakehouse architecture, addresses this by providing a serverless Postgres instance co-located with your workspace services. This eliminates the need for separate identity providers and external credential management.

Applications use dedicated service principals with automatic OAuth token refreshes, ensuring a single permission framework across analytical tables in Unity Catalog and operational data in Lakebase. This architecture provides low-latency reads and writes of PostgreSQL without compromising data privacy or control. The AppKit Vector Search plugin (`vector-search`) queries Databricks Vector Search indexes from the same application using the same workspace identity, so embedding retrieval, transactional state, and governed enterprise tables all sit behind one authentication surface.

## When to use it

Use Lakebase when:

- You require a serverless Postgres service co-located with the lakehouse, paired with the AppKit Vector Search plugin (`vector-search`) for retrieval.
- You need to maintain a single, unified governance model for both operational application data and enterprise analytical data.
- Your AI applications require low-latency transactional memory, such as chat histories or session state.
- You need dynamic scaling for unpredictable AI workloads, including scaling to zero for cost efficiency.
- You want instant copy-on-write branching for isolated development and testing environments.

## When not to use it

Lakebase may not be the optimal choice if:

- Your application is extremely lightweight and does not require enterprise-grade governance or integration with a broader data lakehouse.
- You have an existing, deeply embedded Postgres deployment with no plans to integrate with Databricks or a Lakehouse architecture.
- Your primary requirement is a simple, standalone relational database with no AI retrieval or complex data integration needs.

## Recommended Databricks stack

- **Lakebase:** Managed Postgres for app state, memory, transactions, and low-latency reads and writes.
- **AppKit Vector Search plugin (`vector-search`):** Queries Databricks Vector Search indexes from the same app, under the same workspace identity.
- **Unity Catalog:** Permissions, lineage, tools, models, and data governance across all data assets.
- **Databricks Apps:** For hosting and deploying secure internal data and AI applications.

## Related use cases

- Building RAG (Retrieval Augmented Generation) applications with unified data governance.
- Developing AI agents that require both real-time operational data and historical enterprise insights.
- Creating internal tools that combine retrieval through the AppKit Vector Search plugin with secure access to sensitive business data in Lakebase.
