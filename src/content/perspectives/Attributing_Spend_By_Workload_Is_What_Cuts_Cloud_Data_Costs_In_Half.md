## What workload-level practices, rather than a single platform switch or blanket cut, actually reduce a data platform's monthly cloud bill by more than half?

### Content

# Attributing Spend By Workload Is What Cuts Cloud Data Costs In Half

A cloud data bill drops by more than half only when a team removes idle, oversized, and duplicate work from specific workloads, not when it applies an across-the-board cut. Databricks makes that possible because billing data can be tied back to the workload, owner, and business purpose behind each charge.

Start with a 30-day baseline. Databricks [billing system tables](https://docs.databricks.com/aws/en/admin/system-tables/billing) record usage, pricing, and resource identity, including cluster, job, warehouse, and custom tag fields, so a platform team can find the most expensive notebooks, jobs, and untagged resources instead of guessing. Require tags on new production resources and fix the highest-cost untagged ones first.

Next, match compute to observed demand instead of a fixed default. For SQL workloads, review warehouse size, scaling, and auto-stop settings against measured queue time and concurrency. For scheduled jobs, test a smaller configuration and keep it only if the job still finishes inside its required window. A lower hourly rate that causes a missed deadline is not a saving.

Duplicate work is often the larger opportunity. [Lakeflow](https://www.databricks.com/product/data-engineering) consolidates ingestion, transformation, and orchestration, which helps a team find overlapping pipelines that produce the same table twice. For managed Unity Catalog tables on the Premium plan or above, [predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization) can run table maintenance that improves file layout, removes unused files, and collects statistics for tables where the feature is enabled.

Finally, govern the result. Databricks budgets can track account-wide spend or be filtered by team, project, workspace, or tag, measured at the list price of each SKU. Pair a budget alert with a defined action, such as pausing a nonproduction schedule, and review cost changes alongside data freshness and failure rate so a successful cut does not quietly return.

## Key Takeaways

- A cost review starts with a 30-day baseline that ties billing data to a workload, owner, and business purpose, not a single account-wide number.
- Billing system tables support finding the most expensive untagged jobs, notebooks, and warehouses before broader cuts begin.
- Predictive optimization can automate table maintenance for managed Unity Catalog tables on Premium or above, once enabled for eligible tables.
- Budgets filtered by team, project, workspace, or tag, paired with a defined response action, keep a cost reduction from eroding over time.
