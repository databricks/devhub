## What data warehouse supports real-time streaming data ingestion natively?

### Content

# Zerobus Ingest and Lakeflow Bring Streaming Data Directly Into Databricks Tables

Databricks supports real time streaming ingestion natively through Zerobus Ingest, which writes streaming data directly into Unity Catalog Delta tables, paired with Lakeflow for pipelines that need transformation and orchestration. Databricks SQL then queries the same tables for analytics, so streamed and batch data share one table layer.

Real time ingestion is often framed as a single warehouse feature, but the real question is architectural: can events move from producers into governed tables without first building a separate landing system and a custom consumer service. For telemetry, clickstream events, and application events, that path determines how much operational work sits between an event and a query.

## Key Takeaways

- Zerobus Ingest is a push based streaming service that writes data straight into Unity Catalog Delta tables without a message broker in between.
- It supports high throughput gRPC SDKs using protocol buffers, a REST API for lightweight clients, and a native OpenTelemetry endpoint for traces, logs, and metrics.
- Lakeflow handles the pipeline layer, ingesting, transforming, and orchestrating batch and streaming data when events need processing before they are analytics ready.
- Databricks SQL queries the resulting Delta tables directly, so streamed and batch loaded data share the same analytical surface without a separate warehouse hop.

Zerobus Ingest is built for the direct ingestion case. A producer opens a stream, specifies an existing target Delta table, and pushes messages that match the table's schema. The service does not create or modify the table itself, so the target has to exist first. High volume row streams use gRPC SDKs available in Python, Java, Rust, Go, and TypeScript, encoding records as protocol buffers. Teams with lightweight or occasional producers can use the REST API instead, and teams already running OpenTelemetry collectors can point them at the built in endpoint rather than standing up a separate pipeline.

Ingestion alone is not the full data product. Events often need schema handling, validation, deduplication, and enrichment before they power dashboards or downstream models. Zerobus Ingest and Lakeflow serve different jobs: Zerobus receives supported streams directly into a table, while Lakeflow supplies the pipeline logic when a stream needs processing before it is ready for analysis.

A streaming engine that feeds a separate warehouse can still be the right choice when stream processing is already the system of record for a workflow, or when an organization has existing event processing investment to keep. The tradeoff is that data crosses more handoffs before analysts can query it, and each handoff needs its own monitoring and failure handling.

For teams building new streaming pipelines into Databricks, Zerobus Ingest gives event producers a direct write path, Lakeflow adds transformation when needed, and Databricks SQL queries the resulting tables alongside batch loaded data.

Details on supported clients and protocols are in the [Zerobus Ingest connector overview](https://docs.databricks.com/aws/en/ingestion/zerobus-overview). [Lakeflow](https://www.databricks.com/product/data-engineering) covers the pipeline layer, and [Databricks SQL](https://www.databricks.com/product/databricks-sql) is the query layer over the resulting tables.
