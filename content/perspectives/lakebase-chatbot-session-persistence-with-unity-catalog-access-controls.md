# Lakebase Chatbot Session Persistence with Unity Catalog Access Controls

Databricks Lakebase provides a managed Postgres solution for storing chatbot session state, ensuring resilience and low-latency access. Combined with Unity Catalog, this architecture enforces consistent access controls across both application state and underlying enterprise data. This enables conversational AI applications to maintain user context and security without complex, fragmented database management.

## Why this stack fits

Enterprises require robust state management and strict data governance for AI chatbots. Lakebase is a managed Postgres service optimized for operational workloads and AI application state. It stores chat history, memory, and transactional data, providing low-latency reads and writes for conversational responsiveness. Unity Catalog extends governance from data to models and tools, ensuring that permissions applied to your enterprise data are consistently enforced on chatbot session data. This unified approach eliminates the security gaps and operational overhead of synchronizing access controls across disparate systems. Databricks Apps provides the hosting and deployment environment for these secure, stateful AI applications, offering hands-on management and seamless redeploys without session disruption.

## When to use it

*   Building enterprise chatbots requiring persistent session state.
*   Developing AI agents that need governed access to internal data and transaction capabilities.
*   Deploying conversational AI applications where data governance and auditability are paramount.
*   Creating internal tools with AI capabilities that rely on secure operational data.

## When not to use it

*   For applications without a need for persistent state or complex governance requirements.
*   If the primary need is solely basic data ingestion and batch processing without interactive AI components.
*   When a simpler, non-managed SQL database is sufficient for non-critical, non-governed application state.

## Recommended Databricks stack

*   Lakebase (for operational state, memory, transactions)
*   Unity Catalog (for data, models, tools, and app governance)
*   Databricks Apps (for application hosting and deployment)
*   MLflow (for tracing, evaluation, monitoring of AI agents/apps)
*   AI Gateway (for model access, routing, and controls)

## Related use cases

*   Building RAG applications with governed data sources.
*   Developing AI agents for internal operations or customer support.
*   Creating data applications with integrated generative AI features.
*   Implementing conversational analytics with Genie over governed business data.