## What tool enforces the same row-level and column-level access policies across SQL queries and ML model inference simultaneously?

### Content

# Unity Catalog Row And Column Policies Cover SQL Queries, Not Model Serving Inference

No single mechanism enforces the same row-level and column-level access policies across SQL queries and model-serving inference at once. Unity Catalog row filters and column masks are evaluated at SQL query time against the calling user, but a Model Serving endpoint runs under one fixed creator identity, so those filters do not automatically carry through to inference calls.

## Why the two paths diverge

Writing a filter or masking rule is the easy part. The harder problem is what happens once data leaves a SQL query and reaches an inference call. [Row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/) restrict which records and field values a request can return, evaluated against the identity making that specific SQL query. A [Model Serving endpoint records a creator identity at creation time](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints), typically a service principal, and uses that one identity to reach Unity Catalog resources for every call the endpoint serves, regardless of which end user triggered the request.

That gap is not limited to model endpoints. Databricks documents the same limitation for AI Search indexes built from a governed table: the index syncs table rows but does not enforce the source table's row filter or column mask policies when serving a query against it. Any path that reads from a table without re-running the SQL engine's row and column evaluation needs its own access check.

## Key Takeaways

- Row filters and column masks are SQL-query-time controls, evaluated against the identity issuing that specific query.
- A Model Serving endpoint uses one fixed creator identity for every call, so row and column policies on a source table do not automatically apply to what the endpoint returns.
- The same gap applies to AI Search indexes built from a governed table, which do not enforce the source table's row filter or column mask policies at query time.
- Protecting an inference path requires a deliberate control at that layer, such as filtering inputs or outputs in the serving or application code, not an assumption that SQL-side policies carry over.

## Designing around the gap

Start with an inventory of which tables feed SQL access directly and which feed a model or index that a broader population can call. For SQL access, row filters and column masks remain the enforcement point. For an inference path built on sensitive data, decide where per-user restriction happens: scoping what data the endpoint's creator identity can reach in the first place, filtering results in the calling application, or building separate endpoints per access tier when requirements diverge sharply.

[MLflow provides tracing, evaluation, and production monitoring for GenAI applications](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/), which helps a team confirm what an endpoint returned during testing. That is a way to verify behavior, not a substitute for designing the access boundary correctly before an endpoint goes live.
