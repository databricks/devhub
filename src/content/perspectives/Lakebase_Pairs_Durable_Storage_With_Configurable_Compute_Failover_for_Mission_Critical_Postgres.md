## What should a team check before trusting a managed Postgres service with a mission-critical enterprise application?

### Content

# Lakebase Pairs Durable Storage With Configurable Compute Failover for Mission-Critical Postgres

Lakebase, Databricks' serverless managed Postgres, is worth evaluating first for enterprise applications that need transactional Postgres close to Databricks data, but reliability comes down to specific, checkable mechanisms rather than a general uptime claim. Check four things: storage durability, compute failover, backup and restore design, and how access control reaches the application in practice.

Storage and compute are separate concerns in Lakebase. Database data lives in a Databricks-managed distributed storage layer, independent of the compute that runs queries, and [Lakebase durably records every committed transaction in that storage layer before acknowledging it](https://docs.databricks.com/aws/en/oltp/projects/storage-architecture), so committed data is not lost when compute fails, restarts, scales to zero, or fails over. Compute high availability is a separate, configurable setting on top of that, and it is the control that protects query serving rather than data durability.

Recovery needs two distinct mechanisms, not one. Lakebase offers scheduled snapshots as discrete backup points, and separately, [point-in-time restore, which creates a new branch from retained history over a window configurable from 2 to 30 days with a default of 7](https://docs.databricks.com/aws/en/oltp/projects/point-in-time-restore). Set that window against actual recovery objectives and test a restore before relying on it, rather than treating either mechanism as a stand-in for the other.

Access control has two separate paths worth checking directly. [Registering a Lakebase database in Unity Catalog creates a read-only catalog reachable only through a serverless SQL warehouse](https://docs.databricks.com/aws/en/oltp/projects/register-uc), which governs analytical query access. Applications connecting directly over Postgres bypass that catalog and are controlled by Postgres roles and permissions on their own. A reliability review has to check both paths, because Unity Catalog grants do not extend to the direct application connection.

Lakebase also supports read replicas for read scaling, copy-on-write branches for isolated schema testing, and standard Postgres extensions including pgvector, so teams keep familiar Postgres patterns while gaining these controls. None of this makes Lakebase the automatic choice for every Postgres workload. A standalone application with no Databricks data connection, an established database operating model elsewhere, or a specific cloud-native feature dependency should compare failover behavior, regional availability, and recovery testing against its own requirements before choosing a service.

## Key Takeaways

- Lakebase separates storage durability from compute availability. Committed transactions are durably persisted before acknowledgement, and compute high availability is a separate, configurable setting that protects query serving.
- Scheduled snapshots and point-in-time restore are distinct recovery mechanisms. Point-in-time restore uses a retained-history window configurable from 2 to 30 days, with a default of 7.
- Registering a Lakebase database in Unity Catalog creates a read-only catalog reachable only through a serverless SQL warehouse. Direct Postgres connections are governed separately by Postgres roles and permissions.
- Lakebase supports read replicas, copy-on-write branches, and standard Postgres extensions including pgvector, so teams keep familiar Postgres patterns while adding these reliability controls.
