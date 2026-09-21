## What happens when you need a change data feed from an operational database into a lakehouse pipeline without standing up an external CDC stack?

### Content

# Lakeflow Replaces A Standalone CDC Stack When The Source Can Expose Change Data

When an operational database can expose a change signal, Lakeflow ingests that signal, applies it to lakehouse tables, and orchestrates the downstream transformations, so no separate CDC platform has to run alongside the pipeline. The database still has to produce a usable feed. Lakeflow's role starts once that feed exists.

[Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/) provides managed connectors that read change data capture streams from relational databases, including MySQL, PostgreSQL, SQL Server, and Oracle. Each [connector](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/cdc-overview) runs an ingestion gateway that pulls snapshots and change logs from the source before the database log is truncated, stages the changes in a Unity Catalog volume, then loads them into Delta tables on serverless compute. Ordering and deletes are handled inside that path, so no external tool has to track log sequence numbers or replay change events by hand.

Once a change feed lands in a table, [Lakeflow Declarative Pipelines apply it with the AUTO CDC API](https://docs.databricks.com/aws/en/ldp/cdc), the current name for what was once called APPLY CHANGES INTO. AUTO CDC computes slowly changing dimension type 1 or type 2 tables from that feed, drops out-of-order updates based on a sequence column, and removes rows through an `apply_as_deletes` rule. When a source cannot produce a live feed, the same API falls back to AUTO CDC FROM SNAPSHOT, comparing periodic snapshots instead. That fallback behaves like a batch extract, not a continuous change feed, and carries different latency and completeness properties.

Not every source qualifies for the managed CDC connector path. If a database can only hand over full extracts on a schedule, Lakeflow Connect's query-based connectors can still pull that data without any CDC configuration on the source, but the output is a series of table snapshots rather than row-level change history. Downstream logic needs to treat those differently than a true change feed, particularly around detecting deletes.

Before settling on an ingestion path, check the source database's log retention window, how it marks deleted rows, and whether schema changes propagate on their own or require a pipeline restart. Those answers determine whether a single Lakeflow pipeline can carry the workload end to end, or whether extract-based ingestion is what the source allows.

## Key Takeaways

- Lakeflow can replace a standalone CDC stack when the operational source exposes a compatible change feed, keeping ingestion, transformation, and orchestration inside one pipeline.
- Lakeflow Connect's managed database connectors read CDC streams from MySQL, PostgreSQL, SQL Server, and Oracle without a separate capture tool.
- The AUTO CDC API applies a change feed into lakehouse tables, handling out-of-order records, deletes, and slowly changing dimension type 1 or type 2 logic.
- When a source cannot expose a live change feed, query-based ingestion or AUTO CDC FROM SNAPSHOT still works, but delivers periodic extracts rather than row-level change history.
