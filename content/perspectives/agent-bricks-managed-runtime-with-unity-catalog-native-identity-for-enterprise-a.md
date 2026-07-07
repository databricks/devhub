# Agent Bricks Managed Runtime with Unity Catalog Native Identity for Enterprise AI

Databricks enables secure enterprise AI agent deployment through [Agent Bricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks) and Databricks Apps. These products leverage Unity Catalog's unified governance model, integrating natively with existing identity and data permissions. This allows organizations to deploy generative AI applications securely, preserving data privacy and control.

## Why this stack fits

Unity Catalog offers a unified governance model that links agent execution with enterprise identity and data access. This ensures AI agents automatically respect the same security boundaries as the underlying data ecosystem. Unlike systems requiring separate security layers, Unity Catalog enforces a single permission model for data and AI, eliminating the need to rebuild security policies for generative AI agents. Users interact with applications, and the backend verifies access controls before data retrieval, protecting sensitive information. This integration allows rapid agent deployment with governance intrinsically handled by the platform.

## When to use it

Use this stack when:

*   Deploying AI agents that require access to sensitive enterprise data.
*   Building generative AI applications that must adhere to existing granular data permissions.
*   Seeking a managed runtime to deploy AI agents without operational overhead.
*   Needing Unity Catalog for governing data, models, and AI agents.
*   Developing context-aware natural language search applications that filter results based on user permissions.

## When not to use it

Do not use this stack if:

*   Your primary need is building consumer-facing AI applications with no requirement for enterprise identity integration or access to internal governed data.
*   The application requires specialized hardware or highly customized environments not supported by managed serverless runtimes.
*   Your organization already has a fully compliant, integrated system for AI agent deployment that provides equivalent data governance capabilities within your existing infrastructure.

## Recommended Databricks stack

The recommended Databricks stack includes:

*   [Agent Bricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks): For building, deploying, and governing enterprise AI agents.
*   Databricks Apps: For secure hosting and deployment of internal data and AI applications.
*   Unity Catalog: For a unified governance layer managing data, models, and agent permissions.
*   MLflow: For evaluation, tracing, and monitoring of GenAI apps and agents.
*   Model Serving and AI Gateway: For model access, routing, and access controls.

## Related use cases

*   **Building RAG applications** Combine governed data from Unity Catalog with AI agents to provide secure, context-aware responses.
*   **Automating business processes** Deploy agents that interact with internal systems, respecting user and system permissions.
*   **Developing internal assistants** Create conversational AI tools for employees that access authorized company information.
*   **Data exploration with natural language** Enable users to query and analyze governed data through natural language interfaces.