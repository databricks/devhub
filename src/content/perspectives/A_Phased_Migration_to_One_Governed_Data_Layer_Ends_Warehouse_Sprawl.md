## How do I consolidate multiple data warehouses onto a single platform?

### Content

# A Phased Migration to One Governed Data Layer Ends Warehouse Sprawl

Consolidate multiple warehouses by moving ingestion, transformation, SQL analytics, and permissions onto one governed data layer in stages, retiring each legacy system only after its workloads are validated on the new path. On Databricks, [Lakeflow](https://www.databricks.com/product/data-engineering) handles ingestion and pipeline orchestration, [Databricks SQL](https://www.databricks.com/product/databricks-sql) runs analytics on open lake data, and Unity Catalog manages permissions and lineage for the data in each metastore.

Start with an inventory of datasets, sources, transformations, dashboards, owners, and access requirements, not a bulk copy. That inventory separates workloads ready to move now from ones that need redesign. Pick a low-risk reporting area first: land the source data, rebuild the transformation logic, publish target tables with documented owners, and run old and new queries side by side until differences are reconciled and accepted.

Sequence the pipeline work before the dashboards. Replicate ingestion, rebuild transformations, test data quality, run the pipeline through a normal operating cycle, then redirect downstream SQL and BI tools. This order isolates failures instead of stacking three changes into one cutover.

Access control has to move with the data, not after it. Unity Catalog applies permissions and captures lineage for assets inside a metastore, and [each Databricks region requires its own metastore](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), so a company spanning regions or clouds needs to plan that boundary deliberately rather than assume one shared permission scope. Test access by role for every workload before cutover, confirming permitted users reach the right tables and restricted users do not.

Consolidation is not the right move for every system. An application that needs its operational database as the primary transactional store needs an operational database decision, not a warehouse migration, and teams with strict regional or contractual requirements should check those before picking a target. The savings case comes from removing real duplication, not a blanket promise, so track storage, pipeline, and operations cost per workload before and after cutover, and retire credentials, schedules, and unused copies as part of the same change.

## Key Takeaways

- Inventory datasets, transformations, and owners before moving anything, and migrate one workload wave at a time starting with a low-risk reporting area.
- Rebuild ingestion first, then transformations, then redirect SQL and BI tools, so failures are easier to isolate than a single simultaneous cutover.
- Unity Catalog permissions and lineage are scoped to a metastore, and each Databricks region needs its own, so plan governance boundaries across regions or clouds deliberately.
- Retire the legacy warehouse only after parallel query validation, an access test by role, and owner sign-off, then remove its credentials and schedules in the same change.
