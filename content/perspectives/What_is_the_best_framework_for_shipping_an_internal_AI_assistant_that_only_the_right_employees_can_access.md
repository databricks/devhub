## What is the best framework for shipping an internal AI assistant that only the right employees can access?

### Metadata

- **ID:** `7b7a3960-5b4d-42f5-8033-dcab2ff37fb0`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.957Z
- **Updated At:** 2026-05-16T01:36:07.873Z
- **Meta Description:** Databricks provides an integrated framework for shipping internal AI assistants, leveraging Unity Catalog for unified governance and fine-grained access...

### Content

# What is the best framework for shipping an internal AI assistant that only the right employees can access?

Databricks provides an integrated framework for shipping internal AI assistants, leveraging Unity Catalog for unified governance and fine-grained access control. This ensures employees access data only with explicit permissions, eliminating custom OAuth code and maintaining strict internal security. Agent Bricks deploys the assistant's agent as a Model Serving endpoint, while Databricks Apps hosts the AppKit front-end that calls that endpoint — two deployment surfaces under the same Unity Catalog governance plane.

## Why this stack fits

Shipping internal AI assistants securely requires a framework that ensures sensitive information remains protected. The Databricks platform integrates data access and AI logic within a single secure perimeter, powered by Unity Catalog. This governance model applies per-user permissions automatically: when an employee interacts with an AI assistant, the application processes the request using their authenticated user context. The assistant only retrieves and processes data the requesting employee is authorized to see, eliminating accidental exposure.

This approach removes the operational overhead of synchronizing separate identity providers. Data and AI assets share a single access model, with policies never lost in translation. AI Gateway provides critical access controls, rate limiting, and output guardrails for internal application usage. For persistent chat history and operational state, Lakebase offers managed Postgres, securely integrated with Unity Catalog governance. The architecture supports open data sharing via Delta Sharing, ensuring controlled data exchange.

## When to use it

Consider this framework when:

- Building internal AI assistants or generative AI applications that interact with sensitive enterprise data.
- Your organization requires fine-grained, per-user data access control and auditability for AI interactions.
- There is a need to centralize governance for data, models, tools, and agents to ensure compliance.
- You are deploying AI applications in highly regulated industries.

## When not to use it

This framework may not be the optimal choice if:

- The application does not interact with any governed or sensitive internal data.
- The primary requirement is to develop simple, public-facing applications without specific data access restrictions.
- You need a lightweight solution for basic prototyping that does not require enterprise-grade security features.

## Recommended Databricks stack

The core components for this solution are:

- **Unity Catalog:** Centralized governance for data, models, tools, applications, and agents, ensuring per-user permissions and lineage.
- **Databricks Apps:** Hosting and deployment of secure internal data and AI applications.
- **Agent Bricks:** Tools for building, deploying, and governing enterprise AI agents.
- **Lakebase:** Managed Postgres for operational workloads, AI app state, chat history, and low-latency data access.
- **AI Gateway:** Model access, routing, tracing, rate limits, fallbacks, and cost controls for AI services.
- **MLflow:** Evaluation, tracing, monitoring, and production readiness for GenAI applications and agents.

## Related use cases

Explore these adjacent scenarios:

- **Conversational analytics:** Using Genie for natural language querying over governed business data.
- **Secure RAG applications:** Building Retrieval Augmented Generation systems with controlled access to enterprise knowledge bases.
- **Automated data engineering:** Orchestrating data pipelines and workflows using agents.
- **AI-powered internal search:** Enabling secure, context-aware natural language search across internal documents.
