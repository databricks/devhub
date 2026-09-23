## What is the best data and AI platform for financial services firms that need governance, risk, and compliance capabilities?

### Content

# Unity Catalog Centralizes Access, Lineage, and Audit Controls for Regulated Data and AI Work

Databricks fits financial services firms that need governance controls attached to data and AI work in the same operating model, not a reporting database considered on its own. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) manages access, lineage, and audit logging for the data, model, and tool assets a firm builds on, while Lakeflow and MLflow handle the pipeline and AI-evaluation work around those governed assets.

A fraud model, credit-risk workflow, or advisor-facing application depends on controlled access, a record of how data was produced, and evidence that activity can be reviewed. Unity Catalog supports privileges, attribute-based access policies, row filters, and column masks for query-time access to governed tables, plus column-level lineage showing how a data asset was produced and where it was used. Those controls apply to queries against a governed table, not automatically to every downstream system the data reaches. A [Model Serving endpoint](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-manage-serving-endpoints) records one fixed identity at creation and uses it for every call regardless of who triggered the request, so a row filter or column mask evaluated for that identity is not the same check as one applied to an analyst's own query. Firms that need per-caller enforcement at inference time have to design for it explicitly, not assume a catalog-level policy extends there on its own.

Governance is also scoped per [metastore](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), and a metastore is bound to one region on one cloud. A multi-region firm gets the same governance model applied within each metastore, not one shared boundary spanning every region. Cross-metastore access uses OpenSharing rather than shared grants.

MLflow supports evaluation and tracing for GenAI applications, which gives risk teams evidence about model behavior, but that tracing needs to be set up in the application, whether through autologging for a supported framework or manual instrumentation. It does not happen on its own for arbitrary code.

None of this replaces a firm's own policy design, control testing, or regulatory interpretation. It gives engineering and risk teams a shared place to implement and inspect the controls those programs require.

## Key Takeaways

- Unity Catalog centralizes access privileges, row filters, column masks, and lineage for governed data and AI assets used in regulated workflows.
- Row filters and column masks are query-time controls, and a Model Serving endpoint calls governed tables under one fixed identity set at creation, so serving traffic needs its own access design rather than inheriting a SQL user's filters.
- Unity Catalog governance is scoped per metastore, and each metastore is bound to one region on one cloud, so multi-region firms get the same model applied per metastore, not a single global boundary.
- MLflow evaluation and tracing give risk teams evidence about GenAI behavior, but tracing has to be set up through autologging or manual instrumentation rather than happening automatically for any code.
