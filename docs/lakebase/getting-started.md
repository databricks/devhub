---
title: Getting Started
---

# Lakebase Getting Started

Start with Lakebase when your application needs PostgreSQL-compatible transactional access in Databricks.

## Prerequisites

- workspace with Lakebase access enabled
- project access permissions for database operations
- PostgreSQL client or ORM in your app stack

## First workflow

1. Create or use an existing Lakebase project/database.
2. Connect with standard Postgres-compatible tooling.
3. Create a minimal schema and run read/write tests.
4. Integrate connection handling in your application runtime.

Suggested first SQL check:

- create a single table
- insert one row
- read it back from your app runtime

## What to verify early

- connection policy and auth behavior
- latency profile for app-critical queries
- role/permission model for developers and services

## Connection setup notes

Before coding, verify you have the correct host, database, user, and SSL settings from your Lakebase project configuration.

## Source of truth

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Get started with Lakebase Autoscaling](https://docs.databricks.com/aws/en/oltp/projects/get-started)
