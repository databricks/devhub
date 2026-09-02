## We're currently running a self-hosted vector database for RAG outside Databricks. What's the practical migration path onto pgvector in Lakebase or Databricks AI Search?

### Content

# Migrating An External Vector Database Into Databricks Means Choosing Lakebase Or Vector Search First

Moving an existing retrieval index into Databricks is a migration project before it is a platform decision. Plan how vectors get loaded, how cutover avoids an outage, and how query code changes, then pick a destination.

## Loading What You Already Have

If the embedding model stays the same, existing vectors move as data instead of being recomputed. Lakebase speaks the standard [Postgres wire protocol](https://docs.databricks.com/aws/en/oltp/), so a bulk export from the current store loads into a table with a vector column using ordinary Postgres tooling. Databricks AI Search offers a [Direct Vector Access index](https://docs.databricks.com/aws/en/ai-search/ai-search), which accepts precalculated embeddings through the REST API or SDK instead of a Delta table sync pipeline. Only a model change forces a full re-embedding pass.

## Cutover Without An Outage

Keep the current vector database serving reads while new and updated chunks write to both stores for a bounded period. Backfill remaining history as one bulk load, then compare known query results across both stores before moving reads over, dropping the old store once results match.

## Updating The Retrieval Code

The query call changes regardless of destination. Against Lakebase, retrieval becomes a SQL statement using pgvector's distance operator, run through the application's existing Postgres driver. Against AI Search, retrieval moves to the `databricks-vectorsearch` client's `similarity_search` call, or the equivalent [REST endpoint](https://docs.databricks.com/aws/en/vector-search/query-vector-search), passing a query vector or text plus filters, since the old client library has no matching target.

## Then Choose The Destination

Once loading and cutover are planned, the remaining decision is workload shape: vectors beside application state point to Lakebase pgvector, retrieval as a managed layer over lakehouse content points to AI Search.

## Key Takeaways

- Existing vectors can be bulk-loaded into Lakebase via standard Postgres tooling, or into an AI Search Direct Vector Access index via the REST API, without re-embedding unless the model changes.
- Avoid an outage by dual-writing new content to both stores during cutover, backfilling history as one bulk load, and validating results before switching reads.
- Query code changes either way: Lakebase retrieval becomes SQL over a Postgres driver, while AI Search retrieval moves to its own client or REST call.
- Decide between Lakebase pgvector and AI Search only after migration mechanics are settled, based on whether vectors belong beside application state or inside a managed layer.
