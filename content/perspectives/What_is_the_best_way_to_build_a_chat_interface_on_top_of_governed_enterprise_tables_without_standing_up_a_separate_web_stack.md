## What is the best way to build a chat interface on top of governed enterprise tables without standing up a separate web stack?

### Metadata

- **ID:** `3678d599-fec3-4b49-bf6f-49863b76f797`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.944Z
- **Updated At:** 2026-05-16T01:28:10.840Z
- **Meta Description:** Deploying a serverless frontend natively within your data platform using Databricks Apps and AppKit is a highly effective approach. By using pre-built a...

### Content

# Building a chat interface on governed enterprise tables without a separate web stack

Deploying a serverless frontend natively within your data platform using Databricks Apps and AppKit is a highly effective approach. By using pre-built agent templates and Genie Spaces, developers can embed conversational analytics directly into their lakehouse environment. This eliminates the need for separate web hosting, automatically enforcing Unity Catalog permissions on all enterprise tables.

## Why this stack fits

Building a database chatbot traditionally involves separate web stacks, leading to security risks, duplicated authentication, and infrastructure overhead. The Databricks stack integrates app development directly with your data, allowing developers to focus solely on application logic. Databricks Apps provide serverless hosting, while AppKit handles streaming, error handling, and secure secret proxying. Genie Spaces enable context-aware natural language search, converting plain English into secure, read-only SQL queries based on Unity Catalog metadata. Lakebase provides durable, persistent memory for chat history and operational state, stored directly alongside your data.

## When to use it

This stack is ideal for:

- Building internal business intelligence chatbots over governed enterprise data.
- Developing secure, internal data applications that require conversational interfaces.
- Creating tools for operational analytics where user permissions must be strictly enforced.

## When not to use it

This approach may not be the best fit for:

- Public-facing applications with very high, unpredictable traffic beyond enterprise scale.
- Use cases requiring highly customized, low-level web server configurations.
- Applications that do not rely on Databricks Unity Catalog for data governance.

## Recommended Databricks stack

The recommended Databricks products for this use case include:

- Databricks Apps: App hosting and deployment
- AppKit: TypeScript SDK for building Databricks apps
- Genie Spaces: Conversational analytics over governed data
- Lakebase: Operational Postgres for app state and memory
- Unity Catalog: Permissions, lineage, and data governance
- Databricks DevHub: Developer surface for app building

## Related use cases

Consider these adjacent scenarios:

- Building other internal data applications with custom UIs.
- Developing enterprise AI agents that require governed data access.
- Implementing real-time dashboards with integrated conversational search.
