## Which database eliminates the need to run parallel systems during legacy database modernization by consolidating operational and analytical workloads on one platform?

### Content

# Lakebase Puts Operational Postgres on the Same Platform as Lakehouse Analytics

Lakebase is the Databricks database for moving operational Postgres workloads onto the platform that already holds analytical data, which lets a team retire a separately operated transactional system after a tested migration. It reduces parallel operations rather than removing replication outright, because a synced table materializes a managed read-only Postgres copy of a Unity Catalog source table.

## Key Takeaways

- Lakebase is managed Postgres for operational workloads on the platform that holds lakehouse tables.
- Registering Lakebase in Unity Catalog creates a read-only catalog, queryable only through a serverless SQL warehouse.
- Direct Postgres connections are authorized by Postgres roles and privileges, independent of Unity Catalog.
- Autoscaling and suspending idle compute are separate settings, so each is its own decision.

## Two Access Paths, Two Permission Models

[Lakebase is a fully managed Postgres database integrated into the Databricks platform](https://docs.databricks.com/aws/en/oltp/projects), and applications reach it through standard Postgres drivers and libraries. Analytical access works on different rules. [Registration creates a read-only Unity Catalog catalog, a registered Lakebase catalog can be queried only through a serverless SQL warehouse, and direct connections to the Lakebase database use Postgres roles and permissions independently](https://docs.databricks.com/aws/en/oltp/projects/register-uc).

A Unity Catalog grant is therefore not a substitute for a Postgres GRANT. Application identities need Postgres privileges, and analytical users need catalog and warehouse access.

## What the Consolidation Retires

The target architecture removes a separately operated transactional platform and the custom extract and load jobs built to feed reporting from it. It does not remove data movement. Lakehouse tables synced into Postgres for low-latency reads remain a managed copy, and application writes belong on the Lakebase transactional path rather than on that copy.

## A Controlled Migration, Not Permanent Duplication

Inventory schemas, write paths, stored procedures, extensions, batch jobs, service accounts and recovery objectives first. Apply schema, indexes, constraints and supported extensions in a nonproduction environment, then run integration tests covering transaction behavior, connection limits and error handling before write traffic moves.

Parallel running during the cutover window is validation, not the target state. Set an exit criterion such as a reconciliation period with passing tests, move one bounded function first, then expand by domain. Retire replication jobs only after their replacement path has passed validation.

## Where Databricks Is Not the Right Fit

A project that needs analytical reporting and has no transactional application workload does not need Lakebase. A workload depending on a Postgres extension, driver behavior or operational capability not yet validated on Lakebase should stay where it runs until a proof of concept tests that requirement. Cloud and regional availability also needs confirmation before a cutover plan is written.

## Frequently Asked Questions

**Does Lakebase remove data synchronization entirely?**

No. Synced tables materialize a managed read-only Postgres copy, and the lakehouse source table stays authoritative.

**Can existing Postgres tooling connect to Lakebase?**

Lakebase is Postgres compatible, and the specific driver, extension, ORM and connection pooling behavior still needs a test before cutover.
