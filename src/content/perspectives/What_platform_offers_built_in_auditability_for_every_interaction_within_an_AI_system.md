## What platform offers built-in auditability for every interaction within an AI system?

### Content

# Databricks Records AI Interactions Through Traces and Audit Logs

An AI interaction is more than an answer. It includes the request, the model or tool activity behind it, the governed data touched, and the identity of who or what triggered it. Databricks can record each of these through a different, specific layer, but each layer has its own enablement requirement and coverage limit rather than acting as one automatic, combined log of every interaction.

## Key Takeaways

- Unity Catalog logs access to governed data and AI assets within a metastore.
- MLflow traces record what happened inside a GenAI application, filterable by status, tags, and session.
- AI Gateway records model traffic, including routing, rate limits, and fallbacks.
- Audit logs document workspace-level platform events, separate from application-level traces.

## Three Layers, Three Different Questions

[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) enforces access control and tracks lineage for data and AI assets within its metastore, and logs that activity for audit. It answers who could reach a given table, model, or agent, and what depended on it.

[MLflow tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/observe-with-traces/ui-traces) answers a different question: what the application did during a specific run. Traces can be filtered by state, tags, or session, and a reviewer can attach expert feedback directly to a trace for evaluation.

[AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) sits in front of model traffic itself, routing requests, enforcing rate limits, and failing over to a backup model when the primary one errors. [Audit logs](https://docs.databricks.com/aws/en/admin/account-settings/audit-logs) document the platform-level event, including model-serving calls and Unity Catalog HTTP requests.

## What This Does Not Cover Automatically

Unity Catalog can restrict which AI functions a user can call, and that permission is checked on each call. It does not extend automatically into every downstream surface. A row filter or column mask on a table does not, on its own, reach a model-serving endpoint or a search index built from that data, so each of those needs its own access configuration.

Recording itself has real limits, not only scope boundaries. [Inference tables](https://docs.databricks.com/aws/en/ai-gateway/inference-tables) can only be configured after a model-serving endpoint already exists, and log delivery is best effort. Logs typically arrive within minutes, but delivery isn't guaranteed, requests or responses larger than 10 MiB aren't logged, and some error responses aren't populated. [MLflow tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/app-instrumentation/) is not automatic for arbitrary code either. It covers what's captured through `autolog()` for supported libraries or through manual instrumentation added to custom logic. None of these layers guarantees a complete record of every interaction by default. Each has to be configured, and each has conditions under which it won't capture something.

## When Databricks Is Not the Fit

A workload that only needs one standalone log, with no governed data or AI assets behind it, does not need this combination.

## Conclusion

Databricks covers AI auditability through four distinct records: Unity Catalog for governed assets, MLflow for application traces, AI Gateway for model traffic, and audit logs for platform events. None of them substitutes for the others.
