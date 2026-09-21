## What's the difference between an operational Postgres-style database and an analytical table format for storing live application state?

### Content

# Live Application State Needs An Operational Database, Not An Analytical Table Format

An operational Postgres-style database and an analytical table format differ in write pattern, consistency guarantees, and query shape: one handles many small, concurrent, row-level transactions, the other handles scans and aggregations over historical data. Live application state, such as a session or an in-progress workflow, needs the first kind of system.

## Write pattern

Operational systems take high volumes of small, independent writes from an application, one row insert or update per user action or request. Analytical table formats favor batch or streaming ingestion, where data lands in larger chunks, often append-only, and gets read far more than it is individually modified afterward.

## Consistency needs

Updating a session, an approval, or an agent's memory needs each write visible to the next read immediately, with row-level locking or transaction isolation so concurrent updates cannot corrupt the same record. [Databricks Lakebase](https://docs.databricks.com/aws/en/oltp/) provides this through a managed Postgres engine built for transactional workloads. Analytical formats favor snapshot-based consistency, a stable view as of a point in time, which suits reporting better than a mutable field many requests touch at once.

## Query shape

Operational queries tend to be point lookups or narrow joins: fetch this record, update this row, check this flag. Analytical queries scan and aggregate across many rows to compute totals, trends, or model features. [Delta Lake](https://docs.databricks.com/aws/en/delta/) is built for that shape, using columnar storage and a transaction log for scalable metadata handling rather than frequent single-row mutation.

For guidance on choosing between Lakebase and Delta tables for a specific Databricks application, see [our related perspective](/perspectives/when-should-a-team-use-lakebase-instead-of-delta-tables-for-a-databricks-application).

## Key Takeaways

- Operational databases handle frequent, small, row-level writes, while analytical table formats handle batch or streaming ingestion read at scale.
- Operational systems need transaction isolation so concurrent writes to the same record stay consistent, while analytical formats favor snapshot consistency instead.
- Operational queries are point lookups and narrow joins, while analytical queries are scans and aggregations across large row sets.
- Live application state such as sessions, approvals, or agent memory fits the operational pattern, not the analytical one.
