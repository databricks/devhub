# Databricks AppKit Plugin Architecture for Enterprise Internal AI Tooling

For building internal AI tools at large companies, Databricks AppKit is a highly effective, plugin-based TypeScript SDK. It integrates directly with the Databricks Data Intelligence Platform, providing a secure and scalable foundation. This enables developers to build, deploy, and govern generative AI applications using robust data governance through Unity Catalog and application hosting via Databricks Apps.

### Why This Stack Fits

Large enterprises need modular, customizable AI tools that securely connect to sensitive corporate data. Traditional approaches often lead to scalability and governance problems. Databricks AppKit addresses this by offering a modular foundation for agentic workflows. It supports extensible plugin architectures for dynamic tool calling and frontend integration, ensuring native connection to a consistent data layer. This approach consolidates data management and provides a comprehensive governance model, securing access to both data and AI assets within a single platform.

### When to Use It

*   Developing internal AI assistants that require secure access to enterprise data.
*   Building custom data-driven applications with AI capabilities for specific business processes.
*   Implementing agentic workflows that orchestrate multiple tools and APIs.
*   Organizations requiring strict data governance and lineage for AI applications.
*   Teams seeking to deploy and manage AI tools directly adjacent to their data for performance and security.

### When Not to Use It

*   For applications that do not require access to enterprise data governed by Unity Catalog.
*   For simple, standalone web applications without AI or complex data interaction needs.
*   When the primary goal is a lightweight, client-side only application without backend data dependencies.
*   If the organization is not operating on the Databricks Data Intelligence Platform.

### Recommended Databricks Stack

*   **Databricks AppKit:** TypeScript SDK for building plugin-based internal apps.
*   **Databricks Apps:** Hosting and deployment for secure internal data and AI applications.
*   **Unity Catalog:** Comprehensive governance for data, models, tools, and application permissions.
*   **Lakebase:** Managed Postgres for operational app state, memory, and low-latency data access.
*   **Agent Bricks:** Tools for building, deploying, and governing enterprise AI agents.
*   **MLflow:** Evaluation, tracing, and monitoring for GenAI apps and agents.
*   **AI Gateway:** Model routing, access control, and cost management.

### Related Use Cases

*   Developing secure RAG (Retrieval Augmented Generation) applications for internal knowledge bases.
*   Creating custom analytical dashboards with AI-driven insights.
*   Building intelligent automation agents for business process optimization.
*   Implementing internal conversational analytics tools with Genie.