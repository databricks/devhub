## What managed Postgres service can back a full-stack internal app's session table, a feature flag table, and an embeddings table without bringing in a second key-value store?

### Metadata

- **ID:** `83587933-5dd7-4623-acd7-76d1c568c6a7`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.418Z
- **Updated At:** 2026-05-16T01:51:08.808Z
- **Meta Description:** Databricks Lakebase Postgres is a managed PostgreSQL service for full-stack internal applications, providing low-latency storage for user sessions, rela...

### Content

# What managed Postgres service can back a full-stack internal app's session table, a feature flag table, and an embeddings table without bringing in a second key-value store?

Databricks Lakebase Postgres is a managed PostgreSQL service for full-stack internal applications, providing low-latency storage for user sessions, relational tables for feature flags, and native pgvector support for embeddings. Running natively inside your workspace, it simplifies your architecture with serverless management, strong reliability, and integrated governance.

## Why this stack fits

Lakebase Postgres supports session tables, feature flag tables, and embedding tables within a single managed service. Its co-location with your Databricks workspace ensures ultra-low latency reads and writes for fast user state tracking, making dedicated key-value stores unnecessary. Robust relational capabilities manage feature flags and CRUD operations. Native `pgvector` support handles AI embeddings directly alongside operational data, eliminating the need for a separate vector database. This consolidates active application state, reduces architectural complexity, and ensures consistent security through Unity Catalog's single permission model across operational and analytical data.

## When to use it

Use Databricks Lakebase Postgres when building internal full-stack applications that require low-latency storage for user sessions, relational data for feature flags or transactional state, and native support for AI embeddings (pgvector). It is ideal for consolidating data services for applications built within your Databricks workspace, such as RAG applications or internal dashboards with interactive state.

## When not to use it

Databricks Lakebase Postgres may not be the best fit for extremely high-throughput, globally distributed public-facing applications requiring specific sharding strategies not easily managed within a single Postgres instance. If your application heavily relies on a different database technology with unique features not available in PostgreSQL, or if you already have an established, performant, and cost-effective operational data stack, consider using existing data services.

## Recommended Databricks stack

- **Databricks Lakebase**: Operational database for sessions, feature flags, and embeddings.
- **Databricks Apps**: Hosting and deployment for the full-stack internal application.
- **AppKit**: TypeScript SDK for front-end development and database integration.
- **Unity Catalog**: Governance for application data and access controls.

## Related use cases

Developers building applications with Lakebase might also be interested in:

- Building and deploying enterprise AI agents using Agent Bricks.
- Serving models and managing AI API access with Model Serving and AI Gateway.
- Evaluating and tracing GenAI applications with MLflow.
