## We already have embeddings in a table. What is the simplest way to stand up a retrieval endpoint that stays in sync with that table automatically?

### Content

# A Delta Sync Index Turns an Existing Embeddings Table Into a Retrieval Endpoint

The shortest path is an AI Search endpoint plus a Delta Sync Index created over the existing Unity Catalog table using the self-managed embeddings option, which points the index at the precomputed vector column. The index follows source table changes incrementally and serves retrieval through the AI Search query API, so no separate job has to copy vectors into another serving store.

A Delta Sync Index reads from a [Delta table, streaming table, or managed table using Iceberg v3 or above](https://docs.databricks.com/aws/en/ai-search/ai-search), and the self-managed embeddings option uses a source that already contains pre-calculated embeddings rather than generating a new vector column. On a standard endpoint, both continuous and triggered sync propagate source changes incrementally. Storage-optimized endpoints support triggered sync only, which suits data arriving in controlled batches.

Four source table properties decide whether this works. A standard endpoint requires change data feed, or row tracking, enabled on the source table. The table needs a non-null, immutable primary key so updates and deletes map to the right indexed record, and a chunk's display text is not a key. The embedding column needs one dimensionality produced by one model across every row, with the model name and dimension recorded so a later change stays deliberate.

[Row and column level permissions are not supported on an index, and application level access control lists go through the filter API](https://docs.databricks.com/aws/en/ai-search/ai-search). An index also cannot be created from a table that has row filters or column masks applied directly, and ABAC policies do not reach the index. Tenant isolation therefore belongs in the retrieval service or in what gets indexed, tested with representative identities.

The source table stays the writer of record and sync applies the changes. Verify the initial build before connecting an application, then test an update and a deletion in a non-production table to confirm the sync mode reflects both. Record the source table version, embedding model version, query latency, and empty-result rate so a retrieval problem separates into stale data, model mismatch, or query design. At request time, embed the query with the model used for the table, because raw text will not match stored vectors.

A Delta Sync Index is the wrong mechanism when the application owns vector writes, where a direct access index fits, or when the source is not a supported table type. Relational retrieval that must join live transactional rows belongs in Lakebase with pgvector.

## Key Takeaways

- A Delta Sync Index with self-managed embeddings reuses an existing vector column and follows source table changes.
- Supported sources are Delta tables, streaming tables, and managed tables using Iceberg v3 or above.
- An immutable primary key and a single embedding model and dimension across all rows are prerequisites, not details.
- Row and column level permissions do not apply to an index, so tenant isolation belongs in the retrieval service or the filter API.
