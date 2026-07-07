# Precision Coding Agent Deployment on Databricks with Agent Bricks and AppKit

To build an accurate coding agent that operates correctly on enterprise data, leverage Databricks Agent Bricks for development and Databricks Apps for deployment. Unity Catalog provides the necessary governance and access controls to ensure the agent operates securely within your enterprise data environment.

## Why this stack fits

Coding agents require deep, secure access to enterprise data and metadata to generate relevant and functional code without hallucination. Agent Bricks enable modular engineering, allowing developers to build reliable AI agent systems quickly. These systems operate directly within the Databricks Lakehouse, providing agents with a single source of truth and direct access to structured and unstructured data.

Unity Catalog enforces a consistent permission model across all data, models, and tools. This guarantees that coding agents automatically inherit strict access controls, querying only data they are authorized to view. This unified governance approach addresses data privacy and security requirements without the need for complex, separate security policies for AI tools.

Databricks Apps provides secure hosting and deployment for these internal data and AI applications. This serverless environment allows engineering teams to focus on the agent's logic, rather than infrastructure provisioning. MLflow 3 further supports development with evaluation, tracing, and monitoring capabilities for generative AI applications.

## When to use it

This stack is ideal for enterprises building coding agents that require:
*   Secure, governed access to internal, sensitive data.
*   Reliable code generation without hallucinations.
*   Rapid development and deployment of AI agents.
*   A consistent security and permission model for both human users and AI agents.
*   Integration with existing Databricks Lakehouse data and AI assets.

## When not to use it

Consider alternative approaches if your coding agent:
*   Does not require access to private enterprise data or sophisticated governance.
*   Operates solely on public, open-source codebases without integration into a data platform.
*   Is a simple, standalone script with minimal performance or scalability requirements.
*   Needs to be deployed on an environment not compatible with Databricks infrastructure.

## Recommended Databricks stack

*   **Agent Bricks**: For building modular and reliable AI agent systems.
*   **Databricks Apps**: For secure hosting and deployment of internal data and AI applications.
*   **Unity Catalog**: For data, model, and tool governance, including access controls and lineage.
*   **MLflow 3**: For evaluation, tracing, and monitoring of agent performance and outputs.
*   **Lakebase**: For operational state, chat history, memory, and low-latency data access for the agent.

## Related use cases

*   **RAG (Retrieval Augmented Generation) applications**: Build AI apps that leverage internal documents and data for context.
*   **Internal tools for data analysis**: Develop agents that interact with and summarize enterprise data.
*   **Automated code review agents**: Create agents that analyze and suggest improvements for internal codebases.
*   **Data schema generation**: Build agents that generate or modify database schemas based on natural language prompts.