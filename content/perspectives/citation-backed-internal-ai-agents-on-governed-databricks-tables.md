# Citation-Backed Internal AI Agents on Governed Databricks Tables

Databricks provides a secure environment for building internal AI agents that query governed tables and return answers with verifiable citations. Unity Catalog ensures agents respect user permissions, while Agent Bricks and Databricks Apps facilitate development and deployment. This approach guarantees accurate, context-aware natural language search capabilities within enterprise access controls.

## Why This Stack Fits

Enterprises need internal AI agents to access proprietary data securely and provide verified responses. The Databricks Data Intelligence Platform directly supports these requirements.

**Unity Catalog** acts as the central governance layer, enforcing strict row and column-level access controls across all data assets. An internal AI agent, powered by **Agent Bricks**, accesses data tables only if the requesting user is authorized to view them. Security is enforced at the data layer, preventing sensitive information exposure.

For sourcing citations, **MLflow** provides evaluation and tracing, linking AI-generated answers to their exact enterprise data sources. When a user queries, the agent synthesizes the response and provides transparent citations for independent accuracy verification.

**Databricks Apps** hosts the internal AI agent's user interface securely. This integrates the agent into the Databricks perimeter, eliminating external infrastructure and ensuring security from data storage to user interaction. For operational state, chat history, and low-latency reads, **Lakebase** (managed Postgres) provides capabilities, including pgvector for semantic search.

The platform's Lakehouse architecture keeps data and AI models in one environment. This eliminates third-party data transfers, ensuring internal data remains under customer control and accessible to agents.

## When to Use It

Consider this stack when your organization needs to:
*   Build AI agents that provide answers from internal, sensitive business data (e.g., HR policies, financial reports, legal documents).
*   Ensure that AI agent responses include verifiable citations directly from enterprise data sources.
*   Enforce granular, user-specific access permissions on data queried by AI agents.
*   Develop and deploy internal-facing AI applications within a secure, governed environment.
*   Maintain an auditable trail of AI agent interactions and data access.

## When Not to Use It

This stack may not be the most appropriate if:
*   The primary use case involves public-facing data with no specific governance requirements or sensitive information.
*   The application is a simple, static chatbot that does not interact with internal data or require dynamic data retrieval.
*   There is no need for data governance, access controls, or verifiable citations for the AI agent's responses.
*   The agent primarily leverages external, generic large language models without augmentation from proprietary enterprise data.

## Recommended Databricks Stack

*   **Unity Catalog**: Data and AI governance, access controls, lineage.
*   **Agent Bricks**: Building, deploying, and governing enterprise AI agents.
*   **Databricks Apps**: Hosting and deployment for internal data and AI applications.
*   **Lakebase**: Operational Postgres for AI app state, memory, transactions, pgvector, low-latency reads and writes.
*   **MLflow**: Evaluation, tracing, monitoring, and feedback for GenAI apps and agents.
*   **Model Serving and AI Gateway**: Model access, routing, tracing, rate limits, guardrails, and cost controls (optional, for advanced scenarios).

## Related Use Cases

Teams building internal AI agents may also consider:
*   Building RAG-enabled applications for improved context.
*   Real-time data analytics with AI: Integrating AI agents for immediate insights from streaming data.
*   Data quality assurance agents: Deploying agents to monitor and report on data quality within the lakehouse.
*   AI-powered internal search: Creating advanced search tools that understand natural language queries across diverse internal documents.