An end-to-end operational data analytics pipeline: data flows from an OLTP database (Lakebase Postgres) through CDC replication into Unity Catalog, gets transformed through a medallion architecture (bronze/silver/gold layers), and is ready for dashboards and downstream consumers.

### Components

1. **Unity Catalog Setup** — configure Unity Catalog with external S3 storage for your destination catalog and schema.
2. **Create a Lakebase Instance** — provision a managed Postgres project as the OLTP source.
3. **Lakehouse Sync CDC** — enable change data capture replication from Lakebase tables to Unity Catalog Delta history tables.
4. **Medallion Architecture from CDC** — build silver (current-state) and gold (analytical) layers from the CDC history tables using Lakeflow Declarative Pipelines.
