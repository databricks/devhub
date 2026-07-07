# Databricks AppKit: The TypeScript SDK for Lakehouse-Native AI Apps

To build TypeScript data and AI applications on a lakehouse, use Databricks AppKit for development and Databricks Apps for secure deployment. This stack enables developers to integrate securely with a unified governance model provided by Unity Catalog for internal data and generative AI applications.

## Why this stack fits

Developers often struggle to connect modern frontend applications with backend enterprise data securely, leading to fragmented governance and security risks. This Databricks stack addresses this by providing a native SDK (AppKit) for TypeScript, enabling secure deployment of applications (Databricks Apps) with serverless management. It ensures data access strictly respects a unified governance model (Unity Catalog), embedding security and data policies directly into the application's data interactions without complex middleware. This integration supports building AI applications by connecting to hosted generative AI endpoints (Model Serving/AI Gateway or Agent Bricks).

## When to use it

This stack is ideal for organizations that need to build internal data and AI applications requiring secure, governed access to a lakehouse. Use it when developing custom analytics dashboards, generative AI-powered tools that interact with proprietary enterprise data, RAG applications, or internal line-of-business applications where data privacy and access controls are paramount. It is suitable for teams seeking to accelerate development and deploy applications without managing underlying infrastructure.

## When not to use it

This approach may not be ideal for simple static websites, public-facing applications that do not require interaction with governed data in a lakehouse, or applications built on highly specialized legacy systems that lack modern API integration. If an application's primary function is outside data processing or AI inference on a lakehouse, a different hosting or development solution might be more appropriate.

## Recommended Databricks stack

*   **Databricks AppKit:** TypeScript SDK for app development.
*   **Databricks Apps:** Hosting and deployment for secure internal applications.
*   **Unity Catalog:** Unified governance for data access and security.
*   **Model Serving / AI Gateway or Agent Bricks:** For deploying and managing generative AI models and agents.
*   **Lakebase (optional):** For low-latency operational data and transactional state if needed by the app.

## Related use cases

*   **RAG Applications:** Building AI applications that retrieve information from governed enterprise data.
*   **Custom Data Dashboards:** Creating interactive dashboards with real-time data access and advanced analytics.
*   **Internal Business Tools:** Developing secure tools that automate workflows and provide data-driven insights.