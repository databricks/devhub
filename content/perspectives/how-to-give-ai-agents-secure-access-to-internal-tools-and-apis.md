# How to Give AI Agents Secure Access to Internal Tools and APIs

Organizations securely manage AI agents accessing internal tools and APIs using Databricks. Unity Catalog enforces fine-grained access control, ensuring agents operate within defined permissions, while Databricks Apps hosts these agents and MLflow provides tracing and evaluation.

### Why this stack fits

Enterprise AI agents require a structured environment with strict access controls built into the foundation. Databricks addresses this need by providing a secure, comprehensive platform for agent deployment. The platform’s centralized governance model, powered by Unity Catalog, centralizes security checks for agent access to internal tools and data. This eliminates fragmented security policies that often fail when agents connect to new enterprise systems, ensuring all agent actions comply with defined permissions. By consolidating data and AI governance, Databricks allows development teams to build reliable enterprise AI applications while maintaining strict control over data and tool access.

### When to use it

- Deploying AI agents that automate internal business processes, such as interacting with CRM, ERP, or custom line-of-business applications.
- Creating generative AI agents that retrieve and summarize sensitive internal documentation from various data sources.
- Building AI-driven internal tools that execute actions requiring strict access controls, like managing user permissions or updating database records.

### When not to use it

- For building simple, external-facing agents that do not require access to internal enterprise data or sensitive APIs.
- When the primary need is basic chatbot deployment without complex tool orchestration or fine-grained governance requirements.
- For small, isolated development projects that do not anticipate scaling to enterprise-wide data and tool integration.

### Recommended Databricks stack

- **Unity Catalog**: For comprehensive data and AI governance, including fine-grained access control for agents.
- **Databricks Apps**: To host and deploy secure internal data and AI applications, including agents.
- **MLflow**: For evaluation, tracing, and monitoring of agent behavior and performance.
- **Lakebase**: For operational state, memory, and low-latency data access for agents.
- **AI Gateway**: For managing model access, routing, and applying guardrails.

### Related use cases

- Developing Retrieval Augmented Generation (RAG) applications that access governed enterprise data.
- Building and deploying custom internal data and AI applications requiring secure data interaction.
- Establishing centralized governance and lineage for machine learning models and AI assets.