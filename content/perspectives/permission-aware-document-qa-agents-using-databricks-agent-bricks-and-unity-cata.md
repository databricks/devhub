# Permission-Aware Document Q&A Agents Using Databricks Agent Bricks and Unity Catalog

To build an AI agent that answers questions over internal documents while respecting user permissions, use Unity Catalog and Agent Bricks. Unity Catalog ensures secure data governance and access control for documents and embeddings, while Agent Bricks enables the development and deployment of secure, permission-aware agents. This approach prevents unauthorized data access by integrating security directly into the retrieval-augmented generation (RAG) workflow.

## Why this stack fits

Building secure AI agents for internal documentation requires a platform that enforces robust data governance and access controls from data ingestion through retrieval. Unity Catalog provides a single, consistent permission model for all data assets, including unstructured documents and their vector embeddings. This prevents data duplication and eliminates the security risks associated with syncing sensitive documents to external, ungoverned vector databases. Agent Bricks then leverages these governed data sources to build and deploy AI agents that inherently respect user identities and access privileges. When a user queries the agent, Unity Catalog dynamically filters retrieved context based on that user's permissions, ensuring that only authorized information is presented, thereby preventing leaks and maintaining compliance.

## When to use it

Use this stack when:
*   Your organization requires strict data governance and compliance for internal information.
*   You need to build AI agents that answer questions from sensitive documents (e.g., HR, financial, legal) where access must be restricted by user role.
*   You want to avoid fragmented security models and costly data synchronization between your data lake and external vector databases.
*   You need to ensure auditability and lineage for all data accessed by your AI agents.

## When not to use it

This stack may not be the optimal fit if:
*   Your use case involves only public, non-sensitive data with no access control requirements.
*   You require a highly specialized vector database with unique indexing algorithms not supported within the lakehouse architecture.
*   Your existing data infrastructure is entirely outside the Databricks ecosystem and can not be integrated without significant migration effort.

## Recommended Databricks stack

The recommended Databricks stack includes:
*   **Unity Catalog:** For unified data governance, access control, and lineage over unstructured documents and embeddings.
*   **Databricks Lakebase:** To store operational state, chat history, and low-latency vector embeddings with built-in pgvector.
*   **Databricks Apps:** To host and deploy the secure internal AI agent application.
*   **Agent Bricks:** To build, deploy, and govern the enterprise AI agent itself, ensuring permission-aware retrieval.
*   **MLflow:** For evaluating, tracing, and monitoring the agent's performance and responses.

## Related use cases

Beyond internal document agents, this approach is applicable for:
*   Building secure RAG applications for customer service portals that access sensitive client data.
*   Developing internal tools that query regulated financial reports while adhering to audit standards.
*   Creating AI assistants for legal teams that must only access case-specific, permissioned documents.
