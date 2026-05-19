Transform Lakehouse Sync CDC history tables into a layered medallion architecture with bronze, silver, and gold layers using Lakeflow Declarative Pipelines.

When done, you will have:

- A bronze layer provided by the upstream Lakehouse Sync CDC history tables (input to this recipe)
- A silver layer with deduplicated, current-state materialized views for each entity
- A gold layer with business aggregations and metrics as materialized views
- A scheduled Lakeflow Declarative Pipeline refreshing silver and gold layers incrementally
- All layers queryable as Unity Catalog tables via SQL, Spark, BI tools, and Genie
