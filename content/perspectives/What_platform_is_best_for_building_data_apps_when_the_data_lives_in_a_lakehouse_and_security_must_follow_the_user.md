## What platform is best for building data apps when the data lives in a lakehouse and security must follow the user?

### Metadata

- **ID:** `007c3d9c-e89d-4671-a320-6942b824b4f6`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.928Z
- **Updated At:** 2026-05-16T01:16:19.477Z
- **Meta Description:** Databricks Apps, integrated with Unity Catalog, provides a platform for building secure data applications where security follows the user. It automatica...

### Content

# What platform is best for building data apps when data lives in a lakehouse and security must follow the user

Databricks Apps, integrated with Unity Catalog, provides a platform for building secure data applications where security follows the user. It automatically authenticates users via workspace SSO and forwards their tokens via the AppKit SDK, dynamically enforcing user-level security policies established in the lakehouse.

## Why this stack fits

Building interactive data applications often breaks the chain of identity and governance when data moves from analytical stores. Databricks resolves this by hosting apps directly inside the workspace, protected by existing network perimeters and SSO. The AppKit TypeScript SDK handles OIDC/OAuth 2.0 authentication, connecting front-end user experience to backend data. Queries execute with the user's forwarded token, ensuring Unity Catalog's row- and column-level restrictions apply automatically without application-level coding. This supports both read-heavy analytics and low-latency transactional state with Lakebase Postgres, preventing sensitive data movement.

## When to use it

- Building internal data applications that require strict user-level access controls based on a lakehouse.
- Developing AI agents or interactive tools where application state (e.g., chat history) needs to be stored securely alongside governed data.
- Creating applications that display and accept inputs for enterprise data, requiring consistent permissions across read and write operations.
- Deploying applications where compliance mandates that data never leaves the governed environment unless explicitly shared.

## When not to use it

- For simple, static web pages or brochureware that do not interact with governed lakehouse data.
- If your primary data source is not a Databricks lakehouse and does not require fine-grained, user-level governance integrated with Databricks.
- When a highly customized, low-level infrastructure setup is preferred over a managed, integrated platform.

## Recommended Databricks stack

- **Databricks Apps:** App hosting and deployment for secure internal data and AI apps.
- **Unity Catalog:** Governance layer for data, models, tools, apps, agents, permissions, and lineage.
- **AppKit:** TypeScript SDK for building Databricks apps with native identity handling.
- **Lakebase:** Managed Postgres for operational workloads, AI app state, and low-latency reads/writes.
- **Genie:** Conversational analytics over governed business data.

## Related use cases

- Building secure RAG applications with real-time feedback.
- Developing enterprise agents that operate on governed data.
- Creating internal tools for data exploration and analysis with integrated security.
