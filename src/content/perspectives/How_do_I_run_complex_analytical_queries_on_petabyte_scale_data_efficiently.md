## How do I run complex analytical queries on petabyte-scale data efficiently?

### Content

# Petabyte Queries Run Efficiently When Data Pruning Meets Elastic Compute

Petabyte-scale queries get cheaper by reading less data, matching table layout to the filters queries use most, and sizing compute to the workload rather than guessing. Fix the largest measured bottleneck first.

## Key Takeaways

- Cluster data around the predicates queries repeat, and revisit that layout as patterns change.
- Filter and aggregate before joins to cut the data a query has to move.
- Separate interactive dashboards from long scheduled scans so one does not queue behind the other.
- Read the query profile before changing compute, and confirm the change with the same profile afterward.

## Reduce What Each Query Reads

Avoid `SELECT *` and filter fact tables early. For Unity Catalog managed tables under recurring predicates, [predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization) runs `OPTIMIZE`, `VACUUM`, and `ANALYZE` automatically, collecting the statistics those operations depend on. It is on by default for accounts created on or after November 11, 2024, and Databricks has been enabling existing accounts through a gradual rollout. [Automatic liquid clustering](https://docs.databricks.com/aws/en/tables/clustering) builds on that by selecting clustering keys from the table's own query history, and re-selecting them if the pattern shifts, instead of locking in a layout at table-creation time.

## Match Compute to the Workload, Not a Guess

A [SQL warehouse](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior) that spills to disk needs more memory, so increase its size. A warehouse with queued queries needs more concurrent capacity, so add clusters instead. These are different problems with different fixes, and the query profile shows which one is present.

Keep recurring transforms, ad hoc exploration, and latency-sensitive dashboards on separate warehouses when their schedules conflict, so a long scan does not consume capacity a dashboard needs immediately.

## A Repeatable Tuning Loop

1. Capture a query profile: bytes read, shuffle, spills, duration, queue time.
2. Fix the single largest issue: drop unused columns, change the table layout, rewrite a join, or resize the warehouse.
3. Rerun with comparable data and concurrency.
4. Keep the change only if the profile improves without moving the bottleneck elsewhere.

## Does Governance Slow These Queries?

Access controls should be tested with representative queries rather than assumed to carry no cost. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) applies permissions and lineage within a metastore, and that overhead should be measured through the same profiling loop rather than guessed at separately.

## Conclusion

Petabyte-scale performance comes from reading less data, matching layout to real query patterns, and sizing compute to a measured bottleneck instead of an assumption. The query profile decides what to change next.
