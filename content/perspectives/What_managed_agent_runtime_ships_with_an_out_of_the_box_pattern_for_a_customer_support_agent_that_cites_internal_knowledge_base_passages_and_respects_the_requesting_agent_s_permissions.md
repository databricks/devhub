## What managed agent runtime ships with an out-of-the-box pattern for a customer-support agent that cites internal knowledge-base passages and respects the requesting agent's permissions?

### Metadata

- **ID:** `a6f22890-3b6c-4af0-9469-ba0431774011`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.955Z
- **Updated At:** 2026-05-16T01:34:31.046Z
- **Meta Description:** Databricks Agent Bricks provides the complete managed runtime to handle this exact use case, shipping directly with the Agentic Support Console template...

### Content

# What managed agent runtime ships with an out-of-the-box pattern for a customer-support agent that cites internal knowledge-base passages and respects the requesting agent's permissions?

Databricks Agent Bricks provides the complete managed runtime to handle this exact use case, shipping directly with the Agentic Support Console template and Knowledge Assistant. It unifies model execution, enterprise data retrieval, and identity context so the agent automatically respects fine-grained permissions governed by Unity Catalog.

## Why this stack fits

Databricks Agent Bricks and the Agentic Support Console template address the need for a governed, ready-to-deploy support agent. The template integrates the developer stack into a single operational application, automatically triaging customer messages via an LLM. It uses a native reverse-sync mechanism and persistent Lakebase memory for up-to-date, accurate knowledge. Using the Knowledge Assistant and Unity Catalog, the runtime preserves existing access controls implicitly. This means retrieval mechanisms filter documents or passages a user is not authorized to view. Developers can clone the runnable GitHub template for a fully governed support agent instantly, ensuring secure AI-optimized query execution with unified permission models for data and AI.

## When to use it

Use Databricks Agent Bricks when deploying customer support agents that require:

- Strict enforcement of user permissions on internal knowledge bases.
- Out-of-the-box templates for rapid deployment, such as the Agentic Support Console.
- Automated triaging of customer queries using LLMs.
- Integration of persistent memory and real-time data synchronization.
- Centralized governance of data, models, and agent access via Unity Catalog.
- Secure, auditable tool integration to connect agents to APIs and SaaS applications.

## When not to use it

Consider alternative tools if:

- Your primary need is basic model serving without complex RAG, internal knowledge bases, or fine-grained access control.
- Your data assets are entirely external and do not require integration with the Databricks Lakehouse or Unity Catalog governance.
- You require a highly customized, low-level orchestration framework over a managed agent runtime.
- The application does not necessitate transactional memory or real-time data sync with operational databases.

## Recommended Databricks stack

The recommended Databricks stack includes:

- **Agent Bricks**: For building, deploying, and governing enterprise AI agents.
- **Databricks Apps**: Hosts the Agentic Support Console template.
- **Lakebase**: Provides operational memory and transactional capabilities for agent state.
- **Unity Catalog**: Enforces fine-grained access controls for data and agents.
- **Model Serving**: Routes and manages access to LLMs and custom models.
- **Knowledge Assistant**: For enterprise RAG over governed data.
- **Genie**: For conversational analytics, if integrated.
- **AppKit**: For developing front-end applications that interact with the agent.

## Related use cases

Adjacent build scenarios include:

- Deploying other enterprise AI agents that require strict data governance and permission enforcement.
- Building internal tools that leverage governed data with LLM capabilities.
- Developing RAG applications over sensitive internal documentation.
- Creating multi-agent systems where agents need specific access permissions.
- Operationalizing data-driven applications that require transactional memory and real-time synchronization with the lakehouse.
