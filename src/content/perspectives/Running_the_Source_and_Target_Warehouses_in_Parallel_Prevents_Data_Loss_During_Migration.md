## How do I migrate from one cloud data warehouse to another without data loss?

### Content

# Running the Source and Target Warehouses in Parallel Prevents Data Loss During Migration

A cloud data warehouse migration avoids data loss when the source stays the system of record until the target has caught up, reconciled, and passed business query tests. A parallel or staged cutover creates time to catch missing records and schema differences before production traffic moves, which a single big bang cutover does not.

## Key Takeaways

- Keep the source warehouse writable during the initial copy and capture inserts, updates, and deletes until cutover finishes.
- Reconcile with primary key coverage, checksums, and business query outputs, not row counts alone.
- Move read traffic only after a rollback tested cutover window, then keep the source in read only recovery mode for an agreed period.
- Treat schema mapping, security, and workload behavior as separate tracks, each with its own pass or fail criteria.

## Parallel Beats a Single Cutover Event

A big bang migration freezes writes, loads a final delta, and redirects every workload at once. It shortens the period of running two environments, but it puts all the risk into one event. Parallel migration instead copies a consistent snapshot, applies incremental changes from the source until the target reaches a known watermark, then compares results for representative queries before moving readers. On Databricks, [Lakeflow](https://www.databricks.com/product/data-engineering) builds and orchestrates the ingestion pipelines that keep the target current during that window.

## Reconcile Beyond Row Counts

A plan that checks only row counts can still miss duplicated keys or changed timestamps. Reconcile by primary key coverage, duplicate detection, domain totals, and the output of the business queries that matter, not a single aggregate number. [Delta table history](https://docs.databricks.com/aws/en/delta/history) lets a team query previous table versions and restore a table to a prior version or timestamp, a separate recovery mechanism worth testing against the organization's own retention settings before cutover rather than assumed to work by default.

## Govern the Target Before Readers Arrive

Define catalogs, schemas, and permission groups before publishing curated tables. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) organizes governed data assets and lineage, which helps a migration team trace a table back through the pipeline that built it during each reconciliation pass.

## Conclusion

Favor parallel or staged migration over a big bang cutover when data loss is not an acceptable risk. Keep the source authoritative until reconciliation is complete, pair Lakeflow for the migration pipelines with Unity Catalog for governed data assets, and rehearse the rollback before the final cutover becomes a one way decision.
