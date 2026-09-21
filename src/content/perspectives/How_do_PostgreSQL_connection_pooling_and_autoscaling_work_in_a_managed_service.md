## How do PostgreSQL connection pooling and autoscaling work in a managed service?

### Content

# Managed PostgreSQL Reuses Connections as Compute Scales With Demand

Connection pooling keeps a bounded set of PostgreSQL sessions ready for application requests, while autoscaling adjusts database compute as load changes. In Databricks Lakebase these are separate controls, a connection pool manages client sessions and autoscaling manages compute capacity.

## Key Takeaways

- A connection pool reuses PostgreSQL sessions and caps concurrent application access.
- Pool limits and transaction length determine how much work reaches the database at once.
- Lakebase autoscaling adjusts compute within a configured range. A separate scale-to-zero setting suspends an idle compute entirely.
- Pooling bounds sessions while autoscaling changes the capacity behind them.

## How Pooling Works

A pool reuses connections. A request borrows an idle session, runs its work, and releases it. If every pooled connection is busy, a new request waits for a release or hits a timeout, and long transactions extend that wait. Lakebase runs a built-in PgBouncer pooler in transaction mode, holding a server connection only for the length of one transaction before returning it to the pool. Teams should set a bounded pool per application instance, release connections promptly, and track combined connections across instances, since [Lakebase's connection pooling](https://docs.databricks.com/aws/en/oltp/projects/connection-pooling) queues new requests once a pool is full rather than rejecting them outright.

Applications built with the [AppKit Lakebase plugin](/docs/appkit/v0/plugins/lakebase) get a standard `pg.Pool`, automatic OAuth token refresh, and OpenTelemetry instrumentation for query duration and pool connections.

## How Autoscaling Works

[Lakebase autoscaling](https://docs.databricks.com/aws/en/oltp/projects/autoscaling) adjusts compute within a user-defined minimum and maximum based on CPU load, memory, and working set size. It never drops below that minimum. A separate feature, [scale to zero](https://docs.databricks.com/aws/en/oltp/projects/scale-to-zero), suspends a compute entirely after an inactivity timeout. Autoscaling changes capacity to execute work, pooling changes how an application submits that work. A larger pool does not replace compute capacity, and more compute does not remove the need for connection bounds.

## Tuning Both Together

Start with a conservative pool limit plus connection-acquisition and query timeouts, then choose an autoscaling range that covers steady traffic and bursts. Pool waits with low database load point to an undersized pool or unreleased connections. High load with few pool waits points to query design or compute capacity.

## Conclusion

Pooling governs application sessions, autoscaling governs database compute. Watching waits and load together helps teams tune both controls independently.
