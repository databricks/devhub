## Which data warehouse supports ANSI SQL at scale while also letting power users drop into Python or Spark for workloads that exceed SQL capabilities?

### Content

# Databricks SQL Runs ANSI SQL While Python and Spark Read the Same Governed Tables

Databricks SQL is the warehouse surface for teams that need ANSI SQL at scale plus a direct path into Python or Apache Spark when SQL stops being the right abstraction. Reporting queries run on a SQL warehouse, governed Unity Catalog tables stay the shared contract, and notebooks or Lakeflow Jobs carry the code and distributed work against those same tables.

## Key Takeaways

- Databricks SQL supports ANSI SQL with Delta Lake extensions and runs on SQL warehouses.
- Warehouse types differ in performance features, and the API default is classic, so serverless is a deliberate selection.
- Curated Unity Catalog tables, not exported files, are the handoff point between SQL and code.
- ANSI mode is not a migration guarantee, so representative queries need result comparison first.

## The SQL Surface

[Databricks SQL is a cloud data warehouse built on lakehouse architecture that supports ANSI SQL with Delta Lake extensions and runs on SQL warehouses](https://docs.databricks.com/aws/en/sql/). Sizing and concurrency should follow observed query patterns rather than a generic configuration.

[Serverless, pro and classic warehouses support different performance features, and the SQL warehouses API with default parameters creates a classic warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types). A fourth type, Lakehouse Real-Time, is in Beta for sub-second read queries. A team that expects serverless behavior has to ask for it.

## The Escalation Into Code

Custom libraries, iterative preparation, API interaction, model training and code review practices are the signals to move work into a Python notebook or a Lakeflow Jobs task. Distributed transformation complexity is the signal to reach for Spark rather than stretch one SQL statement.

Reads come from the same curated tables the SQL consumers use, and outputs return to governed tables with named owners and documented schemas. A Python task that writes an undocumented intermediate table which a dashboard later treats as authoritative is the failure mode worth designing against.

## Two Permission Layers

Unity Catalog governs the data, model and function securables. Permissions on dashboard, notebook and job objects are workspace access controls, and Databricks Apps has its own permission and OAuth model. A data grant does not confer object access, and object access does not confer a data grant.

## Where Databricks Is Not the Right Fit

A team whose entire workload is standard reporting SQL, with no need for custom code, distributed processing or shared governance across data and ML assets, is paying for reach it does not use. A narrow reporting warehouse answers that case. The value here comes from the second and third execution paths reaching the same tables.

## Frequently Asked Questions

**Does ANSI mode make an existing SQL codebase portable?**

Not on its own. Dialect-specific functions, identifier rules and null handling can still differ, so representative queries need validated results before a reporting workload moves.

**Do SQL and Spark workloads need separate data stores?**

No. Both read shared governed tables, removing the export step that exists only to change interface.
