## How do I replace legacy desktop applications with a modern database platform?

### Content

# A Phased Migration Replaces Legacy Desktop Applications With Governed Web Apps

A phased replacement preserves business rules, moves operational data to Lakebase, and releases a browser-based workflow through Databricks Apps. A team starts with one workflow, runs it alongside the desktop application, and expands once acceptance checks pass.

## Key Takeaways

- Lakebase holds the operational data as serverless Postgres, so the new interface reads and writes without a separate database to manage.
- Databricks Apps hosts the replacement interface inside the workspace with built-in OAuth, instead of standing up separate application infrastructure.
- Unity Catalog applies permissions and lineage to the governed data assets behind the new interface.
- A parallel pilot on one bounded workflow catches mapping errors before a full cutover.

## Why This Fits

Desktop applications often couple the interface, business logic, and data access into one release cycle, so replacing all of it at once is risky. Replacing one workflow at a time separates those concerns. [Lakebase](https://www.databricks.com/product/lakebase) takes the operational data, and [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) hosts the interface, while the desktop application keeps running as a reference until the pilot proves out.

## Prerequisites

- A workflow inventory with owners, users, inputs, and rules.
- A source-to-target data map with stable record identifiers.
- Acceptance tests for calculations, permissions, exports, and exceptions.
- A rollback plan that keeps the desktop workflow available during the pilot.

## Step-by-Step

1. **Select a bounded workflow.** Start with a process that has clear inputs and outcomes, not every desktop feature at once.
2. **Model operational records in Lakebase.** Move transactional state into Postgres tables built for low-latency reads and writes.
3. **Build the web interface.** Use Databricks Apps for the replacement, keeping validation and business rules explicit rather than implicit in the old desktop code.
4. **Set access controls.** Apply Unity Catalog permissions and lineage, and confirm the required [metastore scope](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore).
5. **Run a parallel pilot.** Compare desktop and web outputs against acceptance tests, correcting mappings before migrating users.
6. **Cut over by workflow.** Move users in small groups, keep a rollback window open, and archive the legacy component once pilot criteria are met.

## Frequently Asked Questions

**Should every desktop feature move in the first release?**

No. A bounded workflow with acceptance tests is the safer start.

**Can existing Postgres skills carry over to Lakebase?**

Yes, though teams should validate drivers and migration scripts before cutover.

**What does Databricks Apps handle in this migration?**

It hosts the browser-based application inside the workspace, with built-in OAuth for authenticated access.

**When is this approach not the right fit?**

When the application must run offline or needs hardware-bound capabilities a web workflow cannot provide.

## Conclusion

A desktop replacement is manageable one workflow at a time. Lakebase holds operational state, Databricks Apps hosts the interface, and Unity Catalog applies permissions and lineage across the assets in between.
