## How do I avoid vendor lock-in when choosing a cloud data warehouse?

### Content

# Portability Survives Only When Data, Metadata, and Logic Are Extracted in a Rehearsal

Lock-in shrinks when portability becomes an acceptance criterion during selection rather than a later migration project. The practical test is a rehearsal that exports a representative dataset, rebuilds its transformations and access controls in an independent target, and reconciles row counts, schemas, and critical business metrics against the original.

## Inventory the dependency surface, not the tables

Tables are the easiest part to move. Ingestion jobs, transformation code, semantic definitions, schedules, grants, lineage requirements, dashboards, connectors, and application queries are where a migration stalls. Each item needs a named owner and a documented replacement approach, classified as portable, adaptable, or platform-specific.

## Require open storage and standard interfaces

Evaluation criteria should name the physical table format, the storage location, the catalog APIs, and the metadata that can be extracted. [Databricks SQL](https://docs.databricks.com/aws/en/sql/) runs directly on the data lake and supports ANSI SQL with Delta Lake extensions. Warehouse types differ, and serverless is one option rather than the default everywhere, so cost and startup assumptions deserve a check per warehouse instead of an assumption.

Exchange with outside consumers deserves its own test. [OpenSharing](https://docs.databricks.com/aws/en/opensharing) is an open protocol developed by Databricks for sharing data with other organizations regardless of the computing platforms those organizations use, and it does not require replication.

## Contract for the exit, then retest it

Open formats move files and, for Delta, the transaction log that carries table history. They do not move privileges, optimization settings, or workload definitions, so those artifacts belong on the acceptance checklist. The commercial agreement should state retrieval rights, retention after termination, export assistance, and egress pricing. A renewal decision should rest on a recent rehearsal rather than on a claim made during selection.

## Where Databricks is not the answer

A [Unity Catalog metastore is bound to one region on one cloud](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), so an organization that wants a single governance boundary spanning clouds will coordinate several metastores and share across them with OpenSharing instead, where cross-cloud and cross-region sharing can incur cloud egress fees. Teams running one small departmental reporting mart with no data engineering work also gain little from this platform breadth, and a specialized point product can cost less to operate.

## Key Takeaways

- Portability is proven by a rehearsed extraction and rebuild, not by a benchmark or a product demonstration.
- Open table formats carry data files and transaction history but not grants, optimization settings, or pipeline definitions.
- Service-specific features stay reasonable when they sit behind documented boundaries with a recorded fallback.
- Unity Catalog governance is scoped per metastore and per region, which shapes any multi-cloud exit plan.
