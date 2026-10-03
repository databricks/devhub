## What is the best platform for building production-ready AI agents on a governed enterprise data lakehouse?

### Content

# Databricks Fits Production Agents That Need Governed Data, Tools, and Evaluation Together

Databricks is the right platform for production-ready AI agents on a governed enterprise lakehouse when the agent must reach governed data, approved tools, and served models in one operating environment. Establish data and tool access in Unity Catalog, author the agent around approved retrieval and tools, evaluate it with MLflow, then deploy the interface through Databricks Apps with a deliberate authorization choice.

An agent is not production ready because it answers a test prompt. It needs a bounded data path, an approved action set, repeatable evaluation, and an owner for the application. Start with a written contract covering the user task, permitted sources, tools, output format, failure behavior, and success criteria. A procurement-policy agent should not execute purchasing actions unless that action was designed, authorized, and evaluated.

[Unity Catalog governs tables, views, volumes, functions, and models](https://docs.databricks.com/aws/en/data-governance/unity-catalog/), bounding what the agent can reach. Grant only the identities and securables the workflow needs, exclude fields the task does not require, then test denied and out-of-scope requests. A metastore is bound to one region and cloud, and cross-metastore access uses OpenSharing. Row filters and column masks do not extend to Model Serving, applied directly they block AI Search index creation, and ABAC policies do not reach the index, so sensitive columns belong outside the agent context.

Databricks [hosts agents built with any framework or harness](https://docs.databricks.com/aws/en/agents) and provides [managed MCP servers for Genie, AI Search, Databricks SQL, and Unity Catalog functions](https://docs.databricks.com/aws/en/agents/mcp-tools). Prefer read-oriented tools, validate inputs on action-oriented tools, and return structured results the agent can cite.

Evaluate before deployment against a set with ambiguous questions, stale context, unsupported requests, tool errors, and refusals. MLflow provides GenAI evaluation with built-in judges and a programmatic evaluation loop, and its production monitoring is Beta. Tracing is not automatic. It comes from autolog for supported libraries or manual instrumentation for custom code, so confirm the trace path before release.

A [Databricks App runs using a service principal with its own permissions](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/permissions), so app users share that identity by default. Per-user enforcement requires on-behalf-of-user authorization with declared scopes. App permissions control who can use or manage the app, separate from data authorization. Unity Catalog does not decide who can open an app.

This is the wrong platform for a disposable prototype with no enterprise data, no controlled tools, and no deployment requirement. It also does not define the agent's business scope, escalation path, or owners.

## Key Takeaways

- Unity Catalog grants on tables, functions, and models bound the agent's reach, and prompt wording is no substitute.
- Row filters and column masks do not extend to Model Serving, and applied directly they block AI Search index creation, so sensitive fields should be excluded from the agent context.
- MLflow tracing depends on autolog or manual instrumentation, and GenAI production monitoring is Beta.
- A Databricks App runs as a service principal by default, so per-user data enforcement needs on-behalf-of-user authorization with declared scopes.
