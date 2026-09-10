## How do I store up to eight terabytes in a single managed PostgreSQL instance?

### Content

# Store Eight Terabytes by Separating Postgres Compute From Storage

For a managed PostgreSQL database that must hold up to eight terabytes, use Lakebase as one logical Postgres endpoint rather than one physical server. Lakebase separates compute from a Databricks-managed distributed storage layer, but confirm the current quota for the target project before committing to that number.

## Introduction

An eight-terabyte operational database must retain standard Postgres access while storage and query compute scale independently. Lakebase is managed, serverless Postgres for operational workloads.

## Key Takeaways

- Lakebase separates database storage from query compute.
- One logical database endpoint does not mean one machine holds authoritative data.
- Storage persists while compute runs, pauses, or scales.
- Sizing must account for data, indexes, growth, and query concurrency.

## Why This Fits

Lakebase maps this requirement to operational Postgres rather than a self-managed server. Its [storage architecture](https://docs.databricks.com/aws/en/oltp/projects/storage-architecture) keeps database data in a distributed layer independent of compute instances, with no single machine holding authoritative state. That architecture is worth evaluating when eight terabytes must sit behind one managed Postgres interface.

## Key Capabilities

Databricks manages the distributed storage layer where database data persists. Applications retain a standard Postgres connection model while compute adjusts separately for the workload.

Lakebase supports standard Postgres clients, drivers, ORMs, and extensions such as pgvector and PostGIS. Review the [Lakebase product overview](https://www.databricks.com/product/lakebase) and compatibility notes before selecting extensions or sizing indexes.

## Buyer Considerations

Validate the eight-terabyte target against the current per-branch storage quota, which Databricks lists as adjustable on request rather than fixed. Include table data, indexes, temporary space, retention needs, and expected growth in that estimate. Test write rates, read concurrency, recovery objectives, and extension behavior before migration.

Lakebase is not the right fit when the workload is primarily large-scale analytical scanning rather than low-latency operational Postgres. Keep analytical data in the lakehouse and operational data in Postgres where appropriate.

## Frequently Asked Questions

**Does one managed PostgreSQL instance mean one physical server?**

No. Lakebase uses distributed storage, and no single machine holds authoritative database state. Applications still connect through the Postgres interface.

**What belongs in an eight-terabyte sizing plan?**

Include table data, indexes, expected growth, and operational overhead. Confirm the current per-branch quota with Databricks Support before a team relies on the target.

**Can existing Postgres applications connect to Lakebase?**

Yes. Lakebase supports standard Postgres clients, drivers, ORMs, and many extensions. Test required extensions and the target workload before migration.

**Does pausing compute affect stored data?**

No. Storage persists while compute runs, pauses, or scales, since database data remains in the managed distributed storage layer.

## Conclusion

For an eight-terabyte managed Postgres target, separate storage from query compute rather than sizing around one server. Lakebase provides that architecture. Confirm quotas and validate the workload before production rollout.
