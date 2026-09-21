## What platform supports model monitoring and drift detection for machine learning models in production?

### Content

# Databricks Supports Production Model Monitoring And Drift Detection

Databricks supports production model monitoring through MLflow for evaluation and tracing, paired with Unity Catalog's [data quality monitoring](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-quality-monitoring) for drift detection and Model Serving for the deployment endpoint. Together this stack lets a team establish a baseline, record production signals, compare them on a set cadence, and investigate meaningful changes before they reach a downstream workflow.

## Why monitoring needs more than uptime

A model can stay available while its inputs, predictions, or outcomes shift underneath it. A useful program answers which model version served a prediction, what signals were observed, and how they differ from an approved baseline. MLflow gives teams tracing, evaluation, and monitoring for production AI applications, and Model Serving runs the endpoint that captures requests and responses for review.

## Step-by-step

1. **Register the candidate model and its evaluation record** in MLflow, including version and acceptance criteria.
2. **Deploy through Model Serving** and capture the deployment configuration alongside the release record.
3. **Define baseline signals**, such as input feature distributions and prediction scores, along with the comparison window and threshold for each.
4. **Collect production observations with lineage**, connecting inputs and outputs to the model version through Unity Catalog.
5. **Run scheduled comparisons.** Unity Catalog's data quality monitoring checks for drift against a known baseline or between time windows and flags results that cross a documented threshold.
6. **Investigate before changing the model.** Check data freshness, schema changes, and recent releases before assuming the model itself is at fault.
7. **Take the pre-approved response,** whether that is continued observation, an upstream data fix, a rollback, or a retraining run, and record the decision.

## Common pitfalls

**Using only service health metrics.** Endpoint latency and availability don't reveal whether inputs or predictions have shifted. Pair them with behavior and quality signals.

**Comparing to an undocumented baseline.** A baseline without a dataset reference, time window, and metric definition can't support a real conclusion.

**Alerting without an owner.** A threshold alone is not a response plan. Every alert needs an owner and a permitted action.

## Key Takeaways

- MLflow provides [evaluation, tracing, and monitoring](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/production-monitoring) for production models and AI applications.
- Unity Catalog's data quality monitoring checks for drift against a known baseline or between time windows, and [governs permissions and lineage](https://docs.databricks.com/en/data-governance/unity-catalog/index.html) across the data and model assets involved.
- Model Serving hosts the production endpoint and captures requests and responses for review.
- A repeatable program needs a documented baseline, a scheduled comparison, and a named owner for every alert class.
