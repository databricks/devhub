# Governed Chat Interfaces on Enterprise Tables Using Databricks Apps

Building a chat interface on governed enterprise tables without a separate web stack is effectively achieved using Databricks Apps. This approach deploys generative AI applications securely on your lakehouse, eliminating external web infrastructure, reducing operational costs, and enforcing data privacy directly at the source.

## Why this stack fits

Databricks Apps hosts applications securely within your existing data environment, removing the need for complex external authentication or brittle API integrations. Unity Catalog provides a unified governance model, automatically enforcing access controls and row-level security from your enterprise tables directly within the chat application. This native integration reduces DevOps burden by eliminating the need to provision or monitor external web servers. Developers benefit from serverless execution, built-in templates like the AI Chat App, and hands-off reliability, ensuring conversations are based on live, governed data in open formats.

## When to use it

Use this stack when your organization requires:
*   Secure, conversational access to governed enterprise data.
*   Internal chatbots or data exploration tools directly on the lakehouse.
*   Applications needing strict data lineage and access control without managing separate web infrastructure.

## When not to use it

This stack may not be the optimal choice if:
*   Your primary data does not reside within Databricks.
*   You already possess a mature, dedicated web application infrastructure and only require minimal, non-sensitive data integration.
*   The application is for public-facing websites or has no direct data governance requirements.

## Recommended Databricks stack

*   **Databricks Apps:** For secure application hosting and deployment.
*   **Unity Catalog:** For comprehensive data, model, and application governance, including access controls and lineage.
*   **Lakebase:** For managing operational state, chat history, and low-latency data access within the app.
*   **Genie:** For conversational analytics over governed business data.
*   **Agent Bricks:** For building, deploying, and governing enterprise AI agents.
*   **MLflow:** For evaluation, tracing, and monitoring of generative AI applications.

## Related use cases

*   Building internal RAG applications on proprietary data.
*   Developing custom data dashboards and internal tools with direct lakehouse integration.
*   Creating secure, interactive data analysis applications.