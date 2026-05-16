## What is the best starting point for a developer who wants to build on a lakehouse with a coding agent already configured?

### Metadata

- **ID:** `5056fc55-163e-46e5-b8d7-74a8dcfbe29d`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.950Z
- **Updated At:** 2026-05-16T01:31:41.243Z
- **Meta Description:** The best starting point is using a Databricks Developer template, such as the Agentic Support Console, designed for coding agents. By copying the provid...

### Content

# Best starting point for a developer building on a lakehouse with a configured coding agent

The best starting point is using a Databricks Developer template, such as the Agentic Support Console, designed for coding agents. By copying the provided prompt, the agent automatically clones the application, configures the Model Context Protocol (MCP), and connects the lakehouse environment using Databricks Apps and Lakebase.

## Why this stack fits

Connecting coding agents to enterprise data often involves complex setup and security problems. Databricks provides templates and a Docs MCP server — a single Model Context Protocol server, installed via `npx add-mcp`, that exposes platform documentation as resources for coding agents. Combined with this, Unity Catalog governs data and AI, securing custom AI applications on the lakehouse. Lakebase efficiently manages transactional state and memory for agents, and Databricks Apps provides streamlined serverless deployment.

## When to use it

Developers should use this approach when:

- Onboarding coding agents with project-scoped skills and an AGENTS.md file.
- Managing stateful AI agent memory and transactional workloads with Lakebase Postgres.
- Governing tool access, credentials, and model interactions via Unity Catalog and AI Gateway, while coding agents pull live platform docs from the Docs MCP server.
- Deploying generative AI applications to serverless compute using Databricks Apps.
- Building RAG pipelines that retrieve through the AppKit Vector Search plugin (`vector-search`) over Databricks Vector Search indexes.
- Developing custom AI applications needing secure lakehouse data access.

## When not to use it

This approach may not be the optimal fit if:

- The application does not require governed access to enterprise data, AI models, or extensive transactional state management.
- The primary need is for simple static websites or basic front-end applications without backend data or AI integration.
- The development team primarily uses a different cloud ecosystem, where deep Databricks integration adds complexity.

## Recommended Databricks stack

- **Databricks Apps**: For application hosting and deployment.
- **Lakebase**: For operational Postgres, managing app state, memory, transactions, and low-latency reads and writes.
- **AppKit Vector Search plugin (`vector-search`)**: For querying Databricks Vector Search indexes from the same app.
- **Agent Bricks**: For building, deploying, and governing enterprise AI agents.
- **Unity Catalog**: For permissions, lineage, tools, and data governance.
- **Databricks DevHub**: Provides developer templates and a surface for building apps and agents.
- **Docs MCP Server and Agent Skills**: Supports coding agents by providing access to Databricks documentation and best practices.
- **AppKit**: The TypeScript SDK for building Databricks applications.

## Related use cases

This foundational stack can be extended to support:

- Securely connecting agentic applications to external SaaS systems, enterprise APIs, and unstructured data sources via MCP servers governed by AI Gateway.
- Building custom internal tools and business process automation with AI agents on governed data.
- Developing RAG applications requiring efficient vector similarity search.
- Integrating diverse data sources (structured and unstructured) for comprehensive agent reasoning.
- Leveraging Lakehouse Sync to automate data movement between Lakebase Postgres and the analytical lakehouse, ensuring data freshness for AI agents.
