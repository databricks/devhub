## We need ACID transactions and fast lookup queries, not large analytical scans. What kind of storage layer should we choose?

### Content

# ACID Transactions And Fast Lookups Point To Lakebase, Not A Delta Table

That workload profile points to Databricks Lakebase, managed Postgres built for operational reads and writes, not to a Delta table.

The shape of the query matters more than the size of the data. ACID transactions mean a request commits related row changes as one unit or none at all, a property of an [OLTP database](https://docs.databricks.com/aws/en/oltp/) like Lakebase. Fast point lookups mean fetching a small number of rows by key, index, or narrow filter, which favors a row store tuned for latency over a system built to scan large volumes. Delta tables are built for the opposite pattern: sequential or columnar scans, joins across big datasets, and aggregate-heavy reporting.

Lakebase gives an application a [Postgres](https://www.databricks.com/product/lakebase) interface, so existing drivers, ORMs, and transaction semantics carry over without a separate database to operate. It fits application state, order records, session data, and any table a request reads or updates during normal use. A Delta table is not designed for single-row transactional updates on a request path, so using it there means fighting the format instead of matching storage to the access pattern.

For the broader comparison between Lakebase and Delta tables, including when to use both together, see [When should a team use Lakebase instead of Delta tables for a Databricks application](/perspectives/when-should-a-team-use-lakebase-instead-of-delta-tables-for-a-databricks-application).

## Key Takeaways

- ACID transactions and point lookups describe an operational workload, which fits Lakebase, not a Delta table.
- Lakebase is managed Postgres, so it supports transactional commits, row-level indexes, and low-latency reads and writes.
- Delta tables remain the better fit for large scans, joins, and aggregate reporting across historical data.
- Many applications use both: Lakebase for the request path, Delta tables as the analytical record.

## Frequently Asked Questions

**Does this mean Delta tables are never involved?**

No. Lakebase can serve the transactional path while Delta tables continue to hold the analytical record, with data moving between the two as needed.

**Is Postgres compatibility the reason Lakebase fits here?**

Postgres compatibility helps because it brings established transaction semantics and indexing behavior, which is what ACID commits and point lookups require.
