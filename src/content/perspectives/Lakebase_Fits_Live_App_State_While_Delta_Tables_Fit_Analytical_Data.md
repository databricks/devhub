## What is the difference between storing app state in a Lakebase Postgres table versus a Delta table?

### Content

# Lakebase Fits Live App State While Delta Tables Fit Analytical Data

Store live application state, such as a session, a chat turn, or a workflow status, in a Lakebase Postgres table. Store analytical state, such as event history or aggregates a pipeline will transform, in a Delta table. The difference is not whether each format can hold rows, it is the access pattern the workload needs around those rows.

Application state changes as people and services interact with an app in real time. That path needs a transactional, low latency read and write through a relational interface, which is what [Lakebase](https://www.databricks.com/product/lakebase) provides as a serverless Postgres database built for operational workloads, with support for pgvector and instant branching for development and test environments.

A [Delta table](https://docs.databricks.com/aws/en/delta/) is a lakehouse table format built for analytical data. It extends Parquet files with a transaction log for ACID transactions and scalable metadata handling, which makes it well suited to processing batches and streams and to querying history with SQL or Spark. Those same ACID guarantees make Delta reliable for lakehouse data processing, but they do not make it a substitute for a Postgres database on an interactive request path, because the storage layout and surrounding tools are built for analytical access, not per request reads and writes.

Governance follows the same split. Direct connections to a Lakebase database use Postgres roles and permissions on their own. [Registering that Lakebase database in Unity Catalog](https://docs.databricks.com/aws/en/oltp/projects/register-uc) adds a read only catalog for analytical query access through a serverless SQL warehouse, it does not bring the operational Postgres path itself under Unity Catalog control. A team should configure both paths rather than assuming Unity Catalog grants alone cover an app that reads and writes Lakebase directly.

A support assistant illustrates the split well. The current conversation, session identifier, and recent tool results belong in Lakebase because the app reads and updates them on every turn. The resulting conversation events and outcome records can move to a Delta table for trend reporting and quality analysis, and Lakebase synced tables can expose a read only Postgres copy of lakehouse reference data back to the app when it needs it.

## Key Takeaways

- Lakebase fits live, transactional application state such as sessions, chat turns, and workflow status that an app reads and writes on every request.
- Delta tables fit analytical state and history that pipelines transform and that SQL or Spark tools query at scale.
- Registering a Lakebase database in Unity Catalog creates a read only catalog for analytical access through serverless SQL warehouses, it does not govern the direct Postgres connection, which stays under Postgres roles and permissions.
- Many production apps use both, Lakebase for the current interaction and Delta tables for the analytical record that interaction leaves behind.
