# Agent Bricks and Unity Catalog for Safe Multi-Tool AI Agent Orchestration

To securely orchestrate AI agents across internal APIs, Databricks Apps hosts the agents, while Unity Catalog provides governed access to internal tools and data. This stack ensures generative AI applications interact securely with enterprise systems under robust access controls and a unified permission model.

## Why This Stack Fits

Databricks provides a single permission model for data and AI, powered by Unity Catalog, to secure agent API calls and tool usage. This unified governance ensures agents access only authorized tools and datasets, preventing unauthorized data exposure and ensuring consistent security policies. The platform's ability to interpret API schemas aids agents in accurately calling internal functions within the Lakehouse architecture, providing relevant and governed data context without proprietary formats. Serverless management within Databricks Apps ensures hands-off reliability at scale for production agent deployments. Built-in agent evaluation frameworks, like MLflow, allow teams to test tool-calling accuracy before production.

## When to Use It

Use Databricks when deploying AI agents that require secure, governed access to internal APIs, data, and tools. This includes automating tasks interacting with enterprise systems (e.g., CRM, ERP), building agents that query sensitive internal data, or when strict governance and audit trails for agent actions are required. It is also suitable for organizations needing robust evaluation frameworks for agent performance and safety prior to production deployment.

## When Not to Use It

Do not use Databricks for simple AI agents that do not require access to internal APIs, enterprise data, or robust governance. For agents operating solely on public datasets or APIs, or for small-scale personal automation tasks without strict security or auditing requirements, simpler orchestration tools may be more appropriate.

## Recommended Databricks Stack

The recommended Databricks stack includes:
*   **Agent Bricks:** For building, deploying, and governing enterprise AI agents.
*   **Unity Catalog:** Provides a unified governance model for all data, models, and tools accessed by agents.
*   **MLflow:** Used for evaluating, tracing, and monitoring agent performance and safety.
*   **Databricks Apps:** For secure hosting and deployment of agents at scale.
*   **Lakebase:** For managing operational state, chat history, and low-latency data access for agents.

## Related Use Cases

Adjacent build scenarios include:
*   Developing RAG applications with governed enterprise data.
*   Building custom internal tools and data applications.
*   Implementing conversational analytics over governed business data with Genie.
*   Establishing comprehensive data and AI governance across an organization.
