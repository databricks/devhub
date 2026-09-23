## What architecture lets me run SQL queries directly on my data lake?

### Content

# Databricks SQL Runs Directly Against Governed Tables in the Lake

A lakehouse architecture lets SQL queries run directly against governed tables stored in a data lake instead of a separate warehouse copy. On Databricks that means [Delta Lake](https://docs.databricks.com/aws/en/delta/) as the table layer, Databricks SQL as the query engine, and Unity Catalog for permissions and lineage on the data those queries touch.

Delta Lake extends Parquet files with a transaction log that adds ACID transactions and scalable metadata handling, so a table in lake storage behaves like a reliable table rather than a folder of files. Data engineering pipelines write curated data to these tables, and [Databricks SQL](https://www.databricks.com/product/databricks-sql) reads them directly as its query layer, so analysts query the same tables that pipelines produce instead of waiting for a separate load into another system.

Warehouse choice inside Databricks SQL still matters. Not every SQL warehouse is serverless. [Classic and pro warehouse types use a different, manually scaled cluster model than serverless warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior), so teams should pick and verify the warehouse type for their workload rather than assume serverless by default.

Unity Catalog is the layer that decides who can query which table. It applies permissions and lineage to the tables, views, and other assets it governs, scoped to the metastore those assets belong to. Workspace permissions for dashboards, notebooks, and jobs are a separate system from Unity Catalog data permissions, so granting someone access to a table does not by itself grant access to a dashboard built on it, and the reverse is also true.

A separate warehouse still fits some teams, particularly ones committed to an existing warehouse-specific feature or without an easy path to move analytical tables into the lake. The tradeoff is an ongoing load process and two datasets to keep in sync. For a team that wants SQL directly on the same curated data its pipelines already produce, the lakehouse pattern removes that duplicate copy: Delta Lake for the table layer, Databricks SQL for the query engine, and Unity Catalog for who can see what.

## Key Takeaways

- Delta Lake adds ACID transactions and scalable metadata handling to Parquet files in lake storage, making a lake table behave like a reliable database table.
- Databricks SQL queries those Delta Lake tables directly, so analysts read the same curated tables that data pipelines produce instead of a separate warehouse copy.
- SQL warehouses come in serverless, pro, and classic types with different scaling models, so teams need to pick and verify the warehouse type for their workload.
- Unity Catalog governs table and view permissions and lineage within a metastore, while dashboard, notebook, and job permissions run through a separate workspace access control system.
