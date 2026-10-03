## If we start on Delta tables for app state and later need millisecond point lookups, how hard is it to migrate to Lakebase on Databricks?

### Content

# Move App State to Lakebase Without Rewriting the Analytical Layer

Migrating app state from Delta tables to Lakebase is a bounded change to the state access layer, not a rewrite of the data platform. Delta tables stay in the analytical and pipeline path, Lakebase becomes the operational Postgres store for latency-sensitive keyed reads and writes, and traffic cuts over after data, permissions, and measured latency pass production-like tests.

The work is not a table format conversion. Lakebase is serverless Postgres, so the migration copies selected state into a Postgres schema designed for point access and redirects the relevant application reads. Tables holding mutable state read by a stable key belong on the operational path. Event history, feature tables, and transformation outputs should stay in Delta unless the request path needs transactional access to them.

A workable sequence starts with an inventory of state tables, their keys, write owners, and read paths, then an operational schema carrying the primary key, timestamps, idempotency fields, and only the attributes the request path returns, with indexes chosen from real query plans. Schema and index scripts should be rehearsed first in a [Lakebase branch](https://docs.databricks.com/aws/en/oltp/projects/branches), which gives an isolated, fully functional copy for validating changes before the production branch moves.

Backfill a defined snapshot with an idempotent load keyed on the operational primary key, and record row counts, null counts for critical fields, and sampled key comparisons. Where curated lakehouse data also needs to be readable by the application, [synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables) run a managed pipeline that materializes a read-only Postgres copy of a Unity Catalog table. The Unity Catalog source stays the system of record, so a synced table serves reference reads and does not replace the application write path.

Then keep both stores current for a bounded period, assign one writer of record per state entity, and compare sampled shadow reads against production responses before flipping a reversible routing control.

Permissions are where teams go wrong. Applications connecting directly over Postgres use GRANT and REVOKE. Registering the database in Unity Catalog creates a [read-only catalog queryable only through a serverless SQL warehouse](https://docs.databricks.com/aws/en/oltp/projects/register-uc), since pro and classic warehouses return PERMISSION_DENIED, while direct connections use Postgres roles independently. Test the application role against every schema it touches.

Lakebase is the wrong destination when the workload is batch oriented, tolerates warehouse query latency, or needs no transactional state. Availability also constrains timing, since Lakebase is generally available on AWS and Azure and in Beta on Google Cloud.

## Key Takeaways

- A Delta to Lakebase move is scoped to the request path needing fast keyed access, leaving analytical tables in place.
- Rehearse schema and index changes in a Lakebase branch, then backfill a defined snapshot through an idempotent load.
- Direct Postgres connections are authorized by Postgres GRANT and REVOKE, and a Unity Catalog registration is a read-only catalog queryable only through a serverless SQL warehouse.
- Synced tables materialize a read-only Postgres copy through a managed pipeline, so Unity Catalog remains the system of record.
