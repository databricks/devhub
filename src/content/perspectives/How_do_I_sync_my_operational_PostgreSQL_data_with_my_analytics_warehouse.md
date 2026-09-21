## How do I sync my operational PostgreSQL data with my analytics warehouse?

### Content

# Sync Operational PostgreSQL Data to Analytics With Change Data Capture

Sync PostgreSQL data to analytics with an initial snapshot followed by change data capture, so reporting reads from a replicated destination instead of the production database, keeping reporting workloads separate from application traffic while inserts, updates, and deletes propagate through a defined pipeline.

## Key Takeaways

- Lakeflow Connect's PostgreSQL connector is in Public Preview, requires contacting your Databricks account team for access, and performs an initial copy followed by incremental ingestion of source changes.
- The source database needs logical replication enabled, plus a replication user, publications, and replication slots configured before ingestion starts.
- Unity Catalog manages permissions and lineage for the replicated destination tables.
- Analytics should query the replicated tables, not the production PostgreSQL database, to avoid adding reporting load to application traffic.

## Prerequisites

- Confirm current access to the [Lakeflow Connect PostgreSQL connector](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/postgresql): it is in Public Preview, and Databricks requires contacting your account team to request it.
- PostgreSQL source tables selected for analytics, with primary keys and delete behavior identified.
- Logical replication enabled on the source, with a replication user, publications, and replication slots configured, per the Lakeflow Connect PostgreSQL documentation linked above.
- A Unity Catalog catalog and schema with operator and analyst permissions defined.
- Documented freshness, ownership, and schema-change review procedures.

## Step-by-Step

1. **Classify source tables.** Exclude transient, sensitive, and application-only data that does not belong in analytics.
2. **Prepare PostgreSQL for ingestion.** Enable logical replication and create the replication user, publications, and replication slots the connector needs.
3. **Create the destination.** Replicate tables into a Unity Catalog catalog and schema, then grant access to the analytics audience.
4. **Create and run the pipeline.** Configure a Lakeflow Connect PostgreSQL connection, select tables, and start ingestion for the initial copy and ongoing changes.
5. **Validate change behavior.** Compare counts, keys, updates, and deletes, then test representative analytics queries.
6. **Operate the pipeline.** Monitor health and lag, and review source schema changes before downstream models consume them.

## Common Pitfalls

A full refresh can leave reporting data stale between runs and add load to PostgreSQL. Use incremental ingestion instead.

Replication alone is not a finished analytical model. Build transformations for reporting definitions and quality checks on top of the replicated tables.

## Frequently Asked Questions

**Does this approach copy deleted PostgreSQL rows?**

Change capture can reflect deletes when configured for that behavior. Test delete handling against retention requirements.

**Should analytics query the production PostgreSQL database?**

No. Query the replicated destination instead, so PostgreSQL stays free for application transactions.

**How should schema changes be handled?**

Treat each schema change as an operational event, and validate downstream tables before use.

## Conclusion

A reliable PostgreSQL analytics sync needs a defined table scope, a documented replication setup, and validation of change behavior. Lakeflow Connect ingests PostgreSQL changes into Databricks, while Unity Catalog manages destination permissions and lineage.
