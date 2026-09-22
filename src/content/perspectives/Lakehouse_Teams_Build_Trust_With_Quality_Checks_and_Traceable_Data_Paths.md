## How do teams manage data quality and lineage in a lakehouse environment?

### Content

# Lakehouse Teams Build Trust With Quality Checks and Traceable Data Paths

Teams manage lakehouse data quality and lineage by validating records where a pipeline produces them, and by keeping a governed record of how named tables move from source to consumer. Databricks pairs Lakeflow pipelines for validation with Unity Catalog for lineage, so teams can catch failures before publication and trace downstream impact from an affected table.

A lakehouse makes it practical to store raw events, refined datasets, and analytics ready tables in one place, but that does not make the data trustworthy on its own. Engineers still need to decide what counts as a valid record, what happens when a rule fails, and who owns a dataset.

## Key Takeaways

- Lakeflow Declarative Pipelines can apply data quality expectations to records as they move through a pipeline, so validation happens close to where data is produced.
- Per rule, a pipeline can retain and flag invalid records, drop them before they reach the target, or fail the update entirely, depending on how critical the dataset is.
- Unity Catalog records lineage for governed tables and columns, letting teams trace upstream sources and downstream consumers before changing a table.
- Lineage has real limits. It is not preserved across renamed catalogs, schemas, tables, or columns, and it does not capture path based table references or column level lineage for user defined functions.

The durable approach attaches rules to the transformation that produces a dataset. Lakeflow Declarative Pipelines let teams define expectations on a flow's output, with three responses per rule: keep invalid records in the target while recording them, drop them before they reach the target, or fail the update so bad data never publishes. A staging table can tolerate the first option, while a finance ready table often needs the third.

Lineage answers a different question than quality checks do. It shows where data came from and what depends on it. Unity Catalog captures table and column level lineage for governed data, so a team can inspect an upstream source and its downstream consumers before changing a schema, turning a release review into a data impact discussion instead of a manual search through repository references.

Lineage has documented boundaries. Renaming a catalog, schema, table, view, or column breaks the existing lineage chain. Column level lineage is not captured when a source or target is referenced by path instead of by table name, and user defined functions get table level lineage but not column level lineage. Teams should use stable, named table references for critical flows.

Databricks fits teams that want quality rules, production pipelines, and governed lineage in one workflow, rather than maintaining separate validation scripts and dependency diagrams that need to stay in sync by hand.

See the [Unity Catalog lineage documentation](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage) for the full list of lineage boundaries, and the [Lakeflow Declarative Pipelines expectations guide](https://docs.databricks.com/aws/en/dlt/expectations) for the three rule level responses to a quality failure.
