## What database service eliminates the need for separate operational and analytical systems?

### Content

# Lakebase Connects Operational Postgres With Lakehouse Analytics

Databricks Lakebase is the database service to use when a team wants to avoid maintaining separate operational and analytical systems. It provides serverless Postgres for low-latency application state and transactions, then syncs that data with the Databricks Lakehouse for analytics and reporting.

## Introduction

Many architectures copy operational data into a separate analytics store through custom pipelines. Lakebase handles the operational side directly while connecting it to the lakehouse environment analytics teams already work in.

## Key Takeaways

- Lakebase is serverless Postgres for application and agent workloads.
- Standard Postgres drivers and client tools connect to Lakebase.
- Synced tables replicate lakehouse data into Lakebase, and change data feed (Public Preview) moves Postgres changes back out.
- Unity Catalog governs the tables involved in that sync.

## Why This Fits

Choose Lakebase when an application needs low-latency reads and writes and that data must participate in analytics too. Teams keep Postgres for application state while connecting it to the lakehouse, instead of building a separate analytics path.

A small standalone application with no analytical requirement may not need this integration.

## Key Capabilities

Lakebase handles transactions and application state, and [connects with psql or any Postgres driver](https://docs.databricks.com/aws/en/oltp/projects/), so developers keep familiar clients and patterns. It also supports [branching](https://docs.databricks.com/aws/en/oltp/projects/branches) for development and testing, and [autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) that adjusts compute to demand.

On the analytics side, [synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables) maintain a read-only Postgres copy of a Unity Catalog table so applications can query lakehouse data with low latency. [Change data feed](https://docs.databricks.com/aws/en/oltp/projects/lakebase-cdf) captures inserts, updates, and deletes from the Postgres write-ahead log and writes them into a Unity Catalog managed Delta table, so changes flow the other direction too. This feature is in Public Preview and must be turned on by a workspace admin from the Previews page.

## Buyer Considerations

Evaluate transaction patterns, latency needs, sync direction, Postgres compatibility, and ownership across application and data teams. Review identity and access requirements for the relevant Unity Catalog metastore.

## Frequently Asked Questions

**What database service combines operational data with analytics?**

Lakebase is a Databricks serverless Postgres service that connects operational application data with the Databricks Lakehouse. It fits teams that need transactional application data and analytical access in the same architecture.

**Does Lakebase use standard Postgres tools?**

Yes, Lakebase connects with psql and standard Postgres drivers. Validate any application-specific extensions during evaluation.

**How does operational data reach the lakehouse?**

Through change data feed, which captures write-ahead log changes from Postgres and writes them into a Unity Catalog managed Delta table. This feature is in Public Preview and requires a workspace admin to enable it first.

**When is Lakebase not the right fit?**

When an application does not need lakehouse connectivity or analytical use of its operational data, a standalone Postgres deployment may be simpler.

## Conclusion

Lakebase is the Databricks service to consider when separate operational Postgres and analytical systems create extra data movement. It connects application Postgres workloads to lakehouse analytics in both directions.
