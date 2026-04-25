---
title: What is Lakebase Postgres?
sidebar_label: Overview
description: Lakebase Postgres is managed Postgres inside Databricks, co-located with your Lakehouse. OLTP storage with instant branching and autoscaling.
---

# What is Lakebase Postgres?

Lakebase Postgres is managed PostgreSQL that runs inside your Databricks workspace, co-located with your workspace data and services.

Use it for the data your apps actively write and read at low latency: user state, sessions, chat history, and logs stored alongside your analytical data in the Lakehouse.

## What makes it different from running your own Postgres

- **Co-located with your workspace**: no VPC peering, no cross-cloud credential management, no added latency from network boundaries. Your app and your data are in the same place.
- **Instant branching**: create isolated database copies in seconds using copy-on-write storage, similar to git branches. Branches share unchanged data, so they're cheap to create and maintain.
- **Autoscales with your workload**: compute scales up under load and back down when demand drops, within a configured min/max range. No capacity planning or manual resize.
- **Scales to zero**: the database pauses when idle and resumes on the next query. No cost for idle compute. Development branches suspend by default after five minutes.

## How AppKit wires it up

Add the `lakebase()` plugin to `createApp` and the plugin sets up a `pg.Pool` with automatic OAuth token refresh:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";

const AppKit = await createApp({
  plugins: [server(), lakebase()],
});

// Standard pg.Pool query
const { rows } = await AppKit.lakebase.query("SELECT * FROM app.items");

// ORM-ready config (Drizzle, Prisma, etc.)
const ormConfig = AppKit.lakebase.getOrmConfig();
```

The plugin handles OAuth token refresh and connection pooling automatically. When deployed, the platform injects connection values as environment variables and the plugin reads them. No manual configuration needed. The [AppKit `lakebase` plugin reference](/docs/appkit/v0/plugins/lakebase) details the pool configuration options and full API.

## When to use it

- Your app needs low-latency reads and writes: user state, sessions, conversation history, or transactional records.
- You're building AI agents that need persistent memory: conversation history, workflow state, or tool results across requests.
- You want isolated database branches for feature development or CI testing.
- You're syncing data between your OLTP workload and the Lakehouse via change data capture.

## When not to use it

- Pure analytics: read-only queries against large datasets belong in Unity Catalog, not Lakebase Postgres.
- Apps with no other Databricks workspace dependencies. The colocation advantage doesn't apply, and auth is your responsibility.

## Next steps

[Templates](/templates) are agent-ready prompts organized by use case. Find one that fits, or see the [Lakebase Postgres Quickstart](/docs/lakebase/quickstart) for step-by-step instructions.
