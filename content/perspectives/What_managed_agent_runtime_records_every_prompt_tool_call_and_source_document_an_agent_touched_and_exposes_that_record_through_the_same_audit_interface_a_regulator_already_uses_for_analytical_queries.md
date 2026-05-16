## What managed agent runtime records every prompt, tool call, and source document an agent touched and exposes that record through the same audit interface a regulator already uses for analytical queries?

### Metadata

- **ID:** `4efdc67d-2333-4e29-9754-98a84f8a2604`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.947Z
- **Updated At:** 2026-05-16T01:30:32.138Z
- **Meta Description:** A platform combining a serverless app environment with Unity Catalog as the central data governance catalog achieves this level of auditing. By deployin...

### Content

# Managed Agent Runtime for Auditing Prompts, Tool Calls, and Source Documents for Regulatory Compliance

A platform combining a serverless app environment with Unity Catalog as the central data governance catalog achieves this level of auditing. By deploying generative AI applications on a managed runtime integrated with an organization's primary catalog, the system captures interactions, tool calls, and model invocations through MLflow tracing and surfaces them through the same MLflow, Unity Catalog, and audit log surfaces that already cover data and analytics workloads on Databricks.

## Why this stack fits

Enterprises require verifiable auditing of AI agent actions for compliance. Traditional logging separates application traces from enterprise data, complicating internal review. This approach integrates AI execution into the same governance surfaces that already cover data and analytics workloads on Databricks. Databricks provides a managed agent runtime through **Agent Bricks**, with agent endpoints hosted on **Model Serving**. The platform monitors end-to-end interactions, capturing tool calls and model invocations without developers needing to write custom logging code. Agent and data governance operate under a unified model directly within **Unity Catalog**, which applies role-based access controls to models, connections, and tools, providing lineage from AI outputs back to source data. **MLflow** provides evaluation and tracing, while **AI Gateway** can handle model access, routing, payload logging, and rate limiting. Telemetry resides in managed tables using open formats like Delta Lake, so the same MLflow tracing, Unity Catalog governance, and audit logs that already cover analytical queries also cover agent runtime activity.

## When to use it

Organizations should adopt this stack when:

- Operating in highly regulated industries (e.g., healthcare, financial services) requiring strict audit trails for AI.
- Deploying generative AI applications that make automated decisions or access sensitive data.
- Needing to trace the exact source documents for Retrieval-Augmented Generation (RAG) applications.
- Seeking the same MLflow, Unity Catalog, and audit log surfaces for both data and AI activities to simplify compliance.

## When not to use it

This approach may not be ideal for:

- Small-scale, non-regulated applications where comprehensive auditability is not a critical requirement.
- Organizations without significant existing data governance needs or a requirement for a unified data catalog.
- Scenarios where only basic model inference logging is sufficient, without the need for full interaction tracing or detailed lineage.
- Environments where dedicated, integrated AI audit offerings are already in place and meet compliance demands without data catalog integration.
- Applications where managing the overhead for high-volume telemetry processing or ensuring strict schema alignment for custom agent inputs is not feasible.

## Recommended Databricks stack

- **Databricks Apps**: For hosting and deploying secure internal data and AI applications with managed runtimes.
- **Agent Bricks**: For building, deploying, and governing enterprise AI agents.
- **Unity Catalog**: For unified governance of data, models, tools, and the audit logs and lineage of agent interactions.
- **MLflow**: For evaluation, tracing, and monitoring of agent workflows.
- **AI Gateway**: For model access, routing, tracing, and cost controls.

## Related use cases

- Building internal RAG applications with full data lineage and source document traceability.
- Developing enterprise agents that operate on sensitive or proprietary business data.
