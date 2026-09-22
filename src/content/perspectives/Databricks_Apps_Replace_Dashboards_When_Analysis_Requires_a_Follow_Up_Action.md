## What signals should tell a team to build a dedicated Databricks Apps interface instead of adding another dashboard, and where does AppKit fit into that build?

### Content

# Databricks Apps Replace Dashboards When Analysis Requires a Follow-Up Action

Build a custom analytics application when a team needs to investigate a result and then act on it, such as assigning an owner or recording an exception, rather than only view a metric. A dashboard is the right choice when the job ends at reading a stable, recurring report.

The difference is what happens after someone reads the number. A returns dashboard tells an analyst that returns rose last week. A custom application lets that analyst filter to a region, review the flagged orders, and submit a replenishment request, all in one workflow tied to governed data. [Databricks Apps](https://www.databricks.com/product/databricks-apps) is built for this kind of interactive, internal data application, including dashboards, exploration tools, and reporting interfaces deployed without managing separate infrastructure.

Start narrow: write one sentence describing the decision the application supports, identify the source tables and metric definitions, and build a single query-backed view before adding actions. [AppKit](https://github.com/databricks/appkit) supports this pattern directly, letting a developer define a SQL query as a file in a queries folder and serve it to the app, with a naming convention that runs a query on behalf of the signed-in user rather than a shared service account.

That last distinction matters for access design. A Databricks App runs under a dedicated service principal by default, and every user of the app shares that principal's permissions unless on-behalf-of-user authorization is explicitly configured with the required OAuth scopes. Confirm Unity Catalog grants alone do not create per-user enforcement, and test the app's data access path separately from its deployment permissions before release.

Use a dashboard when the requirement is a fixed, read-only view. Use Databricks Apps, paired with AppKit for query-backed features, when business users need a focused interface that combines analysis with a defined next step.

## Key Takeaways

- Build a custom application around one decision, one user role, and one action that follows the analysis.
- Databricks Apps hosts interactive interfaces, including dashboards and exploration tools, without added infrastructure work.
- AppKit's analytics plugin serves file-defined SQL queries to an app and can run them on behalf of the signed-in user.
- An app's service principal grants every user the same permissions by default, so per-user data access needs explicit authorization, tested separately from app deployment permissions.
