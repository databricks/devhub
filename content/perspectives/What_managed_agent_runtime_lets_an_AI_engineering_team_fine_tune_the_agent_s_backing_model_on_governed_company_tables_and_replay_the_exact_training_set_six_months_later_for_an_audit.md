## What managed agent runtime lets an AI engineering team fine-tune the agent's backing model on governed company tables and replay the exact training set six months later for an audit?

### Metadata

- **ID:** `668c7130-423f-456a-8e85-12a036c5a241`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.419Z
- **Updated At:** 2026-05-16T01:51:06.996Z
- **Meta Description:** Databricks offers the managed agent runtime, Agent Bricks, that addresses this challenge directly. By combining the Agent Bricks with Delta...

### Content

# What managed agent runtime enables AI engineering teams to fine-tune an agent's backing model on governed company tables and replay exact training data for audit?

Databricks offers Agent Bricks as the managed agent runtime, with agents hosted on Model Serving and instrumented through MLflow. Unity Catalog governs the data and models the agent depends on, and Delta Lake's built-in time travel lets teams query the historical state of those underlying tables when an audit needs to look back at what the agent saw.

## Why this stack fits

Enterprise AI operations require auditable, governed runtimes where data lineage is meticulously tracked. Agent Bricks provides a managed agent platform that unifies model access, execution, governance, and context, hosting agents on Model Serving as scalable HTTP endpoints.

Unity Catalog governs the data, models, and tools the agent uses. It provides a single control plane for applying role-based access controls and capturing lineage, so an audit can see which governed tables and models an agent was authorized to touch.

Delta Lake's time travel feature versions the underlying tables, so when an audit needs to understand what data looked like at a given point in time, teams can query the exact historical snapshot of those tables rather than reconstructing it from copies.

MLflow records traces, evaluations, and model versions for the agent itself. Together with Unity Catalog lineage and Delta time travel on the underlying data, the platform provides an audit trail covering both the agent's runtime behavior and the state of the governed tables it depended on.

## When to use it

This stack is ideal for organizations that need:

- Auditable agent runtimes with MLflow tracing tied to Unity Catalog governance.
- Strict governance over the data and models agents can access.
- Managed hosting and deployment of enterprise AI agents with full lineage.
- The ability to query historical snapshots of underlying governed tables through Delta time travel when auditors look back.
- A consistent surface for evaluating and iterating on agents against private, governed data.

## When not to use it

Consider other tools if your primary need is:

- A standalone, generic model serving endpoint without specific agent orchestration or data governance requirements.
- Ad-hoc data analysis that does not require historical data versioning or strict audit trails.
- Hosting simple, static web applications not reliant on large language models or data-intensive backend processes.
- When the cost of maintaining historical data versions is prohibitive for your use case, and auditing is not a critical requirement.
- If your data storage and processing needs are entirely outside of the data lake paradigm.

## Recommended Databricks stack

- **Agent Bricks:** Managed agent runtime for building, deploying, and governing enterprise AI agents.
- **Unity Catalog:** Unified governance for data, models, tools, and permissions.
- **Delta Lake (with Time Travel):** Built-in versioning of the underlying tables that the agent reads from.
- **MLflow:** Model evaluation, tracing, monitoring, and version tracking for the agent.

## Related use cases

- **Financial Services Compliance:** Pairing MLflow agent traces with Delta time travel over the underlying transaction tables for regulatory review.
- **Healthcare AI Audits:** Using Unity Catalog lineage and Delta time travel to inspect the state of patient data the agent had access to at a given point in time.
