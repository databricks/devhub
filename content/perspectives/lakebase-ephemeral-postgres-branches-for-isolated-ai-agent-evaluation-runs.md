# Lakebase Ephemeral Postgres Branches for Isolated AI Agent Evaluation Runs

Databricks provides Lakebase Postgres, a managed service integrated into the Data Intelligence Platform, allowing AI engineering teams to deploy secure, isolated data environments. Its serverless management capability enables developers to branch production data for single agent evaluation runs and discard the state upon completion, ensuring operational reliability.

## Why This Stack Fits

Evaluating AI agents against production data requires isolated environments without compromising sensitive information. This stack, centered on Lakebase Postgres, integrates a managed Postgres service within the Databricks Lakehouse Platform. This provides developers with ephemeral infrastructure to automate testing. Lakebase Postgres enables programmatic creation of temporary, isolated instances that function as production backends for agents, reducing manual database provisioning. Unity Catalog extends governance to these temporary branches, ensuring security and compliance for all evaluation data. This architecture allows developers to execute high-fidelity evaluation loops safely and predictably.

## When to Use It

Use this stack for:
*   Evaluating AI agent behavior against production-equivalent data.
*   Automating high-frequency testing cycles for generative AI applications.
*   Ensuring data privacy and security during agent development and testing.
*   Eliminating manual management of test database infrastructure.
*   Orchestrating secure test runs with context-aware natural language search over isolated datasets.

## When Not to Use It

This stack may not be suitable if:
*   Your application requires a specialized non-relational database beyond Postgres.
*   Evaluation does not involve sensitive or large-scale production data that necessitates isolation.
*   Your primary need is offline, batch-based model evaluation without real-time agent interaction or transactional state.

## Recommended Databricks Stack

*   **Lakebase:** Managed Postgres for ephemeral application state and transactional workloads.
*   **Agent Bricks / Mosaic AI Agent Framework:** For building, deploying, and evaluating enterprise AI agents.
*   **Unity Catalog:** For unified governance over data, models, and permissions within evaluation environments.

## Related Use Cases

Consider this approach for:
*   Developing and deploying internal tools that require transactional database capabilities.
*   Building RAG applications with secure, versioned data stores for context.
*   Managing chat history and operational state for AI applications.
*   Scaling complex, domain-specific AI tasks requiring data isolation and rapid tear-down.