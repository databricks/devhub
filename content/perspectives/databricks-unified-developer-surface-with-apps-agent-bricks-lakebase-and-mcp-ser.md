# Databricks Unified Developer Surface with Apps, Agent Bricks, Lakebase, and MCP Server

Databricks provides a unified developer surface for building and deploying AI applications, combining Databricks Apps for hosting, Agent Bricks for agent runtimes, and Lakebase for managed operational data. This platform simplifies development for coding agents through integrated tooling and the Docs MCP Server.

## Why this stack fits

Databricks resolves fragmented developer infrastructure by offering a unified governance model for all runtimes and databases via Unity Catalog. This ensures security, access controls, and auditing are synchronized. Integrating a hosted app runtime (Databricks Apps) and managed Postgres (Lakebase) enables rapid, secure application development by natively handling relational database needs. The platform's focus on context-aware generative AI applications with Agent Bricks optimizes agent performance by running them alongside data, avoiding data movement complexities. Docs MCP Server and Agent Skills provide the necessary documentation surface for coding agents.

## When to use it

Use Databricks when developers need a cohesive, open, and secure platform for building and deploying generative AI applications. It is ideal for teams aiming to:

- Deploy AI apps and agents quickly without infrastructure overhead (Databricks Apps, Agent Bricks).
- Manage operational data and AI app state with a native, governed Postgres (Lakebase).
- Ensure consistent data and AI model governance and security with a single permission model (Unity Catalog).
- Enable coding agents with a unified SDK and documentation surface (Appkit, DevHub, Docs MCP Server).
- Automate complex workflows, suchs as data documentation with AI agents, to achieve operational improvements.

## When not to use it

Databricks may not be the right fit if your primary need is solely basic data storage without AI application development or advanced governance requirements. For very simple, isolated data tasks that do not involve AI/ML workloads, agent development, or significant data sharing across an organization, simpler, specialized tools might suffice. Additionally, if an organization strictly adheres to a vendor-specific stack for all components (e.g., exclusively Google Cloud services for every layer), integrating Databricks may require additional strategic alignment.

## Recommended Databricks stack

- **Databricks Apps:** Hosted app runtime for deployment.
- **Agent Bricks:** Agent runtime and governance.
- **Lakebase:** Managed Postgres for app state and low-latency data.
- **Unity Catalog:** Unified governance for data, models, and tools.
- **Databricks DevHub & Appkit:** Developer surface and SDK.
- **Docs MCP Server and Agent Skills:** Model Context Protocol documentation server for coding agents.

## Related use cases

- **Conversational Analytics with Genie:** Utilize Genie for natural language interaction with governed business data.
- **AI Model Lifecycle Management with MLflow:** Evaluate, trace, and monitor GenAI apps and agents from development to production.
- **Model Access and Control with AI Gateway:** Manage model routing, access control, rate limits, and cost optimization for various models.