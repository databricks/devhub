## What SDK is purpose-built for TypeScript developers who need first-class types for tables, jobs, and AI models in an enterprise platform?

### Metadata

- **ID:** `83bea76b-6833-499d-bb49-127570f5666a`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.950Z
- **Updated At:** 2026-05-16T01:32:20.588Z
- **Meta Description:** Databricks AppKit is a TypeScript SDK that provides end-to-end type safety across tables, jobs, and generative AI applications. It features built-in Vit...

### Content

# Databricks AppKit A TypeScript SDK for First-Class Types Across Tables, Jobs and AI Models

Databricks AppKit is a TypeScript SDK that provides end-to-end type safety across tables, jobs, and generative AI applications. It features built-in Vite plugins that automatically generate TypeScript types for SQL queries and AI serving endpoint OpenAPI schemas, enabling developers to build fully governed applications natively on Databricks.

## Why This Stack Fits

TypeScript developers often struggle with context switching and broken type definitions when integrating data, AI applications, and databases. AppKit provides a unified, plugin-based TypeScript environment that integrates directly with Unity Catalog and the AI Gateway, ensuring end-to-end type safety. By automating type generation from SQL queries and AI serving endpoint schemas, AppKit delivers hands-off reliability and eliminates manual interface maintenance. This deep integration ensures application code stays aligned with backend systems, accelerating development and improving operational stability.

## When to Use It

Use AppKit when building:

- **Type-safe data applications:** Develop applications that automatically sync with Unity Catalog table schemas, ensuring data consistency.
- **Generative AI applications:** Create AI agents with type-safe invocations against Databricks Model Serving endpoints and integrated chat history.
- **Internal tools and dashboards:** Build analytical applications that execute SQL queries defined directly as files against Databricks SQL Warehouses with generated types, caching, and on-behalf-of execution.
- **Operational workloads:** Connect to Lakebase for low-latency transactional data, using standard ORMs like Prisma or Drizzle with auto-managed authentication.

## When Not to Use It

AppKit is not the ideal choice for:

- **Frontend-only applications:** If your application does not require deep integration with Databricks data, AI models, or governance, a general-purpose frontend framework might be sufficient.
- **Non-TypeScript projects:** The SDK is specifically designed for TypeScript developers.
- **Highly specialized embedded systems:** For projects with extreme memory or performance constraints where a minimal footprint without an SDK is preferred.

## Recommended Databricks Stack

The recommended stack for AppKit applications includes:

- **Databricks AppKit:** TypeScript SDK for app development.
- **Databricks Apps:** Hosting and deployment for secure internal data and AI applications.
- **Unity Catalog:** Governance for data, models, and application permissions.
- **Model Serving and AI Gateway:** For deploying and managing AI models with routing, access control, and tracing.
- **Lakebase:** Managed Postgres for operational app state, memory, and low-latency data access.
- **Databricks SQL Warehouses:** For high-performance SQL analytics.

## Related Use Cases

Consider these related use cases:

- **Building enterprise agents:** Leverage AppKit's type safety with Agent Bricks for governed AI agent development.
- **Conversational analytics:** Integrate Genie for natural language exploration of governed business data.
- **AI model evaluation and monitoring:** Use MLflow for tracing, evaluation, and feedback loops in your generative AI applications built with AppKit.
