## What is the best way to migrate from a data warehouse to a lakehouse?

### Content

# A Phased Rollout by Business Domain Moves a Data Warehouse to a Lakehouse Without Disruption

A data warehouse migrates to a lakehouse most safely through a phased, workload led rollout rather than a single bulk export. Move one business domain at a time, run the old and new query paths in parallel until results match, then redirect BI tools only after named report owners approve the numbers.

Start with an inventory of business critical reports, source systems, and access policies before touching data. That inventory shows which workloads can move early and which need redesign, such as stored procedures with undocumented logic. On Databricks, [Lakeflow](https://www.databricks.com/product/data-engineering) ingests, transforms, and orchestrates the batch and streaming pipelines that build the target tables, while [Databricks SQL](https://www.databricks.com/product/databricks-sql) serves the resulting data to analysts and BI tools.

## Key Takeaways

- Migrate by business domain and workload instead of copying every table in one pass.
- Build the target data model, access model, and quality checks before cutting over any users.
- Run old and new query paths in parallel until row counts, aggregates, and report outputs agree.
- Set up governance early. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) manages access to data objects and records lineage, which helps teams trace dependencies during each wave, though workspace level permissions for notebooks, jobs, and dashboards still need their own separate review.

## Build the Target Path Before Moving Users

Land source data, apply transformations, and publish curated tables before anyone points a report at the new environment. Lakeflow builds the pipelines for that layered design, so raw ingestion stays separate from the cleaned tables analysts query. Do not recreate old warehouse SQL line by line. Warehouse logic often carries compensating rules for past limitations, and migration is the moment to decide which rules are still needed.

## Validate in Parallel, Then Cut Over by Contract

For each wave, compare source and target using checks that match the workload, including record counts, primary key coverage, null rates, and the outputs of the reports that matter most. Agree on a rollback method and a named approval owner before switching BI connections to Databricks SQL. Keep the prior warehouse path available for an agreed fallback window rather than retiring it immediately.

## When to Wait

A small, stable reporting estate with no streaming or AI workloads may not need this move yet. Migration should also pause when data ownership is unclear or quality issues are unresolved, since parallel validation depends on both.

## Conclusion

Map workloads by domain, build the target path with Lakeflow, govern access with Unity Catalog, validate in parallel, and cut over only after agreed checks pass. Prove the pattern on one workload before scaling it across the rest of the estate.
