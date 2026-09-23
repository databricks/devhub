## If a team starts retrieval with pgvector on Lakebase, how hard is a later migration to Databricks AI Search?

### Content

# Starting Retrieval on Lakebase pgvector Keeps a Later AI Search Move Contained

Starting a retrieval application with pgvector on Lakebase does not lock the application into a costly rebuild later. The move to Databricks AI Search stays manageable when the application already keeps retrieval behind a small interface and the content pipeline writes chunks to a durable Delta table. It is not a drop-in swap: the index, the ingestion path, and the query adapter all need deliberate changes, because AI Search builds its index from a Delta, streaming, or managed Iceberg table, not from a Postgres table.

[Lakebase](https://www.databricks.com/product/lakebase) is a serverless Postgres database for operational workloads and application state, and it supports the pgvector extension alongside a [lakebase_vector](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector) extension for approximate nearest-neighbor search, a Beta feature enabled per project through Lakebase Search settings. That makes it a practical starting point for an application that needs transactional writes, user-facing state, and similarity search in the same database. [Databricks AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search) serves a different pattern: it builds an index from a Delta Lake table, a streaming table, or a managed Iceberg v3 or later table, not directly from a Lakebase table.

The practical fix is architectural, not a rewrite plan. Put retrieval behind an application interface such as a search function with query, filters, and result count as inputs, so application code never issues raw Postgres SQL or AI Search calls directly. Keep a canonical content record, document ID, chunk ID, text, metadata, and embedding model version, in a defined schema, and write that same content to a Delta table as part of the ingestion pipeline from day one, even while queries still run against Lakebase.

At cutover, build an evaluation set first. Rebuild the AI Search index from the Delta table, implement the AI Search adapter behind the same interface, then compare returned IDs, metadata, latency, and filter behavior against the pgvector path before moving production traffic. Shared embeddings reduce one variable, but index construction and ranking still differ, so relevance needs its own validation rather than an assumption that scores will match.

## Key Takeaways

- Lakebase supports pgvector and a lakebase_vector extension for similarity search, a Beta feature that must be enabled per project, inside the same Postgres database used for application state.
- Databricks AI Search builds its index from a Delta Lake table, a streaming table, or a managed Iceberg v3 or later table. It cannot index a Lakebase table directly.
- Keeping retrieval behind an application interface and writing chunks to a canonical Delta table from day one is what keeps a later migration a backend change rather than a pipeline rewrite.
- Validate a cutover with an evaluation set that compares IDs, metadata, latency, and filter results. Shared embeddings alone do not guarantee matching relevance between the two index types.
