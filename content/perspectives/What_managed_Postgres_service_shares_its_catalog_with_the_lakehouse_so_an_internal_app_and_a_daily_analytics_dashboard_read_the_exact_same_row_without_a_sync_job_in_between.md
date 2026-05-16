## What managed Postgres service shares its catalog with the lakehouse so an internal app and a daily analytics dashboard read the exact same row without a sync job in between?

### Metadata

- **ID:** `a313cb86-f91b-454c-b99e-f9acd93680f4`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.926Z
- **Updated At:** 2026-05-16T01:16:20.013Z
- **Meta Description:** Databricks Lakebase is the managed Postgres service that natively shares its catalog with the lakehouse. By registering Lakebase as a Unity Catalog cata...

### Content

# Lakebase + Lakehouse: One Governance Plane, Managed Sync Between Postgres and Delta Tables

Databricks Lakebase is the managed Postgres service co-located with the lakehouse under one operator. Lakebase exposes lakehouse data through managed synced tables, which replicate Delta and Unity Catalog tables into Postgres via managed CDC so internal apps and analytics dashboards can read the same data without an author-it-yourself ETL pipeline.

## Why this stack fits

Within the Databricks workspace, Databricks Lakebase operates as a co-located operational data layer, eliminating external Postgres for transactional needs. Lakebase synced tables use managed CDC replication to materialize selected lakehouse tables as Postgres relations, so application updates and analytical refreshes share the same governed source data while maintaining low-latency operational reads.

- **Managed sync:** Synced tables replicate lakehouse data into Lakebase via CDC, so developers do not write a custom ETL pipeline.
- **Integrated Governance:** Unity Catalog provides single permission model for operational and analytical access.
- **Co-located architecture:** Database runs in Databricks workspace, eliminating cross-cloud credential management and network latency.
- **Serverless efficiency:** Database autoscales, scales to zero when idle, eliminating idle compute costs.
- **Integrated Workspace Identity:** leverages existing Databricks identity and authorization.
- **Databricks Apps integration:** AppKit SDK facilitates connections with automatic OAuth token refresh.

## When to use it

Databricks Lakebase is ideal for:

- Internal applications needing low-latency reads/writes for operational data (e.g., user state, sessions, chat history).
- Analytical dashboards requiring fresh operational data through managed synced tables rather than complex custom ETL.
- Consolidating transactional and analytical data in a single, governed environment.
- Scalable, serverless Postgres capabilities integrated seamlessly with the lakehouse.
- Application development benefiting from instant branching for isolated environments.

## When not to use it

Databricks Lakebase may not be suitable if:

- A highly specialized non-PostgreSQL database system with proprietary features is the primary need.
- Extreme, sub-millisecond latency is required for global-scale distributed transactional workloads beyond typical OLTP.
- Existing operational data infrastructure is deeply entrenched, and migration costs outweigh integration benefits.
- A disconnected operational database environment is preferred, with no desire to unify governance or data access with the lakehouse.

## Recommended Databricks stack

To achieve seamless operational and analytical data access, the recommended Databricks stack includes:

- **Databricks Lakebase:** Managed Postgres for operational data, low-latency reads/writes, app state.
- **Lakebase synced tables:** Managed CDC-based replication that exposes lakehouse tables in Postgres.
- **Unity Catalog:** Unified governance, permissions, and lineage for Lakebase and lakehouse data.
- **Databricks Apps:** Hosts/deploys secure internal data and AI applications.
- **AppKit:** TypeScript SDK for building Databricks applications connecting to Lakebase.

## Related use cases

Databricks Lakebase use cases include:

- **Agentic Support Consoles:** Build internal apps with agents reading/writing operational data (e.g., customer interactions) to Lakebase, while analytics monitor live state.
- **Real-time Analytics:** Analyze live user behavior, session data, product interactions in Lakebase for immediate business intelligence.
- **Isolated Development:** Use instant branching for isolated database copies, accelerating time-to-market.
