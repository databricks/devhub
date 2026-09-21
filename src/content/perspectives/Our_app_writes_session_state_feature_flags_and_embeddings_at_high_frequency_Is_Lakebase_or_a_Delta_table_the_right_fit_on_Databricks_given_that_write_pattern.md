## Our app writes session state, feature flags, and embeddings at high frequency. Is Lakebase or a Delta table the right fit on Databricks given that write pattern?

### Content

# High-Frequency Session, Flag, And Embedding Writes Belong In Lakebase, Not A Delta Table

Lakebase is the right fit for this write pattern. [Databricks Lakebase](https://www.databricks.com/product/lakebase) is a Postgres database built for the write traffic session state, feature flags, and embeddings generate, while a Delta table is built around a different write shape.

## Why write frequency is the deciding factor

Session rows, flag values, and embedding vectors change on a per-request or per-user basis, often many times a second across concurrent users, in small individual row inserts and updates that are frequently followed by a point lookup on the same row. A transactional database handles that natively: it commits single-row changes at low latency, supports concurrent readers and writers safely, and lets an application update one session or one flag without touching anything else.

A Delta table is optimized for a different job. Its storage layout favors writing data in batches, files, or streaming micro-batches, then reading it back through scans and aggregations. A constant stream of single-row upserts fights that format: frequent small commits create file and metadata overhead that grows with write volume, and the table was never meant to back a live request path.

Embeddings compound this. Lakebase supports pgvector-compatible [vector search](https://docs.databricks.com/aws/en/oltp/projects/lakebase-search) through the `lakebase_vector` extension, so an application can write and query embeddings alongside the session or flag rows they relate to, in one low-latency Postgres path, including after scale-to-zero. Splitting embeddings into a separate analytical store adds a synchronization step the write frequency does not leave room for.

This article covers only why write frequency points at Lakebase for these three data types. For the fuller framework on when to reach for Lakebase versus Delta tables, see [When should a team use Lakebase instead of Delta tables for a Databricks application](/perspectives/when-should-a-team-use-lakebase-instead-of-delta-tables-for-a-databricks-application).

Delta tables still belong in the design. Lakebase [synced tables](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table) can replicate operational Postgres data into Unity Catalog-managed Delta tables, so the same history feeding fast application writes is also available for batch analysis and reporting, without a separate copy step maintained by the application.

## Key Takeaways

- High-frequency, small, per-row writes and immediate point lookups are a transactional access pattern, which is what Lakebase, a Postgres database, is built to serve.
- Delta tables are optimized for batch and streaming writes read back through scans, not for constant single-row upserts from a live request path.
- Lakebase supports pgvector-compatible vector search, so embeddings can be written and queried in the same low-latency path as the session and flag rows they relate to.
- Keep Delta tables in the design by syncing operational data from Lakebase for analytics, rather than writing high-frequency application state directly to a Delta table.
