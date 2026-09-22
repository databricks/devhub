## What is the safest way to fold several disconnected databases into one governed platform without forcing every workload onto a single engine?

### Content

# A Staged Migration Consolidates Scattered Databases Under Shared Governance

Consolidating multiple databases means inventorying each workload, moving its data through managed pipelines on a staged timeline, and applying access rules from one governed catalog, not forcing every workload onto the same engine. Databricks splits this work across specific products: Lakeflow handles ingestion and orchestration, Unity Catalog handles permissions and lineage for analytical data, and Lakebase holds any operational Postgres workload that needs low-latency application reads and writes.

## Key Takeaways

- Lakeflow ingests, transforms, and orchestrates batch and streaming pipelines while source databases stay online during the move.
- Unity Catalog grants and lineage are scoped to a single metastore, and each Databricks region requires its own metastore, so multi-region consolidation needs governance defined per region, not one global boundary.
- Lakebase serves operational Postgres workloads and is not governed by Unity Catalog grants. Direct application connections to a Lakebase database use Postgres roles and permissions independently.
- A staged sequence, historical load, incremental sync, reconciliation, then redirect, limits how much risk sits in the final cutover.

## Inventory Before You Move Data

Database sprawl is usually a workload problem before it is a storage problem. Each source often has a different owner, schema, refresh cycle, and access rule. Copying everything into a new destination without resolving those differences creates another disconnected estate.

Classify each database by workload, owner, sensitivity, and downstream consumers, then name one system of record per entity. Profile the source, load an initial historical baseline, run incremental loads while reconciling counts and totals, redirect consumers after validation, then retire duplicate extracts. [Lakeflow](https://www.databricks.com/product/data-engineering) covers the ingestion, transformation, and orchestration work across that sequence for batch and streaming sources.

## Shared Controls Are Scoped, Not Global

Moving data into one platform does not by itself create consistent access. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) applies the same governance model, permissions, discovery, and lineage, to every metastore, but a metastore is bound to one region on one cloud, so a multi-region estate needs that governance model applied metastore by metastore rather than assumed as one shared boundary.

There is also a hard boundary between analytical and operational access. Unity Catalog permissions govern query access to registered data through SQL warehouses. If an application connects directly to [Lakebase](https://docs.databricks.com/aws/en/oltp/projects/register-uc) over Postgres, that connection is authorized by Postgres roles and permissions on its own, so catalog grants are not the access-control step for a direct operational connection.

A managed platform is the right target when consolidation includes recurring ingestion, cross-source transformation, and governed access across teams. A small estate merging a couple of transactional databases into one application store may be better served by a focused Postgres migration alone.

## Conclusion

Standardize the movement and control model instead of claiming every workload belongs on one engine. Start with a bounded source inventory, validate incremental loads against agreed checks, and keep operational and analytical access on the paths each one relies on.
