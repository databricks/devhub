---
title: Read Unity Catalog tables
sidebar_label: Analytical reads
description: Read governed Unity Catalog tables from your AppKit app with the Analytics plugin. SQL files, on-behalf-of-user queries, SQL warehouse resource binding.
---

# Read Unity Catalog tables

To run analytical queries against tables in Databricks from your AppKit app, you need a SQL warehouse (Databricks's SQL compute). The [Analytics plugin](/docs/appkit/v0/plugins/analytics) wires your handler to one: SQL files go in `config/queries/`, the warehouse executes them, and typed rows come back. Your handler does not check permissions.

The tables the warehouse queries are governed by Unity Catalog (UC). UC owns the three-level namespace (`catalog.schema.object`) and applies grants, row filters, column masks, and ABAC (attribute-based access control) policies on every access. Beyond tables, UC also governs views, materialized views, volumes, models, vector search indexes, and registered functions.

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A SQL warehouse declared as an app resource in `databricks.yml`. Your app's service principal gets `CAN_USE` automatically when you bind the resource. End-user permissions are covered [below](#where-403s-come-from).

## What the Analytics plugin reads

All UC objects sit in a `catalog.schema.object` namespace. The objects this plugin queries:

- **Tables** (Delta and Iceberg).
- **Views** and **materialized views**.
- **Streaming tables**.
- **Functions** called as `SELECT my_catalog.my_schema.my_function(...)`.

Other UC objects use other plugins. Volumes (file storage) go through the [Files plugin](/docs/appkit/v0/plugins/files). The full UC object list lives in [Securable objects](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects).

## Wire the Analytics plugin

Register the plugin in `createApp`. It exposes Analytics endpoints and reads queries from `config/queries/` against the SQL warehouse you bind in `app.yaml`.

```typescript title="server/server.ts"
import { createApp, server, analytics } from "@databricks/appkit";

await createApp({
  plugins: [server(), analytics({})],
});
```

Bind the SQL warehouse in `app.yaml` so the platform sets `DATABRICKS_WAREHOUSE_ID` at startup:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_WAREHOUSE_ID
    valueFrom: sql-warehouse
```

The matching resource lives in `databricks.yml`. See [App configuration](/docs/apps/configuration#resources) for the full resource list and `valueFrom` keys.

## Author SQL files

Put `.sql` files in `config/queries/`. The filename without `.sql` becomes the query key.

```sql title="config/queries/spend_summary.sql"
-- @param startDate DATE
-- @param endDate DATE
SELECT date_trunc('day', usage_date) AS day, SUM(usage_quantity) AS qty
FROM system.billing.usage
WHERE usage_date BETWEEN :startDate AND :endDate
GROUP BY 1
ORDER BY 1;
```

The execution context is set by the filename:

- `spend_summary.sql` runs as the **app service principal**. The cache is shared across users.
- `spend_summary.obo.sql` runs as the **signed-in user**. The cache is per-user. Unity Catalog applies that user's grants, row filters, column masks, and ABAC policies.

For the full plugin API, including parameter types and Arrow streaming, see the [Analytics plugin reference](/docs/appkit/v0/plugins/analytics).

## Render in React with `useAnalyticsQuery`

```tsx title="client/src/SpendTable.tsx"
import { useMemo } from "react";
import { useAnalyticsQuery } from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";

export function SpendTable() {
  const params = useMemo(
    () => ({
      startDate: sql.date("2025-01-01"),
      endDate: sql.date("2025-12-31"),
    }),
    [],
  );

  const { data, loading, error } = useAnalyticsQuery("spend_summary", params);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.day}>
          {row.day}: {row.qty}
        </li>
      ))}
    </ul>
  );
}
```

:::important[Wrap parameters in useMemo]

`useAnalyticsQuery` refetches whenever its parameters reference changes. An inline object creates a new reference on every render, which loops forever. Wrap parameters in `useMemo`.

:::

## Where 403s come from

The identity attached to each query is set by the filename:

- **Service principal queries** (`*.sql`) use the app's service principal. The SP needs `SELECT` on the underlying tables. Permission errors return `403` from the warehouse.
- **On-behalf-of-user queries** (`*.obo.sql`) use the signed-in user. UC applies their grants automatically. If the user lacks `SELECT`, or if a row filter or column mask hides the data, the call returns a `403` or fewer rows. You don't write the permission check.

:::note[OBO is in Public Preview]

On-behalf-of-user authorization is in Public Preview. A workspace admin must enable it before scopes can be added to your app. See [App authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) for the platform details.

:::

## Lakehouse Federation

Lakehouse Federation makes foreign sources (Snowflake, BigQuery, Oracle, Redshift) appear as UC catalogs. Once registered, they look like any other UC table to the Analytics plugin: same `catalog.schema.table` reference, same SQL file, same OBO. The warehouse pushes filters and aggregates down to the foreign source where possible, and reads remaining data at query time without persisting it in UC. See [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) for the source list, setup, and per-source pushdown coverage.

## Natural-language queries

For natural-language Q&A over UC tables (curated datasets plus a knowledge store plus a compound AI system that turns questions into SQL), use [Genie](/docs/agents/genie). For a working setup, see the [Genie Conversational Analytics](/templates/genie-conversational-analytics) template. The Genie plugin lives in the Agent Bricks section because it is an agent integration, not a SQL one.

## Where to next

Try [Set Up Unity Catalog with External Storage](/templates/unity-catalog-setup) to provision a catalog, or [Volume File Manager](/templates/volume-file-upload) to add UC Volumes to your app. Then explore [Lakeflow Jobs](/docs/lakehouse/jobs) for triggering work, or [Pipelines and freshness](/docs/lakehouse/pipelines) for "last updated" signals.
