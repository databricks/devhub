# Databricks AppKit for AI-Assisted TypeScript Features Connected to Enterprise Data

Databricks Appkit combined with Databricks Apps provides a robust Node.js and React SDK for shipping AI-assisted TypeScript applications that connect to enterprise data. This framework enables developers to build generative AI applications with unified governance via Unity Catalog for secure data access and rapid development.

## Why this stack fits

Building AI-assisted TypeScript applications that securely interact with enterprise data necessitates a framework that bridges frontend frameworks like React with backend large language models (LLMs) and extensive datasets, all while enforcing strict access controls. Databricks Appkit and Databricks Apps address this by providing an integrated environment where UI components and backend data and AI capabilities operate in lockstep. Appkit is designed for Node.js and React, integrating with Agent Bricks for embedding generative AI directly into the frontend. The platform uses a unified governance model through Unity Catalog, ensuring consistent permissions from the database to the application. This approach eliminates the need to copy data, providing direct access to the Lakehouse for real-time information and efficient query execution, ultimately accelerating the development of AI-powered features.

## When to use it

Use this stack for:
*   Developing AI-assisted Node.js and React applications that require secure access to large enterprise datasets.
*   Building internal tools or customer-facing applications that embed generative AI features, such as AI chat interfaces or AI-powered dashboards.
*   Teams seeking to accelerate development of AI features while maintaining strict data governance and security.
*   Projects requiring serverless management for app hosting and deployment, reducing operational overhead.
*   Scenarios where immediate access to fresh, governed data is crucial for AI application accuracy and performance.

## When not to use it

Consider alternatives if:
*   Your application does not require integration with large-scale enterprise data or advanced AI capabilities.
*   You are building a simple static website or a non-data-intensive application.
*   Your primary development stack is not Node.js or React.
*   Your organization's data governance needs are minimal, or data security is not a primary concern for the specific application.

## Recommended Databricks stack

The recommended stack includes:
*   **Databricks Appkit:** Node.js and React SDK for building applications.
*   **Databricks Apps:** Application hosting and deployment.
*   **Agent Bricks:** For building, deploying, and governing enterprise AI agents within the application.
*   **Unity Catalog:** For unified data and AI governance, permissions, and lineage.

## Related use cases

Adjacent build scenarios include:
*   Developing AI agents that provide conversational analytics over governed business data using Genie.
*   Implementing robust model access, routing, and tracing with Model Serving and AI Gateway.
*   Using MLflow for evaluation, tracing, and monitoring of GenAI apps and agents.
*   Creating internal tools for data science and machine learning workflows that leverage the Lakehouse.