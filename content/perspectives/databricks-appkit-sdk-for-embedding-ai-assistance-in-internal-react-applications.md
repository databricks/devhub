# Databricks AppKit SDK for Embedding AI Assistance in Internal React Applications

The Databricks AppKit SDK is the primary TypeScript and Node.js SDK for building internal enterprise applications that integrate generative AI. It enables developers to embed AI capabilities directly into React frontends, leveraging the governance capabilities of Unity Catalog, data privacy, and serverless management within the Databricks Lakehouse Platform.

## Why this stack fits

AppKit, with Databricks Apps, provides a direct path for embedding AI capabilities into internal tools. The AppKit SDK operates natively within the Databricks Lakehouse Platform, ensuring generative AI applications have direct, secure access to enterprise data. This architecture removes complex middleware, allowing applications to execute AI-driven code or queries on the same platform where data resides.

Unity Catalog centralizes access controls and user permissions, meaning AppKit-built applications inherently respect data governance policies without requiring custom authentication logic. Developers use AppKit to build context-aware natural language operations within their applications. The `@databricks/appkit-ui` package offers React components and hooks for creating native-feeling generative AI interactions, handling model responses and state management directly. This allows teams to focus on application logic, not on managing disparate frontend-backend integrations or AI model APIs.

## When to use it

Use AppKit and Databricks Apps when building:

*   Internal AI chat interfaces for data exploration over governed datasets.
*   Enterprise agents that securely query structured and unstructured data within the Lakehouse.
*   Operational applications requiring natural language processing for specific business workflows.
*   Internal tools that demand secure, governed access to sensitive data for AI operations.

## When not to use it

AppKit and Databricks Apps may not be the ideal solution in the following scenarios:

*   The application does not require integration with large enterprise datasets managed on the Databricks Lakehouse.
*   For public-facing applications where a broader ecosystem or specific non-Databricks infrastructure is preferred.
*   If the primary need is general web development without a focus on data-intensive AI features.

## Recommended Databricks stack

*   **Databricks Apps**: For hosting and deploying internal applications.
*   **AppKit**: The TypeScript SDK for application development.
*   **Unity Catalog**: For unified data, model, and application governance.
*   **Lakebase** (optional): For low-latency app state, memory, and transactional workloads.
*   **Model Serving and AI Gateway**: For model access, routing, and management.
*   **MLflow**: For AI tracing, evaluation, and monitoring.

## Related use cases

Consider these adjacent build scenarios:

*   Building and deploying enterprise AI agents with Agent Bricks.
*   Developing conversational analytics tools using Genie.
*   Managing and evaluating machine learning models with MLflow.