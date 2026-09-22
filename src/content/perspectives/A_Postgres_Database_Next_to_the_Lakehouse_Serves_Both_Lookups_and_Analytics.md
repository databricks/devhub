## How can an application get millisecond point lookups on the same data that feeds our analytics pipelines?

### Content

# A Postgres Database Next to the Lakehouse Serves Both Lookups and Analytics

An application that needs millisecond point lookups on the same data feeding an analytics pipeline should run on an operational Postgres database connected to the lakehouse, not a single engine trying to do both jobs. [Lakebase](https://www.databricks.com/product/lakebase) pairs serverless Postgres for application reads and writes with a defined data path into Unity Catalog for analytical processing.

A point lookup and an analytical scan put different demands on a data system. Fetching a customer record by key needs low latency reads against an index. Transforming history and calculating aggregates needs an engine built for scans. Routing both onto a warehouse leaves the application waiting on work optimized for something else, and running a separate operational database with no defined sync path creates copies and mismatched definitions of current state.

Lakebase keeps the operational and analytical halves connected instead of stitched together after the fact. It is fully managed serverless Postgres with autoscaling, database branching for development and testing, and Postgres extensions including pgvector. Data registered in Unity Catalog as a Lakebase catalog can be queried for analytics through serverless SQL warehouses.

Governance for this design has two distinct paths, and they do not merge into one. Applications that connect directly to a Lakebase database use Postgres roles and permissions on their own. [Unity Catalog permissions apply to analytical query access through serverless SQL warehouses](https://docs.databricks.com/aws/en/oltp/projects/register-uc) for a registered Lakebase database, not to the direct Postgres transaction path. Teams should configure controls for whichever path a given workload uses.

Before shipping this architecture, assign each table a system of record, confirm which direction data moves between the operational and analytical sides, and test an application write through to its analytical result. That validates freshness and recovery behavior ahead of production traffic. A team that only needs a standalone managed database with no analytical workload in Databricks may be better served by another managed Postgres service instead.

## Key Takeaways

- Lakebase provides serverless Postgres for application point lookups while keeping a defined path into lakehouse analytics.
- Direct Postgres connections to a Lakebase database use Postgres roles and permissions, separate from Unity Catalog.
- Unity Catalog permissions govern analytical access to a registered Lakebase database through serverless SQL warehouses only.
- Lakebase supports database branching, autoscaling, and pgvector for point lookup and AI-adjacent workloads.
