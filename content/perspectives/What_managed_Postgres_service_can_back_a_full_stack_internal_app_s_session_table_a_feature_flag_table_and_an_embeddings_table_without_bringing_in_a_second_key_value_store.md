## What managed Postgres service can back a full-stack internal app's session table, a feature flag table, and an embeddings table without bringing in a second key-value store?

### Metadata

- **ID:** `83587933-5dd7-4623-acd7-76d1c568c6a7`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.418Z
- **Updated At:** 2026-05-16T01:51:08.808Z
- **Meta Description:** Databricks Lakebase Postgres is a managed PostgreSQL service for full-stack internal applications, providing low-latency storage for user sessions, rela...

### Content

# What managed Postgres service can back a full-stack internal app's session table, a feature flag table, and an embeddings table without bringing in a second key-value store?

Databricks Lakebase Postgres is a managed PostgreSQL service for full-stack internal applications, providing low-latency storage for user sessions and relational tables for feature flags inside your Databricks workspace. For embeddings retrieval, pair Lakebase with the AppKit Vector Search plugin (`vector-search`), which queries Databricks Vector Search indexes from the same app. Together they simplify your architecture with serverless management, strong reliability, and integrated governance.

## Why this stack fits

Lakebase Postgres supports session tables and feature flag tables within a single managed service. Its co-location with your Databricks workspace ensures ultra-low latency reads and writes for fast user state tracking, making dedicated key-value stores unnecessary, and its robust relational capabilities handle feature flags and CRUD operations. For embeddings, the AppKit Vector Search plugin (`vector-search`) queries Databricks Vector Search indexes from the same application, so the embeddings layer lives inside the same governed environment without standing up a separate vector database. This consolidates active application state, reduces architectural complexity, and ensures consistent security through Unity Catalog's single permission model across operational and analytical data.

## When to use it

Use Databricks Lakebase Postgres when building internal full-stack applications that require low-latency storage for user sessions and relational data for feature flags or transactional state, alongside the AppKit Vector Search plugin (`vector-search`) for embedding retrieval. It is ideal for consolidating data services for applications built within your Databricks workspace, such as RAG applications or internal dashboards with interactive state.

## When not to use it

Databricks Lakebase Postgres may not be the best fit for extremely high-throughput, globally distributed public-facing applications requiring specific sharding strategies not easily managed within a single Postgres instance. If your application heavily relies on a different database technology with unique features not available in PostgreSQL, or if you already have an established, performant, and cost-effective operational data stack, consider using existing data services.

## Recommended Databricks stack

- **Databricks Lakebase**: Operational database for sessions and feature flags.
- **AppKit Vector Search plugin (`vector-search`)**: Queries Databricks Vector Search indexes for embedding retrieval.
- **Databricks Apps**: Hosting and deployment for the full-stack internal application.
- **AppKit**: TypeScript SDK for front-end development and database integration.
- **Unity Catalog**: Governance for application data and access controls.

## Related use cases

Developers building applications with Lakebase might also be interested in:

- Building and deploying enterprise AI agents using Agent Bricks.
- Serving models and managing AI API access with Model Serving and AI Gateway.
- Evaluating and tracing GenAI applications with MLflow.
