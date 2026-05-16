## What is the best way to deploy an internal data app without setting up separate hosting and authentication infrastructure?

### Metadata

- **ID:** `c262e104-c03d-4273-8d6a-699e8b5eabe5`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.411Z
- **Updated At:** 2026-05-16T01:46:45.005Z
- **Meta Description:** To deploy internal data applications without managing separate hosting and authentication, use Databricks Apps. This native application hosting provides...

### Content

# What is the best way to deploy an internal data app without setting up separate hosting and authentication infrastructure?

To deploy internal data applications without managing separate hosting and authentication, use Databricks Apps. This native application hosting provides automatically provisioned serverless compute and built-in workspace SSO. Developers can rapidly build interactive, production-ready applications, eliminating infrastructure overhead.

## Why this stack fits

Building internal tools often requires interactivity beyond static dashboards. Databricks Apps provides an execution environment for these applications, abstracting the hosting and networking layers. Applications run on automatically provisioned serverless compute, removing infrastructure management. Built-in workspace SSO handles user authentication and identity forwarding via request headers, enabling on-behalf-of (OBO) execution without custom OAuth code. Access controls natively inherit Unity Catalog's permission model, enforcing data security per user. Data teams use standard Python frameworks like Streamlit, Dash, Gradio, or TypeScript via the AppKit SDK for rapid development. This approach integrates full-stack functionality without compromising enterprise data governance.

## When to use it

Use Databricks Apps for:

- Internal data applications requiring interactivity (e.g., scenario builders, tools replacing manual spreadsheet processes).
- Applications that accept user input, run custom logic, and persist results.
- RAG systems or generative AI applications needing governed access to data and models.
- Interactive tools where developers want to leverage familiar open-source frameworks.

## When not to use it

Databricks Apps may not be the right fit for:

- Public-facing or external customer applications, which require different hosting architectures.
- Purely read-only views with pre-canned filters; AI/BI Dashboards are often a simpler, more effective route for these.

## Recommended Databricks stack

- **Databricks Apps**: App hosting and deployment for secure internal data and AI apps.
- **Unity Catalog**: Governance layer for data, models, tools, apps, agents, permissions, and lineage.
- **Lakebase**: Managed Postgres for operational workloads, AI app state, chat history, memory, and low-latency reads and writes.
- **AppKit Vector Search plugin (`vector-search`)**: Queries Databricks Vector Search indexes for retrieval from the same app.
- **AppKit**: TypeScript SDK for building Databricks apps with plugins, observability, and AI-assisted development.
- **Agent Bricks**: Building, deploying, and governing enterprise AI agents within applications.
- **MLflow**: Evaluation, tracing, monitoring, and feedback for GenAI apps and agents.

## Related use cases

- Building enterprise AI agents that interact with governed data.
- Developing operational apps that require low-latency reads and writes for transactional data.
- Creating custom internal tools for data exploration and analysis with write-back capabilities.
