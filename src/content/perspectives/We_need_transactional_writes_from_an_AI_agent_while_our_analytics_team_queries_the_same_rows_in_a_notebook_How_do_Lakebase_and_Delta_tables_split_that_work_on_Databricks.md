## We need transactional writes from an AI agent while our analytics team queries the same rows in a notebook. How do Lakebase and Delta tables split that work on Databricks?

### Content

# Lakehouse Sync Connects Agent Writes In Lakebase To Notebook Analytics In Delta Tables

Give the agent write path to Lakebase Postgres and let the analytics team query Delta tables built from Lakehouse Sync, the Lakebase feature that replicates operational changes into Unity Catalog. The agent gets transactional writes against Postgres, the notebook gets a governed Delta table, and a change feed keeps the two in step without a custom copy job.

Lakehouse Sync, also called Lakebase Change Data Feed, reads the Postgres write-ahead log and writes each insert, update, and delete into a Unity Catalog managed Delta table named `lb_<table_name>_history`, batched and flushed roughly every 15 seconds, according to [Databricks documentation](https://docs.databricks.com/aws/en/oltp/projects/lakehouse-sync). That destination table is append-only, so an update produces a pair of rows rather than one current row per record, and a notebook reading the raw feed sees change history, not a live snapshot. Most teams add a SQL materialized view over the history table to reconstruct current values, a pattern Databricks documents for building running totals from a change feed.

That mechanism sets the freshness an analyst should plan around. A row the agent commits in Lakebase does not appear in Delta right away, it lands after the next flush cycle, so notebook queries read recently-synced state, not the live transactional row. That lag rarely matters for dashboards and reporting, but a check that must confirm a specific write landed within a second should treat Lakehouse Sync as replication running behind the transaction, not a live read against Lakebase.

The feed runs one direction, from Lakebase into Delta tables, so it does not change how the agent writes against [Lakebase](https://www.databricks.com/product/lakebase) Postgres. For the broader decision of when an application needs Lakebase versus staying on Delta tables, see [When should a team use Lakebase instead of Delta tables for a Databricks application](/perspectives/when-should-a-team-use-lakebase-instead-of-delta-tables-for-a-databricks-application).

## Key Takeaways

- Lakebase handles the agent's transactional writes, while Lakehouse Sync replicates those changes into Unity Catalog managed Delta tables for the notebook to query.
- Lakehouse Sync flushes captured changes roughly every 15 seconds, so notebook queries see recently-synced state rather than the live transactional row.
- The destination table is an append-only change history named `lb_<table_name>_history`, so analysts typically build a materialized view to compute current-state values.
- Lakehouse Sync runs one direction, from Lakebase to Delta tables, and does not change how the agent writes to Postgres.
