---
title: What is Databricks Apps?
sidebar_label: Overview
description: Databricks Apps hosts web applications inside your workspace with built-in auth, managed compute, and direct access to your data.
---

# What is Databricks Apps?

Databricks Apps hosts your web app inside your workspace. It gets a fixed URL, built-in OAuth, and direct access to your workspace data and services. No separate hosting service, no auth layer to build, no credential rotation to manage.

**AppKit** is the TypeScript SDK for building those apps. It provides pre-built React UI components, type-safe data access, and a plugin system for connecting to Databricks services.

## How it works

AppKit uses a three-layer architecture with plugins that register capabilities at each layer:

- **Client**: React frontend served by Vite. The `@databricks/appkit-ui` package provides data tables, charts, dialogs, and layout components.
- **Server**: Express HTTP server with Databricks OAuth built in. Plugins attach routes and middleware at this layer.
- **Data**: Plugin-based access to Databricks resources. Each plugin wraps a resource type and exposes a typed API on the `AppKit` object.

| Plugin                                             | What it adds                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [**server**](/docs/appkit/v0/plugins/server)       | Express HTTP server, static file serving, Vite dev mode (always included)                                                    |
| [**lakebase**](/docs/appkit/v0/plugins/lakebase)   | Postgres connection pool for [Lakebase Postgres](/docs/lakebase/quickstart) with automatic OAuth token refresh               |
| [**analytics**](/docs/appkit/v0/plugins/analytics) | SQL query execution against [Databricks SQL Warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/index.html) |
| [**genie**](/docs/appkit/v0/plugins/genie)         | [Genie space](/docs/agents/genie) integration for natural-language data queries                                              |
| [**serving**](/docs/appkit/v0/plugins/serving)     | Authenticated proxy to [Model Serving](/docs/agents/ai-gateway) endpoints with streaming support                             |
| [**files**](/docs/appkit/v0/plugins/files)         | File operations against [Unity Catalog Volumes](https://docs.databricks.com/aws/en/files/index.html)                         |

## How auth works

Every app gets a dedicated service principal. Databricks injects its credentials at runtime, so your app can call workspace APIs without managing tokens. By default, all requests run as this service principal and all users share its permissions. When you need per-user data access, Databricks can forward the signed-in user's token via `x-forwarded-access-token`. AppKit's built-in [Genie](/docs/agents/genie) and [Model Serving](/docs/agents/ai-gateway) plugins handle this automatically.

## When to use it

- You're building a web app, internal tool, or API that reads or writes Databricks data.
- You want auth handled by the platform, without building login flows, token rotation, or session management.
- You're deploying an AI agent (agents run as Apps).

## When not to use it

- Your app is a static site with no Databricks data access.
- You're serving users outside your Databricks account (for example, public-facing apps or customers without Databricks access).

## Next steps

[Templates](/templates) are agent-ready prompts organized by use case. Find one that fits, or see the [Apps Quickstart](/docs/apps/quickstart) for a step-by-step walkthrough.
