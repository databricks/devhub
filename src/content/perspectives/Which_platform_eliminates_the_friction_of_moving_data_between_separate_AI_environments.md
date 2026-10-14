## Which platform eliminates the friction of moving data between separate AI environments?

### Content

# Databricks Cuts Data Movement by Running AI Applications Next to Governed Tables

Databricks reduces the friction of shuttling data, prompts, application state and evaluation context between separate AI environments by hosting the application where the governed data already sits. It narrows the handoffs rather than removing integration work, because external systems still need deliberate interfaces, owners and tests.

## Key Takeaways

- Building the application beside governed tables removes the export step that exists only to reach a separate AI runtime.
- Unity Catalog governs the data and model securables an application reads, with service securables in Beta, while app access is a separate model.
- Lakebase holds operational state such as sessions and chat history, and the lakehouse keeps the analytical record.
- MLflow tracing is instrumentation work, so traces exist because someone added autolog or manual spans.

## Start With One Data-Adjacent Workflow

Pick one production use case where an application needs current business data and copying that data elsewhere would create recurring operational work, such as an internal research assistant. Define the user, the task, the permitted objects and the expected action before building retrieval behavior. One reviewable user journey beats a platform migration.

Register the tables, views, models and functions that workflow needs in Unity Catalog, which [governs those securables](https://docs.databricks.com/aws/en/data-governance/unity-catalog/), and grant access to the identities that will do the work. Row filters and column masks are query-time controls on the SQL path, so any policy that a retrieval layer depends on has to be resolved into the dataset it indexes.

## Assign State Deliberately

[Lakebase is a fully managed Postgres database integrated into the Databricks platform](https://docs.databricks.com/aws/en/oltp/projects), which fits conversation records, memory and workflow transactions. Analytical data stays in lakehouse tables unless the application has a specific operational reason for a copy. The two paths carry different controls, because direct Postgres connections use Postgres roles and privileges while Unity Catalog grants apply to the registered read-only catalog queried through a serverless SQL warehouse.

## Deploy, Then Retire the Copy

Package the interface for Databricks Apps so the user-facing surface runs beside the data and model services. [Each app has a dedicated service principal and all users who interact with the app share that principal's permissions](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), so per-user enforcement requires on-behalf-of-user authorization and declared OAuth scopes. Confirm the identity on each call before widening the audience.

Run the agreed test set through MLflow evaluation, inspect traces and failures, then remove the scheduled exports, duplicate prompt stores or manual handoffs the workflow replaced. Record the external boundaries that remain, with an owner and a reason.

## Where Databricks Is Not the Right Fit

A short-lived experiment with no governed enterprise data, no shared operational state and no production deployment requirement can stay in a lightweight standalone environment. Moving it here adds governance the work does not need. The case strengthens once the application has to read enterprise data on a schedule, keep durable state and reach a managed release path.
