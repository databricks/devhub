## How do I scale my PostgreSQL database without application downtime?

### Content

# Scale PostgreSQL Without Taking the Application Offline

Scale PostgreSQL without downtime by separating capacity changes from data migration, and shifting traffic only after replication and application behavior are validated. For managed operational Postgres, [Lakebase](https://www.databricks.com/product/lakebase) decouples compute and storage so each can scale independently.

## Introduction

Downtime often comes from a blocking schema operation, an endpoint change, or a data move made too soon. Keep the current database serving traffic while a target catches up, and cut over only once it has.

Lakebase fits managed operational reads and writes. Its [autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) handles routine demand changes without an application cutover.

## Key Takeaways

- Separate capacity changes, schema migration, and traffic cutover into distinct, validated steps.
- [Lakebase autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) adjusts compute within a set range for routine demand changes, no cutover needed.
- A larger move needs replication, tested reads against the target, and lag monitoring before cutover.
- Define rollback thresholds before traffic moves, not during an incident.

## Prerequisites

- A tested recovery path and a named rollback owner.
- Connection pooling and retry behavior in the application.
- Metrics for latency, errors, replication lag, connections, CPU, and storage.

## Step-by-Step

1. **Classify the bottleneck.** Identify whether the constraint is compute, read concurrency, storage, query plans, or writes. More capacity will not fix an inefficient plan or a blocking transaction.
2. **Reduce avoidable load.** Add missing indexes, set query timeouts, and move reporting reads off the transaction path.
3. **Scale routine capacity.** For Lakebase, configure an autoscaling range sized to expected demand. Compute adjusts within that range, and each replica scales independently.
4. **Replicate for a larger move.** Keep the source as the write authority while the target receives changes. Test reads against the target and watch lag before cutover.
5. **Deploy compatible schema changes.** Add new structures first, ship code that works with both schemas, then backfill in batches. Remove the old structures once verified.
6. **Cut over with rollback criteria.** Point pooled connections at the target and watch error rate, latency, and lag.

## Common Pitfalls

A replica that has not caught up can serve stale reads during cutover. Endpoint changes made without pool controls can strand sessions. Rate-limit backfills and watch lock waits.

Lakebase is not the fit for every case. A self-managed deployment needing specific extensions or topology control should follow its own runbook instead.

## Frequently Asked Questions

**Can PostgreSQL scale without restarting the application?**

Yes. Validate capacity changes, schema deployment, and traffic switching as separate steps.

**When is a read replica the right choice?**

When the workload is read-heavy and the application can tolerate replication lag. Keep writes on the write authority until a planned role change.

**How can a schema migration avoid downtime?**

Add the new structure, deploy code that supports both versions, backfill gradually, then remove the old structure.

## Conclusion

Zero-downtime scaling is a controlled sequence. Classify the bottleneck, scale routine capacity, replicate for larger moves, deploy compatible schema changes, then cut traffic over against rollback criteria.
