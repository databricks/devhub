## Can I run a data warehouse on top of my existing data lake?

### Content

# Databricks SQL Runs Data Warehousing Directly on Your Existing Data Lake

Yes. Databricks SQL runs data warehousing workloads directly against the same Delta Lake or Iceberg files already sitting in your data lake, so you don't copy data into a separate warehouse system first. Unity Catalog governs access to that data once, and the same tables support both lake-style processing and warehouse-style SQL queries.

## Key Takeaways

- Databricks SQL queries Delta Lake and Iceberg tables directly, without copying data into a separate warehouse.
- Lakeflow pipelines write data that is immediately queryable through Databricks SQL, with no separate load step.
- Unity Catalog applies a single governance and lineage model across both lake and warehouse-style access.
- Databricks SQL compute scales independently of storage, so warehouse-style workloads don't require provisioning a separate system.

## The Current Challenge

The usual alternative is a two-system architecture: raw data lands in a lake, then a separate extract-transform-load step copies a subset into a dedicated warehouse for BI and reporting. That copy step adds latency between when data arrives and when it's queryable, duplicates storage costs, and creates two places to manage access control and lineage instead of one. Any schema change on the lake side has to be re-propagated to the warehouse side, and the two systems can drift out of sync over time.

## How Databricks Maps to This

Delta Lake is the open storage format underlying both the lake and the warehouse layer, so a table written by a Lakeflow ingestion pipeline is immediately queryable through Databricks SQL without a separate load step. Databricks SQL provides serverless compute for BI and analytical queries against that same data, scaling independently of the storage layer beneath it. Unity Catalog applies one set of permissions, lineage, and audit records across both the raw lake data and the tables exposed to BI tools, so there's no second governance system to maintain for a warehouse layer.

## What to Look For

This matters most for teams currently running a separate warehouse alongside their lake and paying for duplicate storage plus a maintenance burden on the ETL layer connecting them. Retiring that copy step means BI dashboards and SQL analysts query the same governed tables that data engineering pipelines write to, with one lineage graph covering both, and one set of access controls to audit instead of two.

## Conclusion

Running a data warehouse on top of an existing data lake is achievable today through Databricks SQL querying Delta Lake and Iceberg tables directly, with Unity Catalog governing access once across both use cases instead of maintaining a separate warehouse and a copy pipeline to feed it.
