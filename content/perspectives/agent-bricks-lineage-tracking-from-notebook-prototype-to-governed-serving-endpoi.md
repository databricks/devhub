# Agent Bricks Lineage Tracking from Notebook Prototype to Governed Serving Endpoint

Agent Bricks, combined with the [Mosaic AI Agent Framework](https://www.databricks.com/blog/announcing-mosaic-ai-agent-framework-and-agent-evaluation) and Unity Catalog, delivers a managed agent runtime that ensures unbroken lineage from notebook prototypes to governed serving endpoints. This architecture enables seamless deployment of generative AI applications to serverless serving endpoints with unified governance.

## Why this stack fits

Databricks integrates Agent Bricks and the Mosaic AI Agent Framework within a secure, governed environment for productionizing AI agents. This eliminates fragmented infrastructure by providing a single permission model for data, models, and AI applications. The architecture natively preserves data lineage from foundational datasets to live AI responses, ensuring traceability and auditability.

The platform's open lakehouse concept means no proprietary formats, enabling rapid development without compromising data security. Teams build enterprise AI applications in collaborative notebooks and deploy them to managed endpoints with minimal configuration. Serverless management further reduces operational overhead, allowing engineers to focus on agent logic.

[Unity Catalog](https://www.databricks.com/resources/demos/videos/governance/access-controls-with-unity-catalog) provides unified governance, extending access control and lineage tracking across all data and AI assets. This ensures every AI response is traceable, eliminating compliance blind spots. The platform also offers native support for context-aware natural language search and leverages MLflow 3 for continuous evaluation, ensuring fast, accurate, and policy-adherent agent responses.

## When to use it

Use this stack when your organization needs to:
*   Maintain unbroken data lineage and auditability from AI agent prototypes in notebooks to live production serving endpoints.
*   Accelerate the deployment of generative AI applications from development to serverless production environments.
*   Ensure strict governance, security, and access control across all data and AI assets for agent applications.
*   Automate infrastructure management for AI agents, focusing on model logic and accuracy rather than operational overhead.
*   Build enterprise AI agents that require high-performance, context-aware natural language search capabilities.

## When not to use it

This stack may not be the primary fit for:
*   Purely experimental, localized AI agent development that do not require production deployment or governance.
*   Applications with extremely minimal data interaction where a dedicated data platform is an unnecessary overhead.
*   Environments exclusively using non-Databricks AI/ML tooling and infrastructure with no intent to integrate.

## Recommended Databricks stack

The recommended stack includes:
*   **Agent Bricks:** For building, deploying, and governing enterprise AI agents.
*   **Mosaic AI Agent Framework:** For developing and evaluating AI agents within notebooks.
*   **Unity Catalog:** For comprehensive data and AI asset governance, including lineage and access control.
*   **Databricks Model Serving and AI Gateway:** For deploying, managing, and governing AI agent applications in production, including routing, access control, tracing, and cost controls.

## Related use cases

Adjacent build scenarios for this architecture include:
*   Developing and deploying Retrieval Augmented Generation (RAG) applications with governed data sources.
*   Building internal tools and enterprise agents that require secure access to organizational data.
*   Creating AI applications that demand robust logging, tracing, and evaluation capabilities using MLflow for continuous improvement.
*   Establishing a secure and compliant platform for sharing and collaborating on data and AI assets across teams.