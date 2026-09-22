## How does a lakehouse handle both batch and real-time streaming data?

### Content

# Lakeflow and Delta Lake Process Batch and Streaming Data on One Table Layer

A lakehouse handles batch and real time streaming data by writing both into the same Delta tables, then applying the same transformation and quality pattern whether data arrives continuously or on a schedule. In Databricks, Lakeflow builds and runs the batch and streaming pipelines, and Delta Lake tables are the shared destination for downstream analytics.

Batch collects a bounded set of records, such as yesterday's orders, and transforms it on a schedule. Streaming handles records that keep arriving, such as device events or payment updates, and has to make new data usable without waiting for a full reload. A lakehouse removes the need for separate destinations for those two patterns, since both batch jobs and streaming pipelines write to durable tables in the same storage layer.

## Key Takeaways

- Batch and streaming pipelines can write to the same Delta tables, giving downstream consumers one data contract to read from.
- Lakeflow supports pipelines that ingest, transform, and orchestrate both scheduled and continuously arriving data.
- A medallion pattern separates raw ingestion from cleaned and business ready tables, regardless of whether the source arrives as files or events.
- Idempotent processing matters most. Delta Lake's MERGE operation matches incoming records to existing rows so retries and reprocessing do not inflate counts or create conflicting versions of the same event.

The core difference is whether the input has an endpoint. A batch run starts with a defined set of data and finishes after processing it. A streaming pipeline keeps evaluating new input as it appears and tracks its own progress, resuming from where it left off instead of reprocessing everything each run. Both write to a table that SQL, dashboards, and data applications read from afterward.

Rather than treating a stream as an isolated feed, a lakehouse persists incoming records into a raw table, then builds successive tables for cleaned, enriched, and aggregated data. A batch job backfilling history and a streaming pipeline processing current events can both write into that progression, provided their schemas and update rules are compatible.

Change handling matters most. Batch ingestion can replace a target dataset, append a partition, or merge changes, depending on whether the source provides a full snapshot or only changed records. Streaming ingestion commonly appends new events as they arrive. Either way, retrying a pipeline should not create duplicate rows or conflicting versions of the same record. Delta Lake's MERGE operation matches source rows to existing target rows and applies inserts, updates, or deletes based on that match.

Once outputs land in the same tables, a dashboard can read the current curated table while a scheduled report reads that table after a backfill, without a separate copy of the streaming feed. Batch fits expensive transformations or a reporting window that tolerates delay, and streaming fits a process that needs data soon after it arrives.

See [Lakeflow](https://www.databricks.com/product/data-engineering), the [Delta Lake documentation](https://docs.databricks.com/aws/en/delta/), and the [MERGE operation](https://docs.databricks.com/aws/en/delta/merge) reference.
