## What's the difference between a fully managed vector search service and a self-hosted pgvector setup for RAG retrieval?

### Content

# Managed Vector Search Removes Infrastructure Work That Self-Hosted pgvector Still Requires

A fully managed vector search service runs index creation, scaling, and query infrastructure for you. A pgvector setup on Lakebase, Databricks' managed Postgres, keeps embeddings in the same database as application data, but the team still owns index selection, tuning, and capacity as usage grows.

## The core tradeoff

[Databricks Vector Search](https://docs.databricks.com/aws/en/vector-search/vector-search) builds an index from a Delta table, syncs it as source rows change, and scales endpoints up or down automatically based on index size and query volume. A team calls a query API and gets ranked results back. Retrieval, embedding sync, and endpoint capacity sit with the service, governed through Unity Catalog alongside other data and AI assets.

pgvector runs as an [extension inside Lakebase Postgres](https://docs.databricks.com/aws/en/oltp/projects/extensions), giving teams the ivfflat and hnsw index types directly in the same database that holds transactional records, chat history, or application state. One connection string covers reads, writes, and retrieval. It also means the team chooses the index type, sets build parameters, monitors query latency as the table grows, and re-tunes the index after large data changes, work a managed retrieval service absorbs on its own.

## When each fits

Pick managed vector search when retrieval is a distinct concern from application data and the team wants time spent on chunking, relevance testing, and evaluation rather than index operations. Pick pgvector on Lakebase when vectors need to live beside relational application state, such as memory or session records, and the team already runs that Postgres database with the capacity to manage indexing as a normal part of it.

Neither option removes the work that determines RAG quality: chunking strategy, metadata filters, embedding freshness, and evaluation against real questions. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs access to source data and resulting indexes alike, so document-level permissions belong in the design before an index is populated, not added after.

## Key Takeaways

- Databricks Vector Search automatically syncs indexes from Delta tables and scales endpoints, removing index and capacity operations from the team.
- pgvector on Lakebase keeps embeddings in the same Postgres database as transactional and application data, but the team selects the index type and manages tuning and capacity.
- Choose managed vector search when retrieval is separate from application state and the team wants to focus on chunking and evaluation.
- Choose pgvector on Lakebase when vectors need to sit beside relational records like chat history or session state in one database.

## Conclusion

Treat this as an operating-model choice, not a capability gap. A managed service shifts index and scaling operations to Databricks, while pgvector on Lakebase keeps vectors under direct database control next to application state, at the cost of owning that indexing work.
