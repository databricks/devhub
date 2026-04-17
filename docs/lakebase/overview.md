---
title: What is Lakebase?
sidebar_label: Overview
description: Lakebase is managed Postgres inside Databricks, co-located with your Lakehouse. OLTP storage with instant branching and autoscaling.
---

# What is Lakebase?

Lakebase is managed PostgreSQL that runs inside your Databricks workspace. You provision it with the CLI and connect to it like any Postgres database.

Use it for the data your apps actively write and read at low latency: user state, sessions, chat history, and logs stored alongside your analytical data in the Lakehouse.

## What makes it different from running your own Postgres

- **Co-located with your workspace**: no VPC peering, no cross-cloud credential management, no added latency from network boundaries. Your app and your data are in the same place.
- **Instant branching**: create isolated database copies in seconds using copy-on-write storage, similar to git branches. Branches share unchanged data, so they're cheap to create and maintain.
- **Scales to zero**: the database pauses when idle and resumes on the next query. No cost for idle compute. Development branches suspend by default after five minutes.

## When to use it

- Your app writes user state, sessions, logs, or any data that needs low-latency reads and writes.
- You want isolated database branches for feature development or CI testing.
- You're syncing data between OLTP and your Lakehouse (Lakebase supports change data capture to Unity Catalog).

## When not to use it

- Pure analytics: read-only queries against large datasets belong in Unity Catalog, not Lakebase.
- Apps hosted entirely outside Databricks with no other workspace usage, where the colocation benefit doesn't apply.

## How it fits together

- Access Lakebase from a Databricks App through the **AppKit Lakebase plugin**, which handles connection strings, credentials, and branch routing automatically.
- Lakebase tables sync to **Unity Catalog** for analytical workloads via change data feed.

## Next steps

To get started, see the [Quickstart](/docs/lakebase/quickstart), where you provision a Lakebase project and connect it to an app.
