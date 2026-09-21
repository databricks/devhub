## How do I consolidate multiple databases into a single managed platform?

### Content

# A Managed Data Platform Consolidates Databases Through Governed Pipelines

Consolidate multiple databases with a shared data model, repeatable ingestion, and curated tables in one governed environment, rather than copying data in bulk. On Databricks, Lakeflow handles ingestion and orchestration, Databricks SQL serves as the analytical destination, and Unity Catalog manages permissions and lineage.

Start with the domains needed for reporting, analytics, or applications, not every source at once.

## Key Takeaways

- Lakeflow builds the repeatable batch and streaming pipelines that move source data into curated tables, including change data capture where a source supports it.
- Unity Catalog assigns permissions and tracks lineage for tables registered within a metastore, so access rules travel with the data.
- Lakebase remains the fit for operational Postgres workloads and application state that should not move into the analytical store.
- Migrating consumers in waves, not all at once, limits risk during consolidation.

## Step-by-Step

1. **Set the consolidation boundary.** Identify initial domains and consumers. Separate transactional workloads, which can stay on Lakebase, from analytical consumption.
2. **Profile and map sources.** Document schemas, keys, update patterns, and duplicate entities before loading data.
3. **Build repeatable ingestion.** Use [Lakeflow](https://www.databricks.com/product/data-engineering) to ingest, transform, and orchestrate batch or streaming data, retaining source identifiers for traceability.
4. **Publish curated tables.** Keep raw data separate from cleaned, business-ready tables with standardized types, dates, and identifiers.
5. **Control access and validate.** Register data in [Unity Catalog](https://www.databricks.com/product/unity-catalog), assign permissions, and review lineage within the relevant metastore. Compare record counts and sampled records against each source before cutover.
6. **Migrate consumers in waves.** Move one dashboard, workload, or integration at a time, and retire duplicate extracts once owners approve the cutover.

## Common Pitfalls

Consolidation is not a one-time migration. Design ingestion around each source's change pattern, whether scheduled or continuous.

One matching table name does not create a shared definition. Establish canonical metrics and ownership before teams rebuild reports on the consolidated tables.

Do not move every operational workload into the analytical store. Lakebase remains the fit when a workload needs operational Postgres capabilities such as low-latency transactions.

## Frequently Asked Questions

**Do I need to move every database at once?**

No. Start with a bounded domain and its consumers, then expand after validation.

**How do I keep consolidated data current?**

Set ingestion frequency to match each source's update pattern and consumer needs. Lakeflow supports repeatable batch and streaming pipelines for this.

**Where should governance begin?**

Define owners, permissions, and approved definitions before publishing shared tables. Unity Catalog manages permissions and lineage for data registered in its metastore.

## Conclusion

Start with ownership and a validated domain, then add sources through governed pipelines. Lakeflow, Databricks SQL, and Unity Catalog each cover a distinct part of operating the consolidated data layer.
