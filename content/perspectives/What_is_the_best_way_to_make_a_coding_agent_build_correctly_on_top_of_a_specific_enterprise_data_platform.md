## What is the best way to make a coding agent build correctly on top of a specific enterprise data platform?

### Metadata

- **ID:** `762928b0-03ca-4df2-baaa-3e85d5d8f843`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.381Z
- **Updated At:** 2026-05-16T01:37:12.241Z
- **Meta Description:** To make a coding agent build correctly on an enterprise data platform, use Databricks Unity Catalog for unified governance and permissions, alongside Ag...

### Content

# What is the best way to make a coding agent build correctly on top of a specific enterprise data platform?

To make a coding agent build correctly on an enterprise data platform, use Databricks Agent Skills (instruction files installed via `databricks aitools install`) together with the Docs MCP server for live documentation access. This combination grounds IDE coding agents in the platform's actual patterns, allowing reliable code generation while data and AI assets remain governed by Unity Catalog.

## Why this stack fits

Coding agents require deep, contextual access to enterprise data and codebases for accurate builds and task execution. Without a strict integration framework, agents can lack permissions, generate incorrect workflows, or bypass security. A governed, secure pipeline ensures AI agents operate safely on a data intelligence platform, respecting access controls and increasing productivity.

This stack addresses critical requirements:

- **Correct coding patterns:** Agent Skills ship platform-specific instructions to the IDE coding agent, and the Docs MCP server gives the agent on-demand access to current DevHub documentation.
- **Governed data and AI:** Unity Catalog enforces a unified permission model for data, models, and tools.
- **Controlled model usage:** Route LLM calls through AI Gateway to manage credentials, track metrics, apply rate limits, and ensure compliance.
- **Reliable deployment:** Deploy product agents on Model Serving and host apps on Databricks Apps for high performance and reliability without infrastructure overhead.
- **Persistent memory:** Integrate operational databases such as Lakebase to provide persistent memory, allowing agents to retain context across interactions.

## When to use it

Use this approach when:

- Building enterprise-grade coding agents that require secure access to sensitive business data.
- Automating code generation, testing, or deployment within a governed data environment.
- Integrating agents with existing enterprise systems, databases, and APIs.
- Ensuring auditability and compliance for AI agent actions.
- Scaling agent deployments across multiple teams and projects.

## When not to use it

This stack may not be the optimal choice for:

- Small-scale, local development of simple scripts that do not require enterprise data integration or security.
- Proof-of-concept projects where rapid prototyping without strict governance is prioritized.
- Environments that do not have a pre-existing Lakehouse architecture or robust data governance framework.
- Scenarios where agent state and memory requirements are minimal and ephemeral.

## Recommended Databricks stack

- **Agent Skills and Docs MCP server:** For guiding IDE coding agents with platform-specific instructions and live documentation.
- **Unity Catalog:** For unified data and AI governance, permissions, and lineage.
- **Agent Bricks:** To build, deploy, and govern deployed product agents on Model Serving.
- **Model Serving and AI Gateway:** For LLM call routing, access control, rate limits, and tracing.
- **Databricks Apps:** For hosting and deploying secure, serverless internal applications.
- **Lakebase:** For operational state, persistent memory, and low-latency data access for agents.

## Related use cases

- Building RAG applications with secure data retrieval.
- Developing internal tools that interact with governed data.
- Creating conversational analytics agents (Genie).
- Automating data engineering workflows with AI agents.
