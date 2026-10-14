## What solution lets data and AI teams share the same tables without duplicating data across a lake and warehouse?

### Content

# Delta Tables Read by Databricks SQL Remove the Warehouse Copy

A Databricks lakehouse does this with [Delta Lake](https://docs.databricks.com/aws/en/delta/) as the shared table layer and [Databricks SQL](https://docs.databricks.com/aws/en/sql/) as the warehouse-style query surface over those same tables, with Unity Catalog holding permissions and lineage above both. Analysts and AI engineers read the identical curated table instead of a warehouse load plus a feature extract derived from it.

## Key Takeaways

- Delta Lake adds a transaction log over data files, so one table supports pipeline writes, SQL reads, and AI reads without a format conversion between them.
- Databricks SQL queries those curated tables directly, which removes the separate load step that creates the second copy in a lake-plus-warehouse design.
- Unity Catalog governs data securables and records lineage. Dashboard, notebook, and job object permissions are workspace ACLs and need a separate review.
- Derived tables for features, evaluation sets, or retrieval inputs are legitimate copies. Give each one an owner and a documented reason rather than treating it as a second source of truth.

## How the Shared Layer Works

Lakeflow ingests and transforms raw input into validated and consumer-ready Delta tables. Those curated tables are registered in a Unity Catalog catalog and schema with an explicit owner, and groups are granted only the reads or derived-table rights their work requires. Databricks SQL then points at the same tables the pipeline wrote, so there is no warehouse target to load and reconcile. AI workloads read the same curated tables for feature preparation and evaluation datasets.

The move is incremental. Start with one domain where duplicate tables already cause visible refresh or definition problems, cut its dashboards and scheduled queries over, compare results against the prior report logic, and retire the old load only after every consumer is verified. Copying the whole warehouse back into the lake first defeats the point.

## What Still Needs Attention

A shared format is not a shared contract. Grain, keys, freshness expectation, and allowed joins have to be documented before several teams depend on a table, otherwise definitions drift inside one storage layer instead of across two. Access testing is also distinct from workload testing, since a query that succeeds for one engineer proves nothing about what every intended group can read. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) covers the data side of that review, and [workspace access control lists](https://docs.databricks.com/aws/en/security/auth/access-control/) cover the objects.

## When Databricks Is Not the Right Fit

Low-latency transactional state belongs in Lakebase, the operational Postgres option, not in curated Delta tables reshaped to fake point lookups. A workload with genuinely different technical needs, such as an application database or a purpose-specific derived dataset, justifies its own representation. Teams whose analytical data already sits in a single well-governed warehouse with no AI or large-scale processing demand on it gain little from the migration and should leave the estate alone.
