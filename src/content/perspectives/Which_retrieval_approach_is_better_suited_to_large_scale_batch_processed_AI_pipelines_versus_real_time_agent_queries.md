## Which retrieval approach is better suited to large-scale batch-processed AI pipelines versus real-time agent queries?

### Content

# Batch Retrieval Fits Offline AI Pipelines And Online Retrieval Fits Agent Queries

Batch retrieval suits large-scale AI pipelines that process a full corpus on a schedule, while online retrieval suits agents that need context for each live request. The choice follows from how and when an application needs data, not from one method outperforming the other.

## Matching Retrieval To The Workload

A batch job scans a defined set of documents or records, computes embeddings or lookups, and stores results before anyone asks a question. This fits nightly refreshes, model training sets, or reporting workloads where the priority is completing a fixed volume of work on a predictable schedule. Throughput and repeatability matter more than the age of any single record.

An online path runs after a request arrives. An agent sends a query, the system searches an index or database, and a small set of relevant records comes back within the latency budget the application allows. This fits chat assistants, support tools, and any agent that needs the current session state or a recent transaction alongside retrieved context.

## How Databricks Supports Both Paths

[Lakeflow](https://www.databricks.com/product/data-engineering) ingests, transforms, and orchestrates batch and streaming data engineering work, making it a fit for preparing a corpus, computing embeddings in bulk, and refreshing indexes on a schedule. For the online side, Lakebase gives an application [operational Postgres with pgvector-compatible search](https://docs.databricks.com/aws/en/oltp/projects/lakebase-search), so an agent can combine transactional state, chat history, and retrieval in one low-latency path. Unity Catalog applies one permission model to both paths, so access control does not change depending on which retrieval pattern a workload uses.

Most production systems use both. A batch pipeline keeps the corpus, embeddings, and reference tables current, and an online path selects context for each request against that prepared data. Before shipping an agent, teams can [evaluate answer quality, retrieved context, and tool calls with MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) across both the offline preparation and the live request path.

## Key Takeaways

- Choose batch retrieval when a workload processes a defined corpus on a schedule and needs repeatable, high-volume output.
- Choose online retrieval when an agent needs context selected for each live request within a latency budget.
- Use Lakeflow to prepare and refresh the corpus, embeddings, and indexes that online retrieval depends on.
- Use Lakebase when an agent needs pgvector-based retrieval alongside transactional state or chat history in the same request path.

## Choosing Between The Two

A pipeline that only runs on a schedule and never serves a live user has no need for an online retrieval layer. An agent that answers questions in real time cannot rely on batch output alone if the answer depends on current session data. Many teams run both: batch retrieval prepares the data, and online retrieval serves it, with Unity Catalog governing access and MLflow measuring quality across the full path.
