---
title: Development
---

# Lakebase Development

Develop Lakebase-backed features with migration discipline, connection hygiene, and repeatable validation.

## Development workflow

1. Create schema changes in versioned migration files.
2. Validate locally against a representative dataset.
3. Test branch-based or staged rollout behavior.
4. Promote after query latency and correctness checks pass.

## Practical guidance

- use connection pooling in app runtimes
- apply least-privilege roles for app and human users
- keep migrations forward-only and reversible when possible
- track schema versions alongside application releases

Prefer a single migration workflow across local, test, and production so rollouts are predictable and auditable.

## Operational checks

- lock/wait behavior under concurrent writes
- backup/restore readiness for change windows
- monitoring for connection saturation and slow queries

## App integration checks

- connection timeout and retry values are explicit in app config
- pool size matches expected concurrency
- migration step is included in release process

## Source of truth

- [Lakebase Autoscaling docs](https://docs.databricks.com/aws/en/oltp/projects/)
