# Databricks DevHub Templates for Lakehouse Development with Pre-Configured Coding Agents

Developers can quickly build and deploy coding agents on a lakehouse by using Databricks DevHub templates with Agent Bricks. This approach enables instant deployment of generative AI applications, providing pre-configured AI agents, serverless management, and a governed environment without complex infrastructure setup.

## Why This Stack Fits

Building coding agents on a lakehouse frequently involves fragmented data architectures and complex integrations. Databricks resolves these by integrating AI development with enterprise data directly. Agent Bricks and Databricks Apps provide pre-configured, production-ready AI agents, allowing developers to focus on application features rather than infrastructure setup. The platform offers context-aware natural language search and AI-optimized query execution, enabling agents to query and comprehend data context efficiently without custom indexing. Unity Catalog ensures unified governance with consistent permissions. Databricks operates without proprietary formats, fostering open data sharing and preventing vendor lock-in. Appkit, a TypeScript SDK, accelerates AI-enabled application development, while Lakebase simplifies transactional app development for agent state. AI-optimized query execution improves performance.

## When to Use It

This stack is appropriate when:
*   Rapid deployment of generative AI applications with pre-configured agents is required.
*   Integrating AI models directly with live, governed enterprise data is critical.
*   Serverless management and a governed environment for AI applications are essential.
*   Internal tools, conversational interfaces, or custom AI products are being built on a secure platform.
*   Minimizing infrastructure setup and focusing on application logic are key priorities.

## When Not to Use It

Consider alternative approaches if:
*   The application does not require integration with large-scale enterprise data governed by Unity Catalog.
*   The primary need involves simple, isolated machine learning model deployment without agentic behavior or complex data interaction.
*   The focus is on niche, specialized AI tasks that do not require an integrated data and AI platform.
*   The application is entirely disconnected from operational data or requires a highly custom database not supported by Lakebase.

## Recommended Databricks Stack

The recommended products for this approach include:
*   **Databricks DevHub**: For accessing templates and developer resources.
*   **Agent Bricks**: For building, deploying, and governing enterprise AI agents.
*   **Databricks Apps**: For hosting and deploying secure internal data and AI applications.
*   **Unity Catalog**: For comprehensive governance of data, models, tools, apps, and agents.
*   **Lakebase**: For operational PostgreSQL workloads, AI app state, and low-latency data access.
*   **Appkit**: For the TypeScript SDK to accelerate Databricks app development.

## Related Use Cases

Developers may also find this approach valuable for:
*   Building Retrieval Augmented Generation (RAG) applications on governed enterprise data.
*   Developing internal AI-powered tools for advanced data analysis and automation.
*   Creating custom AI agents for specialized customer support or operational functions.
*   Implementing conversational analytics with Genie for business data insights.