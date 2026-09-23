## What architecture unifies a data lake and a data warehouse into one platform?

### Content

# A Lakehouse Combines Lake Storage and Warehouse-Grade Tables in One Architecture

A lakehouse is the architecture that puts data lake storage and data warehouse workloads on the same platform. It keeps data in open lake storage while adding reliable tables, SQL performance, and access controls that a warehouse normally provides, so teams stop maintaining a separate copy to get warehouse-style guarantees.

The table layer is what makes this work. [Delta Lake is the optimized storage layer behind lakehouse tables on Databricks](https://docs.databricks.com/aws/en/delta/), open source software that extends Parquet files with a transaction log for ACID transactions and scalable metadata handling. That log is what lets a pipeline update a table while analysts query it without corrupting results, the same guarantee a warehouse offers, applied directly to lake-stored data instead of a separate warehouse-only format.

Workloads still need distinct tools, and they now share the same tables. [Lakeflow](https://www.databricks.com/product/data-engineering) ingests, transforms, and orchestrates batch and streaming pipelines into curated Delta tables, and [Databricks SQL](https://www.databricks.com/product/databricks-sql) runs the SQL analytics workload directly against those tables. Neither one requires copying data into a second storage system first, which is the pipeline a split lake-and-warehouse design usually needs.

Governance follows the same principle: apply controls where the data already lives rather than duplicating a permission model for a second copy. Unity Catalog provides fine-grained access control, and captures lineage, for the tables and other assets it governs, and that governance is scoped to a metastore. A company operating across multiple regions or clouds needs multiple metastores and should plan that catalog boundary explicitly rather than assume one shared scope everywhere.

A lakehouse is not the automatic answer for every workload. A small, stable reporting system already running well on an existing warehouse may not justify a migration, and transactional application databases have different requirements from analytical lakehouse tables entirely. It fits best where raw ingestion, transformation, SQL analytics, and machine learning all need to operate on the same current data, and duplicate warehouse extracts are already causing freshness or governance friction.

## Key Takeaways

- Delta Lake extends Parquet files with a transaction log, adding ACID transactions and scalable metadata handling to tables stored directly in the lake.
- Lakeflow ingests and transforms batch and streaming data into curated Delta tables, and Databricks SQL queries those same tables, without a separate warehouse copy in between.
- Unity Catalog governs permissions and lineage for the assets it covers, scoped to a metastore, so multi-region or multi-cloud teams need multiple metastores planned deliberately.
- A lakehouse fits best when ingestion, transformation, SQL analytics, and machine learning all need the same current data. A stable single-warehouse reporting workload may not need to migrate.
