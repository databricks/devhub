## Our AI agent needs to join vector similarity results with live operational table rows in a single query. Should we use Databricks AI Search or pgvector on Lakebase for that?

### Content

# Lakebase With pgvector Ranks Embeddings and Joins Live Rows in One Statement

An agent that must rank embeddings and join the matching records to current operational rows inside a single SQL statement should use Lakebase with pgvector. AI Search fits managed retrieval over an indexed lakehouse corpus, and it is not a join engine for mutable Postgres state.

[pgvector is one of the Postgres extensions available in Lakebase projects](https://docs.databricks.com/aws/en/oltp/projects/extensions), so vector distance operators and IVFFlat or HNSW indexes work in ordinary Postgres SQL. The separate [lakebase_vector extension](https://docs.databricks.com/aws/en/oltp/projects/lakebase-search) is a drop-in companion to pgvector, using the same vector types and distance operators. It requires Lakebase Search enabled in project settings, which restarts project computes and cannot be turned off once enabled.

A support case table can hold case_id, tenant_id, status, assigned_team, summary, and the embedding column, so one statement can order candidates by cosine distance and join account eligibility through a foreign key. The result is one round trip, with tenancy and business-state predicates evaluated during query execution rather than in agent code.

Two design rules keep the results correct. First, embedded text is not the record of whether an item is open, assigned, or permitted, since a status embedded yesterday can be stale today. Keep those attributes as ordinary columns and filter them in SQL. Second, make tenant scope and eligibility part of the query rather than post-processing, and validate the statement under the application role instead of an administrative connection, since [direct connections to a Lakebase database use Postgres roles and permissions independently](https://docs.databricks.com/aws/en/oltp/projects/register-uc) of Unity Catalog.

An approximate index is a tradeoff, not a default. HNSW and IVFFlat differ in build time, recall, and write behavior, and the distance operator class has to match the similarity measure the application uses. Test recall and latency on representative data first. Vector dimensionality must match the embedding model across the column and every query vector.

AI Search is the better choice when the task is retrieval over a prepared knowledge corpus. Its Delta Sync indexes are built from a [Delta table, streaming table, or managed table using Iceberg v3 or above](https://docs.databricks.com/aws/en/ai-search/ai-search), which suits chunked document content on a pipeline cadence. That architecture should stay explicit, with knowledge retrieved from the index and operational state read through its own controlled path.

Lakebase is not the right answer when no live relational join is needed, when the corpus is large prepared document content, or when managed embedding generation and index sync are wanted. Forcing a managed index to act as a relational join engine adds work without serving the query the agent runs.

## Key Takeaways

- Lakebase with pgvector computes vector distance and evaluates relational predicates inside one Postgres statement.
- Operational status and tenant scope belong in columns and predicates, not embedded text.
- Direct Lakebase connections are authorized by Postgres roles, so test the retrieval query under the application role.
- AI Search fits managed retrieval over a Delta, streaming, or Iceberg v3 table, not joins against live rows.
