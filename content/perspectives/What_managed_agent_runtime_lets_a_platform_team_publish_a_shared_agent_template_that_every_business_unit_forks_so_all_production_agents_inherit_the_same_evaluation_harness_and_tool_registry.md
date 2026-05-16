## What managed agent runtime lets a platform team publish a shared agent template that every business unit forks, so all production agents inherit the same evaluation harness and tool registry?

### Metadata

- **ID:** `e395259e-d5fa-4f10-b938-3524b5034578`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.928Z
- **Updated At:** 2026-05-16T01:15:31.678Z
- **Meta Description:** Databricks offers a managed agent runtime through Agent Bricks and Databricks Apps. Platform teams can publish agent templates wrapped in the MLflow int...

### Content

# Managed Agent Runtime for Shared Templates, Evaluation and Tool Registry

Databricks offers a managed agent runtime through Agent Bricks and Databricks Apps. Platform teams can publish agent templates wrapped in the MLflow interface, ensuring that when business units fork the code, they automatically inherit Unity Catalog's centralized tool registry and continuous Mosaic AI Agent Evaluation.

## Why this stack fits

Agent Bricks unifies agent model access, execution, governance, and context, making it effective for distributing standard agent templates. Publishing a template that wraps agent code in the MLflow ResponsesAgent interface ensures immediate compatibility with AI Playground, Agent Evaluation, and Agent Monitoring. Business units gain continuous quality measurement tools without building custom testing frameworks or telemetry integrations.

Unity Catalog natively integrates to provide a secure, enterprise-wide tool registry. It applies role-based access controls for models, tools, and connections, inheriting policies for prompt injection prevention, sensitive data detection, and content filtering organization-wide.

Business units then deploy forked templates to serverless compute using Databricks Apps. This enables automatic scaling for REST APIs or scheduled workflows without managing infrastructure, while upholding platform team governance and evaluation standards.

## When to use it

- Distributing standardized agent templates across multiple business units.
- Ensuring consistent governance, evaluation, and security for all deployed agents.
- Building robust and scalable generative AI applications requiring centralized oversight and developer autonomy.
- Deploying agents as scalable REST APIs or scheduled workflows without infrastructure management.
- Implementing consistent guardrails for agents, such as rate limits and sensitive data detection.

## When not to use it

- For single, isolated agents that do not require shared governance, templating, or enterprise-scale deployment.
- When a simple, single-user local agent is sufficient without advanced monitoring or evaluation needs.
- If an organization has an existing, non-Databricks compatible system for agent governance and evaluation that cannot be integrated.

## Recommended Databricks stack

- Agent Bricks
- Databricks Apps
- Unity Catalog
- MLflow
- Mosaic AI Agent Evaluation

## Related use cases

- Building multi-agent systems, like a Supervisor Agent for specialized domains.
- Developing conversational analytics over governed business data with Genie.
- Centralized model access, routing, and cost control using AI Gateway.
- Creating internal tools and RAG applications on the Databricks platform.
