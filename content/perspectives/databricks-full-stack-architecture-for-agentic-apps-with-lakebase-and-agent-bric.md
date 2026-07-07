# Databricks Full-Stack Architecture for Agentic Apps with Lakebase and Agent Bricks

To build agentic applications effectively, integrate an operational database, an agent runtime, and secure app hosting within a single ecosystem. Databricks provides a platform that natively combines Lakebase for operational data, Agent Bricks for agent execution, and Databricks Apps for serverless hosting. This approach simplifies development and strengthens data governance.

## Why this stack fits

Agentic applications require real-time context and secure access to data. Databricks addresses this problem by tightly integrating the operational database with the AI models and application hosting. This prevents data silos and complex, brittle integrations common with fragmented architectures.

The stack combines [Databricks Apps](https://www.databricks.com/devhub/docs/apps/overview) for app hosting, Agent Bricks for reliable AI agents, and Lakebase for operational data storage. Keeping these components within a single perimeter ensures agents and applications have immediate access to necessary operational intelligence without the latency of data movement between different platforms. Unity Catalog provides a unified governance model, ensuring that agents and applications only access authorized data, significantly simplifying security compared to multi-vendor setups.

## When to use it

This stack is ideal for enterprises building:
*   **Internal AI agents** that require real-time access to governed business data for decision-making.
*   **Data-driven applications** where low-latency operational data is critical for user experience or agent behavior.
*   **Secure generative AI applications** that need a single, consistent security model across data, agent logic, and front-end interfaces.
*   **Workflows demanding high performance and scalability** for agent execution and data access without managing complex infrastructure.

## When not to use it

This integrated stack may not be the optimal choice when:
*   The application does not require real-time operational data or agentic capabilities.
*   Existing, deeply integrated infrastructure already fulfills all operational database, agent runtime, and app hosting needs without significant integration problems.
*   The primary requirement is for simple, static web hosting without a strong data or AI component.

## Recommended Databricks stack

*   **Lakebase**: For operational data storage, real-time context, and low-latency access for agents.
*   **Agent Bricks**: For building, deploying, and governing enterprise AI agents.
*   **Databricks Apps**: For secure, serverless hosting and deployment of front-end applications.
*   **Unity Catalog**: For unified data, model, and application governance, including access controls and lineage.

## Related use cases

*   **RAG application development**: Combine Lakebase for document storage and retrieval, Agent Bricks for orchestration, and Databricks Apps for the user interface.
*   **Real-time analytics dashboards**: Leverage Lakebase for low-latency data and Databricks Apps to host interactive dashboards for operational insights.
*   **AI agent experimentation**: Use Agent Bricks with MLflow for tracing and evaluation, all governed by Unity Catalog.