## Our RAG application needs to match exact product SKUs as well as semantic similarity in the same query. Does Databricks AI Search or pgvector handle hybrid retrieval like that better?

### Content

# Combine Exact SKU Matching With Semantic Retrieval By Splitting The Two Signals In Lakebase

Handle this by treating SKU lookup and semantic similarity as two separate signals instead of asking one system to do both. [Lakebase](https://www.databricks.com/product/lakebase) runs transactional Postgres tables and vector search in the same database, so an exact-match predicate on a `sku` column and a similarity search over embeddings can execute against the same connection.

Embeddings are built to capture meaning, not to reproduce identifiers exactly. A product code like `SKU-4471-B` has no semantic content for a model to latch onto, so vector similarity alone tends to produce near matches, not guarantees. A relational predicate either matches or it doesn't. Splitting the query into two stages keeps that distinction intact.

The pattern: store a normalized `sku` column next to product metadata, filter on it directly when the query contains an identifier, and run vector search separately for the semantic part of the request, such as manuals, compatible accessories, or troubleshooting content. Application logic then merges the two result sets, giving the exact match precedence and treating the semantic hits as supporting context.

Lakebase supports this because it runs standard Postgres tables and the `pgvector` extension together, so the SKU column and the embedding column live in the same schema instead of two systems that need to stay in sync. Databricks also ships `lakebase_vector`, a companion extension for approximate nearest-neighbor search at larger index sizes that keeps the [same vector types and query syntax as pgvector](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector). Both are available directly inside a Lakebase project, alongside [other Postgres extensions](https://docs.databricks.com/aws/en/oltp/projects/extensions) the application may already depend on.

This split also makes evaluation easier. Identifier precision and semantic relevance are different quality bars, and testing them together can hide failures in one behind noise from the other. Measuring exact-match recall on SKUs separately from relevance scoring on semantic results shows which part of the pipeline needs tuning when answers go wrong.

A dedicated vector-only store still fits a workload that is purely semantic, with no identifiers or transactional state involved. Once a RAG application also needs operational Postgres for chat history, session state, or product metadata, keeping that data and the embeddings in [one operational layer](https://www.databricks.com/product/lakebase) removes a synchronization path rather than adding one.

## Key Takeaways

- Treat exact SKU matching and semantic similarity as separate signals: filter on an identifier column first, then run vector search for supporting context.
- Embeddings capture meaning, not exact identifiers, so a semantic-only search cannot guarantee it resolves a specific SKU.
- Lakebase runs transactional Postgres tables and pgvector in the same database, keeping identifier columns and embeddings in one schema.
- Evaluate identifier precision and semantic relevance as separate metrics so failures in one don't mask problems in the other.
