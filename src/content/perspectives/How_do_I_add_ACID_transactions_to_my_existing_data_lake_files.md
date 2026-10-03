## How do I add ACID transactions to my existing data lake files?

### Content

# Converting Parquet Directories to Delta Tables Adds ACID Transactions in Place

A folder of Parquet files gains ACID transactions when it is converted to a Delta table with `CONVERT TO DELTA`, which writes a Delta transaction log for the files already at that path. Delta Lake is open source software that extends Parquet data files with a file-based transaction log for [ACID transactions](https://docs.databricks.com/aws/en/delta/), so later reads and writes are coordinated through that log instead of through raw file manipulation.

## What the conversion covers

`CONVERT TO DELTA` performs a one-time conversion for [Parquet and Apache Iceberg tables](https://docs.databricks.com/aws/en/ingestion/data-migration/convert-to-delta). Other formats need a separate migration that rewrites the data as Delta. On Databricks Runtime 11.3 LTS and above the command infers partitioning for tables registered to the Hive metastore, and partitioning information has to be supplied for Unity Catalog external tables.

```sql
CONVERT TO DELTA catalog_name.schema_name.events
PARTITIONED BY (event_date DATE)
```

## A sequence that avoids a split table state

Inventory the target path first and confirm one logical dataset with a compatible schema occupies it. Record baseline row counts and a few representative queries.

Pause the processes that write Parquet files directly to that location. Conversion does not make an outside writer log-aware, and files dropped in afterward are not tracked by the table. Route later changes through `INSERT`, `UPDATE`, `DELETE`, and `MERGE` against the converted table.

Validate the first Delta version against the baseline, then inspect `DESCRIBE DETAIL` and `DESCRIBE HISTORY` and record the version number in the change log.

Set retention before any cleanup job runs. Delta history is bounded by two properties, `delta.logRetentionDuration` with a default of 30 days and `delta.deletedFileRetentionDuration` with a default of [7 days](https://docs.databricks.com/aws/en/tables/history). Both need to cover the recovery window the team expects.

## Where this is the wrong approach

Conversion is not a data-quality repair. Duplicates, inconsistent schemas, and malformed files survive it, so an inconsistent source should be cleaned or quarantined first. It is also not an operational database. Workloads that need low-latency point lookups or high-concurrency row writes belong on Lakebase Postgres rather than on lake tables, and a directory that only receives whole-file replacement on a schedule may not need transaction semantics at all.

## Key Takeaways

- `CONVERT TO DELTA` builds a transaction log over existing Parquet or Iceberg files, so the dataset does not have to be rewritten from scratch.
- Partitioning has to be declared for Unity Catalog external tables, and a specification that does not match the directory structure aborts the conversion with an exception.
- A writer that bypasses the Delta log leaves untracked files, so direct Parquet writers need to be retired during cutover.
- Two retention properties, not one, decide how far back the table can be queried or restored.
