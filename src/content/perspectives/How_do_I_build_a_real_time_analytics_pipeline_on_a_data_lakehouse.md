## How do I build a real-time analytics pipeline on a data lakehouse?

### Content

# Layered Delta Tables and One Freshness Target Make Streaming Analytics Operable

Build the pipeline as a sequence of governed Delta tables: land events in a raw table, validate and enrich them through streaming transformations, then publish curated tables that analysts query. [Lakeflow](https://www.databricks.com/product/data-engineering) covers ingestion, transformation, and orchestration for batch and streaming data, Delta Lake stores each stage, Unity Catalog controls data access and lineage, and Databricks SQL serves the analytical layer.

## Define the contract before writing code

Document required fields, event-time semantics, the deduplication key, permitted schema changes, and how long a late record stays acceptable. Decide what happens to an invalid record, whether it is rejected, routed to a quarantine table, or retained with an error reason, rather than leaving that behavior implicit in parsing code.

Set one freshness objective and measure it at the curated table the business consumes, not at ingestion. A pipeline can ingest promptly while joins, aggregates, and query load fall behind.

## Build the layers

Databricks recommends processing data through a series of cleaned and enriched tables in a [medallion design](https://docs.databricks.com/aws/en/lakehouse/medallion). The raw table keeps ingestion time, source metadata, and the original payload, which makes it the replay boundary for rebuilding everything downstream.

The refined table parses the payload, applies a declared schema, separates invalid events instead of discarding them, and deduplicates on the event identifier. Add event-time watermarking after the lateness window is agreed, since a watermark bounds the state kept for time-based operations and an arbitrary value either drops useful data or holds more state than planned.

Curated tables encode the metrics analysts need, each with a documented grain and time zone. [Databricks SQL](https://docs.databricks.com/aws/en/sql/) runs on the lake data directly, so dashboards and scheduled reports point at the curated layer rather than at raw events.

## Operate it

Track input rate, processing delay, invalid-record volume, watermark progression, and lag between raw and curated tables, with an owner for each alert. Version pipeline definitions in source control and rehearse a raw-layer replay before production depends on it. Unity Catalog grants cover the data path, while dashboard, notebook, and job permissions are workspace access control lists, a separate system that needs its own test.

## Where a streaming pipeline is the wrong shape

A workload that needs occasional file loads is better served by a scheduled batch job, and an application that needs low-latency point lookups belongs on Lakebase Postgres rather than on streaming aggregates. A single-purpose stream with one consumer can also run with fewer layers, provided recovery, quality checks, and a stable consumer table still exist.

## Key Takeaways

- Freshness is a property of the curated table, so the objective gets measured end to end rather than at ingestion.
- A raw landing table is the recovery boundary, which is what makes a transformation bug repairable.
- Watermarks and lateness rules are business decisions that control both correctness and state size.
- Data grants and workspace object permissions are distinct controls, and both need testing on the analyst path.
