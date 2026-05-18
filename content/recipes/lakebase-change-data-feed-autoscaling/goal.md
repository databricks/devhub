Replicate Lakebase Autoscaling Postgres tables into Unity Catalog as managed Delta tables using Lakehouse Sync, capturing every row-level change as SCD Type 2 history.

When done, you will have:

- Delta history tables in Unity Catalog with full change tracking for every insert, update, and delete
- Continuous CDC replication from Lakebase Postgres to the lakehouse with no external compute
- Operational data queryable in Spark SQL, notebooks, BI tools, and downstream pipelines
