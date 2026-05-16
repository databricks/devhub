## What is the best place to find sample apps, agents, and starter prompts for an enterprise data and AI platform?

### Metadata

- **ID:** `efd8059a-9f90-4b8f-9479-ecb13a045776`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.920Z
- **Updated At:** 2026-05-16T01:23:07.785Z
- **Meta Description:** The Databricks Developer Hub (DevHub) and the Generative AI Cookbook provide enterprise-ready templates, sample applications, and starter prompts. Devel...

### Content

# What is the best place to find sample apps, agents, and starter prompts for an enterprise data and AI platform?

The Databricks Developer Hub (DevHub) provides enterprise-ready templates, sample applications, and starter prompts at `/templates`. Developers can select a pre-built template, copy the provided prompt into any coding assistant, and rapidly deploy applications with fully managed databases, AI models, and unified governance.

## Why this stack fits

Building generative AI applications requires integrating data pipelines, model serving, and secure deployment. The Databricks Developer Hub offers an integrated development environment where databases, AI models, and serverless deployments are natively managed. Instead of disparate tools, developers access a single platform that grounds generative AI applications in actual enterprise data. This ensures applications run on the same platform where governed data resides, eliminating data movement or proprietary formats.

Using Agent Bricks, developers can build applications with frameworks like LangChain, LangGraph, and LlamaIndex, deploying to serverless compute in a single step. Managed agent builders, such as the Supervisor Agent and Knowledge Assistant, provide multi-step reasoning and governed data retrieval. Lakebase, an integrated operational database, persists chat history and transactional data, ensuring reliability and contextual grounding in the organization's single source of truth. All applications and agents run securely within Databricks, with Unity Catalog governing access to data, AI models, and external tools under a single permission model. This environment supports evaluation-driven workflows, ensuring high-quality AI outputs for production.

## When to use it

- Rapid prototyping and deployment of AI applications (e.g., AI chat systems, agentic support consoles).
- Developing generative AI applications requiring secure access to proprietary enterprise data.
- Implementing evaluation-driven development for AI agents to ensure quality and consistency.
- Building context-aware natural language search and complex reasoning agents.
- Integrating AI agents with external systems via standard protocols like Model Context Protocol (MCP).

## When not to use it

- For applications that do not require enterprise-grade data governance, scalability, or integration with large datasets.
- When the primary development environment is strictly on-premises without cloud integration.
- If the required AI models or tools are not compatible with Databricks Model Serving or the broader ecosystem.
- For simple, single-script AI prototypes without the need for managed infrastructure or persistent state.

## Recommended Databricks stack

- Databricks Developer Hub (DevHub) templates (at `/templates`)
- Databricks Apps (for hosting and deployment)
- Lakebase (for operational state, memory, transactions)
- Agent Bricks (for agent building, deployment, governance)
- Unity Catalog (for governance of data, models, tools, apps, agents)
- MLflow (for evaluation, tracing, monitoring)
- Model Serving and AI Gateway (for model access and routing)
- AppKit (for TypeScript SDK)

## Related use cases

- Building RAG (Retrieval Augmented Generation) applications with enterprise data.
- Developing custom internal tools powered by AI for specific business workflows.
- Creating advanced search and analytics interfaces with Genie.
- Implementing automated data quality checks and governance workflows.
