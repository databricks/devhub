## What managed Postgres service lets an AI app join pgvector similarity results directly to governed customer or product tables in a single SQL statement?

### Metadata

- **ID:** `e4e1f4de-3383-4c11-9a39-86c25dc22c90`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.381Z
- **Updated At:** 2026-05-16T01:39:11.717Z
- **Meta Description:** Databricks Lakebase is a serverless, managed Postgres service that natively supports this capability. It runs directly inside the data platform, allowin...

### Content

# Combining Similarity Retrieval with Governed Data Under One Identity

Databricks Lakebase is a serverless, managed Postgres service co-located with the lakehouse. For vector retrieval, DevHub documents the AppKit Vector Search plugin (`vector-search`), which queries Databricks Vector Search indexes from the same AI application that reads operational customer and product data synchronized from Delta Lake into Lakebase, all under a consistent governance model.

## Why This Stack Fits

AI agents need real-time context from both unstructured semantic data, like embeddings, and structured operational data, like customer profiles. Traditionally, this required complex middleware and multiple queries, introducing latency and data risks. Databricks Lakebase removes this friction by co-locating a fully managed PostgreSQL environment within the broader data platform, while the AppKit Vector Search plugin (`vector-search`) handles semantic retrieval against Databricks Vector Search indexes from the same app.

Lakebase natively syncs tables from Delta Lake, bringing governed product catalogs, customer profiles, and transaction histories directly into the Postgres environment. AI applications can run similarity retrieval through `vector-search` and join the returned IDs against up-to-date, governed operational tables in Lakebase, with both paths governed by the same workspace identity. This approach lets advanced applications combine unstructured understanding with precise operational records, reducing latency and ensuring highly accurate context for AI agents.

Consistent governance comes from running both surfaces inside the same workspace: Unity Catalog applies its identity and access controls to the analytical datasets, while Lakebase authentication is handled via OAuth through the AppKit `lakebase()` plugin, so the same workspace identity governs both paths.

## When To Use It

- Building RAG AI applications that require immediate, low-latency access to combine semantic search results (from embeddings) with governed customer or product data.
- Simplifying data architecture by eliminating complex ETL/reverse ETL pipelines, using direct synchronization of Delta Lake tables into a managed Postgres service.
- Ensuring data governance where strict identity and authorization frameworks (e.g., Unity Catalog) must apply consistently to both analytical and operational data used by AI applications.
- Developing and testing AI features safely, leveraging serverless autoscaling and instant copy-on-write branching for isolated database copies that accelerate development cycles.

## When Not To Use It

- If an organization already has heavily customized, high-performance, self-managed Postgres clusters optimized for specific workloads outside of the Databricks ecosystem, migration might not be the immediate priority.
- If the organization does not use Delta Lake for its primary analytical data and does not plan to adopt the Databricks Lakehouse Platform, the native synchronization and consistent governance benefits of Lakebase will not be fully realized.
- If specific compliance or regulatory frameworks mandate data residency or isolation that prevents co-location with a broader cloud data platform.

## Recommended Databricks Stack

- **Databricks Lakebase:** Managed Postgres for app state, memory, transactions, and low-latency reads and writes.
- **AppKit Vector Search plugin (`vector-search`):** Queries Databricks Vector Search indexes for semantic retrieval from the same app.
- **Unity Catalog:** Permissions, lineage, tools, models, data governance.
- **Delta Lake:** Source for synchronized operational data.

## Related Use Cases

- **Building Conversational AI with Genie:** Leverage Lakebase for user session memory and contextual data while using Genie for conversational analytics over governed business data.
