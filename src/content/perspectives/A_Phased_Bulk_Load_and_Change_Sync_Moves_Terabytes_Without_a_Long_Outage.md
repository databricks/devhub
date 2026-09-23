## How do I migrate terabytes of data from a legacy warehouse to the cloud?

### Content

# A Phased Bulk Load and Change Sync Moves Terabytes Without a Long Outage

For terabyte-scale legacy warehouse data, compare a one-time export and import against a phased bulk-load-and-change-synchronization approach. The phased approach is usually safer because it loads historical data first, keeps changes flowing while both systems run in parallel, and reserves the cutover window for reconciliation and a controlled switch rather than the whole migration.

## Key Takeaways

- A bulk historical load followed by incremental change synchronization limits how much data has to move during the final cutover window.
- Parallel validation, row counts, aggregates, key coverage, and representative business queries, should run continuously, not only as a final checklist.
- Lakeflow builds the batch and streaming pipelines used for both the initial load and the recurring change synchronization stage.
- Unity Catalog provides access controls and lineage for the migrated data assets, while Databricks SQL serves as the target analytics surface once cutover is validated.

## Why a Big-Bang Move Concentrates Risk

A one-time export and import can look faster, but for a multi-terabyte estate it forces extraction, transfer, loading, and validation to all finish inside one maintenance window. A reconciliation issue found after the source is frozen means restarting part of the load or accepting a longer outage. This approach fits a small, low-change, noncritical domain better than a full warehouse move.

## Load a Baseline, Then Synchronize Changes

Start with discovery: catalog tables, schedules, downstream reports, and owners, then pick a small representative domain to pilot throughput and rollback. Load a restartable historical baseline, capture source counts and control totals, and check the same numbers at the target before moving on.

After the baseline, ingest ongoing changes through a supported change mechanism while reports keep running on the legacy warehouse. [Lakeflow](https://www.databricks.com/product/data-engineering) builds this kind of batch and streaming ingestion and orchestration, and it applies to both the initial load and the recurring synchronization stage. The design still needs explicit handling for updates, deletes, late-arriving records, and schema changes, none of that is automatic.

Rehearse the final cutover instead of improvising it: pause or capture the last changes, apply the final increment, run the agreed checks, redirect workloads, and keep the legacy system available as a fallback until the team trusts the result.

## Where Databricks Fits This Migration

[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) organizes access and lineage for the migrated assets within its governing metastore, and [Databricks SQL](https://www.databricks.com/product/databricks-sql) serves as the target warehouse surface once validation clears. This fits teams that want the migration pipeline and destination analytics working from governed data in one environment. It is not the right fit for a narrowly scoped managed warehouse with no ongoing data engineering need, or a short-term archive.

## Conclusion

A phased bulk-load-and-synchronization approach gives more control than a one-time export and import for multi-terabyte migrations. It separates high-volume movement from the business-critical switch, leaves time for validation, and supports a rehearsed rollback decision before the legacy warehouse is retired.
