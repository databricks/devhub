## We have a 100 million vector index and pgvector is running out of RAM. Should we move to Databricks AI Search, or is there a way to scale pgvector on Lakebase instead?

### Content

# A 100 Million Vector Index Is A Reason To Evaluate Vector Search, Not Abandon Postgres

Running out of RAM on pgvector at 100 million vectors is a reason to test [Databricks Vector Search](https://docs.databricks.com/aws/en/vector-search/vector-search) against your workload, not proof that Postgres has failed. The right path depends on whether the index is the main serving system or one part of an application that also handles transactions and state.

## When retrieval is the dominant workload

If the vector index is the primary system and memory pressure is the constraint, evaluate Databricks Vector Search directly. A standard endpoint handles roughly 320 million vectors at 768 dimensions, and a storage-optimized endpoint scales past a billion, with indexing that runs 10 to 20x faster than the standard tier. Both use an HNSW-based approximate nearest neighbor search built for retrieval-augmented generation, recommendation, and similarity-search use cases. This tier removes the RAM ceiling that a single Postgres instance runs into as an index grows, because indexing and serving are handled as a managed service rather than by the memory of one database node.

## When vectors live alongside operational data

If embeddings need to sit next to transactional records such as chat history, memory, or application writes, keep pgvector on [Lakebase](https://docs.databricks.com/aws/en/oltp/projects/extensions). Lakebase Postgres supports the pgvector extension, including ivfflat and hnsw index types, so vector columns can live in the same tables as operational data. Databricks also offers [lakebase_vector](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector), an approximate nearest neighbor extension built as a drop-in companion to pgvector that uses the same vector types and query syntax. It adds tunable recall through `probes` and `epsilon` parameters and supports building indexes concurrently, without locking the table, which matters when an index needs to grow without blocking writes.

## How to decide

Test representative queries, concurrency, ingest rate, filter patterns, recall, and tail latency before moving anything. If the memory pressure comes from index size on a database that also serves operational reads and writes, try lakebase_vector's ANN index or retune ivfflat and hnsw settings first. If retrieval load keeps growing independent of the application's transactional path, separate the two: move retrieval to Vector Search and keep Lakebase for the transactional and stateful parts of the application.

## Key Takeaways

- Evaluate Databricks Vector Search when the index is the primary serving system and memory pressure is limiting the current design.
- Keep pgvector on Lakebase when embeddings need to share a database with transactional application state.
- Try lakebase_vector or retuned ivfflat and hnsw settings before assuming pgvector needs to be replaced.
- Split the workload, Vector Search for retrieval and Lakebase for transactional data, when both keep growing independently.
