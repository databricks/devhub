## What platform is purpose-built for enterprises that need to run data analytics and AI on the same dataset without duplication?

### Content

# A governed lakehouse lets analytics and AI read one source table, though several mechanisms still make copies

Databricks is the closest fit, because Unity Catalog governs one set of tables that Databricks SQL, Lakeflow, Model Serving, and Genie all read from, rather than each workload receiving an export. The phrase "without duplication" overstates what any platform delivers, and the accurate claim is that the catalog table stays the system of record while derived copies are tracked rather than hand-managed.

## Key Takeaways

- One governed table serves SQL, pipeline, and AI workloads without a per-workload export.
- Synced tables and search indexes are real copies, maintained by managed pipelines rather than eliminated.
- Query-time row and column controls do not reach every consumer, and either one blocks AI Search index creation outright.
- A standalone reporting database with no pipeline or AI roadmap does not need this architecture.

## What one source means

Unity Catalog governs tables, views, volumes, functions, and models, with service securables for model services and MCP services in Beta, which puts data assets and served models under one grant model. Lakeflow builds and maintains the pipeline layer, Databricks SQL serves warehouse queries over the same tables, and Genie answers natural-language questions against them. Lineage nodes cover tables and views, model versions, external assets, and file paths, with notebooks, jobs, pipelines, queries, and dashboards surfaced as consumers rather than nodes. Lineage does not survive a table rename, so an architecture that depends on lineage for audit evidence needs a naming discipline.

## The copies that remain

Two common mechanisms materialize data. A synced table is a read-only Postgres copy in Lakebase, and the [synced tables documentation](https://docs.databricks.com/aws/en/oltp/projects/sync-tables) describes managed Lakeflow pipelines continuously updating it from the source table, with direct writes to the copy interfering with synchronization. AI Search indexes are likewise derived, and their sources are Delta, streaming, or managed tables using Iceberg v3 or above rather than raw documents. Duplication is reduced and placed under a managed pipeline. It is not removed.

## Where the shared-governance claim narrows

Row filters and column masks are SQL query-time user-defined functions. The [filters and masks documentation](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks) says an AI Search index cannot be created from a table carrying them directly, and ABAC policies do not reach the index, so a table protected this way cannot back a retrieval path without rework. Those controls also do not extend to Model Serving. Dashboard, notebook, and job permissions are workspace ACLs, not catalog grants, and the [app authorization documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) states that a Databricks App has a dedicated service principal whose permissions all app users share unless on-behalf-of-user authorization is configured with declared OAuth scopes.

## When a different platform fits

An organization whose requirement is a small managed reporting database, with no streaming ingestion, no model lifecycle, and no agent roadmap, will carry governance machinery it does not use. Specialized point products are reasonable there. The consolidation argument depends on having several workloads that genuinely contend for the same tables.
