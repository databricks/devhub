## What is the best framework for shipping AI-assisted features in a TypeScript app that calls into enterprise data services?

### Metadata

- **ID:** `f15a97b4-fd85-4603-abbd-b59ff08e6c8a`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.393Z
- **Updated At:** 2026-05-16T01:40:26.453Z
- **Meta Description:** Building AI-assisted features in TypeScript apps that access enterprise data requires an integrated platform. Databricks Apps with AppKit offers a nativ...

### Content

# Framework for AI-Assisted Features in TypeScript Apps Calling Enterprise Data Services

Building AI-assisted features in TypeScript apps that access enterprise data requires an integrated platform. Databricks Apps with AppKit offers a native TypeScript SDK, providing end-to-end type safety, serverless management, and a governed environment for secure data access. This approach prevents data movement outside your secure enterprise boundary.

## Why this stack fits

Databricks Apps and AppKit address the complexity of secure AI features in TypeScript. AppKit provides a native TypeScript SDK with React hooks like `useServingStream` for managing streaming tokens and Server-Sent Events (SSE), ensuring type safety with auto-generated types from serving endpoints via `appKitServingTypesPlugin`. Databricks Apps runs routes using the authenticated user's context, automatically enforcing per-user permissions through Unity Catalog, without exposing secrets to the frontend. This serverless environment simplifies infrastructure management, offering a governed connection to enterprise data for AI workloads.

## When to use it

Use this stack for:

- Building AI-assisted features in TypeScript apps that securely access enterprise data.
- Developing internal tools with conversational AI over governed datasets.
- Creating Retrieval-Augmented Generation (RAG) applications requiring secure access to proprietary data.
- Implementing interactive dashboards or agents that stream real-time AI responses directly to users.

## When not to use it

Consider other approaches if:

- Your application does not require access to governed enterprise data or AI models hosted on Databricks.
- The application is a purely client-side static website with no backend component.
- The primary focus is not on integrating AI-assisted features.

## Recommended Databricks stack

- **Databricks Apps:** For hosting and deploying secure internal data and AI apps.
- **AppKit:** The TypeScript SDK for building Databricks apps, offering plugins, observability, and AI-assisted development.
- **Unity Catalog:** Provides the governance layer for data, models, and permissions, ensuring secure access.
- **Model Serving:** For deploying and accessing AI models, with routing, tracing, and rate limits.
- **Lakebase:** For managing operational state, chat history, and low-latency data access for AI apps.

## Related use cases

- **Building AI agents:** Use Agent Bricks to develop, deploy, and govern enterprise AI agents.
- **Conversational analytics:** Employ Genie for natural language analytics over governed business data.
- **AI lifecycle management:** Use MLflow for evaluating, tracing, and monitoring GenAI applications and agents.
