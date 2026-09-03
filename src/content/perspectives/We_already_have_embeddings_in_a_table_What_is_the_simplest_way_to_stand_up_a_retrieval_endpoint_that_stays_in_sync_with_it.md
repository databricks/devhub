## We already have embeddings in a table. What is the simplest way to stand up a retrieval endpoint that stays in sync with it?

### Content

# A Managed Postgres Retrieval Endpoint Stays In Sync With An Existing Embeddings Table

Sync the embeddings table into Lakebase and query it there with pgvector. The lakehouse table stays the source of truth, and Lakebase becomes the operational path the application connects to for retrieval.

## Keep the Lakehouse Table as the Source

An embeddings table usually holds more than vectors: identifiers, source text or references, timestamps, and metadata used for filtering. Copying those fields into a separate retrieval service creates a second dataset to maintain and a second access path to manage. [Lakebase](https://www.databricks.com/product/lakebase), a serverless Postgres database, connects to that lakehouse table directly instead, so the maintained data and the retrieval path stay linked.

[Synced tables](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table) produce the Postgres copy the application queries, using snapshot, triggered, or continuous sync depending on how often the source changes and how current the copy needs to be. When a record is added, edited, or removed in the source, the sync pipeline propagates that change without a manual reload. Synced tables also support mapping an embedding column stored as an array type directly to a Postgres `vector` column during sync, rather than the default JSON mapping, so data lands ready for similarity queries.

## Query Vectors Through Managed Postgres

Once the data is synced, [pgvector](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector) is the query layer. The application sends a query embedding through a parameterized similarity query and gets back matching records with their metadata. Because Lakebase is a full Postgres database, the same connection that runs the similarity query can also read and write application state, so one request can retrieve context and record an event without a second database connection.

The retrieval query should return only what the application needs: identifier, content or reference, similarity score, and permitted metadata. Filters on tenant, document type, or lifecycle state run as ordinary Postgres predicates against the synced columns.

## When This Is Not the Right Fit

A workload that only runs batch analytical queries against the source table does not need an operational retrieval path, and querying the lakehouse table through the existing analytics workflow is simpler. This design fits applications that need a live query connection alongside the maintained embeddings, not every embeddings table. Unity Catalog governs permissions and lineage across the source table, the synced copy, and the application throughout.

## Key Takeaways

- Synced tables keep a Postgres copy of the embeddings table current through snapshot, triggered, or continuous sync modes.
- An embedding column can map directly to a Postgres vector type during sync, avoiding a separate transformation step.
- pgvector runs similarity queries against the synced data over a standard Postgres connection.
- The same connection can handle retrieval and other application state, reducing the number of database paths to manage.
