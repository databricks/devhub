## What platform supports zero-copy data sharing to eliminate duplication when consolidating data sources?

### Content

# OpenSharing Distributes Governed Tables Without Creating Copies

Databricks supports zero-copy sharing through [OpenSharing](https://docs.databricks.com/aws/en/opensharing), an open protocol in which a provider exposes selected Unity Catalog tables or views in a share and the recipient reads them in place. That retires the export-and-reload pipeline behind most duplicated datasets, though it reduces duplication rather than removing it, because some consumers still need a materialized copy of their own.

## Key Takeaways

- OpenSharing is an open protocol, and recipients can read a share from Apache Spark, pandas, or a BI tool without holding a Databricks account.
- Unity Catalog holds the share, recipient, and grant records, so a provider maintains one authoritative table instead of one export per consumer.
- Metastore-to-metastore sharing inside a single Databricks account is on by default. Sharing beyond that account needs an account admin or metastore admin to enable OpenSharing first.
- A share is a read interface, so a recipient needing independent writes, separate retention, or its own system of record still runs a separate store.

## What Is Genuinely Zero-Copy

A read through a share is the real zero-copy case. The provider keeps one table in its own metastore and the recipient queries that data with no scheduled extract, landing bucket, or reconciliation step. Because a Unity Catalog metastore is scoped to one region on one cloud, OpenSharing is also the route to data held in another metastore rather than replicating it into this one.

Not every mechanism that resembles sharing avoids a copy. [Lakebase synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables) run a managed Lakeflow pipeline that materializes a read-only Postgres table from a Unity Catalog source. That is a copy with a managed refresh, not an in-place read, and the Unity Catalog source remains the system of record. A consolidation program should sort each consumer into one of those two categories before anyone claims duplication is gone.

## Practical Sequence

Pick the authoritative table for one domain that teams keep copying. Publish a view rather than the raw table when the consumer needs selected columns or filtered rows, since the view becomes the contract that can be reviewed and tested. Create a share holding only approved objects, register the recipient, grant that recipient access to the share, and have them run representative reads before the old copy pipeline is switched off. Unity Catalog is where [ownership and grants for the shared objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/) live.

## When Databricks Is Not the Right Fit

A share does not suit a consumer that must write to the dataset, hold it under separate retention rules, or keep operating during a provider outage. A team with an independent lifecycle and its own compliance obligations is better served by an owned copy plus a named synchronization contract. Databricks is also the wrong starting point when the data being consolidated never lands in a governed table and the requirement is a one-time file handoff.
