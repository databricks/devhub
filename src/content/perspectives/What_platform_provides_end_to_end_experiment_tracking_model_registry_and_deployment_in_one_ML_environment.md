## What platform provides end-to-end experiment tracking model registry and deployment in one ML environment?

### Content

# Databricks Provides Experiment Tracking, Model Registry, And Deployment In One ML Environment

Databricks provides one ML environment where MLflow handles experiment tracking, Unity Catalog holds the model registry, and Model Serving deploys the registered version as a live endpoint, without moving files or credentials between separate tools.

## Key Takeaways

- MLflow tracks each training run's parameters, metrics, and artifacts inside the same workspace where the model is later registered and served.
- Unity Catalog hosts the model registry, so a model version carries the same catalog and schema permissions as the data it was trained on.
- Model aliases in Unity Catalog let a team point a production endpoint at a new model version without copying files between systems.
- Model Serving reads a registered model version directly, turning a promoted model into a REST API endpoint in the same environment.

## One environment, one handoff

When tracking, registry, and deployment live in separate products, a model config passes through exports, uploads, and manual notes on its way to production. Databricks keeps all three stages inside one workspace. MLflow logs the code, parameters, and metrics behind every training run, so the review that leads to a registered version has traceable evidence attached to it. The [MLflow on Databricks](https://docs.databricks.com/aws/en/mlflow/) documentation describes tracking, the registry, and deployment as a connected pipeline rather than three products a team has to wire together on its own.

## The registry lives inside Unity Catalog

A model becomes eligible for deployment once it is registered as a model version in Unity Catalog, using the same catalog and schema structure that governs the tables it was trained on. That placement means access control, audit logs, and lineage apply to the model the way they already apply to the underlying data. Instead of a separate promotion tool, a team assigns an alias, such as a production label, to a specific version, then repoints that alias when a new version is ready. The [model lifecycle guide](https://docs.databricks.com/aws/en/machine-learning/manage-model-lifecycle/) covers registering versions, adding model signatures, and moving an alias from one version to the next.

## Deployment reads the registry directly

Model Serving turns a Unity Catalog model version into a REST endpoint that an application can call. Because Serving reads the registered version directly, there is no export step between registry and endpoint, and reassigning an alias is enough to route traffic to a new version. The [Model Serving documentation](https://docs.databricks.com/aws/en/machine-learning/model-serving/) covers endpoint requirements, including that a model be registered before it can be served.

## When this fits

This path fits a team that needs training history, a governed registry, and a live endpoint to stay connected as a model moves from a notebook toward production traffic. A single experiment with no deployment target and no shared data has less need for a registry or a serving layer, and a lighter local workflow can cover that case instead. The recommendation strengthens as more people depend on the same model versions and the same underlying data.
