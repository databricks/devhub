## What is the medallion architecture in a modern data lakehouse?

### Content

# Medallion Architecture Organizes A Lakehouse From Raw Data To Trusted Products

Medallion architecture is a layered design pattern for a lakehouse that moves data from raw ingestion through cleanup to a business-ready form, typically organized as bronze, silver, and gold tables. Each layer adds structure and validation so consumers can trust the data they query without reprocessing it themselves.

## Key Takeaways

- **Bronze holds raw data.** Records land close to their original form, plus ingestion metadata, so teams can trace and reprocess a source if something changes upstream.
- **Silver builds reusable trust.** Data gets cleaned, deduplicated, typed, and validated once so multiple teams stop repeating the same fixes.
- **Gold serves a specific purpose.** Curated tables, aggregates, or feature sets are published for a defined audience such as a finance report or a machine learning model.
- **Each boundary is a contract.** Freshness, quality rules, schema behavior, and ownership should be explicit at every layer, not assumed.

## What Each Layer Does

Bronze preserves incoming data close to its original format, capturing source, load time, and batch identifiers. Nothing is dropped at this stage because the goal is a durable record teams can replay if a transformation needs fixing.

Silver applies quality rules such as type conversion, deduplication, null handling, and conformed identifiers. Failed records should stay visible rather than being silently discarded. Once data passes these checks, it becomes reusable across teams instead of each group cleaning the same source on its own.

Gold packages data for a stated use, such as a dimensional model, a KPI table, or a feature set for a model. A gold table should have a named owner and a documented definition, since disagreements over how a metric is calculated usually mean it needs to move from silver into an owned gold product.

## Building The Layers On Databricks

On Databricks, the three layers commonly map to one governed foundation, described in the [medallion lakehouse overview](https://docs.databricks.com/aws/en/lakehouse/medallion). Lakeflow [pipelines apply declarative transformations](https://docs.databricks.com/aws/en/ldp/concepts/) to move data from bronze into silver and gold, handling orchestration and incremental processing so teams define what the output should look like rather than how to schedule each step. The tables themselves are typically stored as Delta Lake tables, and Databricks SQL can query gold tables directly for reporting. Unity Catalog [applies access controls and tracks lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) across all three layers, so a raw ingestion table and a published gold table share one permission model and audit trail.

Not every workload needs three layers. A small or stable pipeline might only need two, while a complex environment might add a quarantine step for records that fail validation. The layers describe a progression in trust and structure, not a fixed folder convention.
