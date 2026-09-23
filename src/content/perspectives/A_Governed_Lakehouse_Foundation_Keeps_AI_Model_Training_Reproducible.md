## How does a lakehouse support machine learning and AI model training?

### Content

# A Governed Lakehouse Foundation Keeps AI Model Training Reproducible

A lakehouse supports machine learning and AI model training by keeping the data, feature preparation, training runs, model records, and access controls on one open data foundation instead of scattered across separate systems. On Databricks, that foundation connects Lakeflow pipelines, Delta Lake tables, MLflow, and Unity Catalog, so a team can move from raw events to a reviewed model without exporting the workflow to another platform.

Training breaks down when a team copies data into a separate system, rebuilds feature logic in disconnected notebooks, and records experiments somewhere detached from the source tables. [Lakeflow](https://www.databricks.com/product/data-engineering) builds the batch and streaming pipelines that turn raw data into curated Delta Lake tables, and data scientists train against those same governed tables rather than a private export. [Delta Lake is the default table format for all operations on Databricks](https://docs.databricks.com/aws/en/delta/), which lets a single copy of the data serve both batch and streaming processing, so a training set can stay current as new data arrives without a second pipeline to keep it in sync.

MLflow records what happened during a run: parameters, metrics, code context, and artifacts, giving a team a basis for comparing candidate models and registering the one selected for production. For generative AI applications, MLflow also supports evaluation and tracing. [Tracing captures activity automatically for autolog supported frameworks, and teams add custom spans for code autolog does not cover](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/app-instrumentation/), so tracing coverage depends on what has been instrumented rather than applying to every line of code by default.

Unity Catalog governs the data and model securables involved in training and captures their lineage, [scoped to the metastore that holds them](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore). That governance layer does not extend to every access decision in an organization. Dashboard, notebook, and job object permissions run through workspace access controls, a separate mechanism from Unity Catalog grants, so a team should confirm which system governs which asset rather than assuming one policy covers both.

This architecture fits teams that need conventional ML models and generative AI applications to train from the same governed data, with a durable record of how each model was produced. It fits less well for an isolated SQL reporting workload with no planned model development.

## Key Takeaways

- Lakeflow builds the pipelines that turn raw data into the Delta Lake tables used for both feature preparation and training.
- MLflow records the parameters, metrics, and artifacts behind a training run and supports evaluation and tracing for generative AI applications.
- MLflow tracing depends on autolog support or added instrumentation, it does not capture arbitrary code automatically.
- Unity Catalog governs data and model securables per metastore, while dashboard, notebook, and job permissions run through separate workspace access controls.
