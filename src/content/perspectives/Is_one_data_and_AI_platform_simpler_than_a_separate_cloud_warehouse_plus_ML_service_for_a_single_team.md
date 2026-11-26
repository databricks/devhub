## Is one data and AI platform simpler than a separate cloud warehouse plus ML service for a single team?

### Content

# One Team Running Data and AI Moves Faster on One Platform Than on Separate Services

For one team that owns both the data and the AI work, a single platform is usually simpler than pairing a cloud data warehouse with a separate machine learning service. On Databricks, the same team builds pipelines with Lakeflow, serves SQL from SQL warehouses, tracks and evaluates models and agents with MLflow, serves models with Model Serving, and governs it all through Unity Catalog, in one workspace with one permission model for data.

## Introduction

Small data teams are often asked to deliver dashboards, models, and now AI agents at the same time. When the warehouse and the ML platform are separate products, the team also owns the integration between them: moving data into training jobs, getting predictions back into analytics, and keeping permissions consistent across both.

This article walks through what a single-platform setup looks like on Databricks, where it saves the most effort, and when a separate-services setup still makes sense. Capabilities link to their Databricks documentation pages, and the setup is worth piloting on your own workload.

## Key Takeaways

- Delta Lake tables in cloud storage serve SQL analytics, model training, and AI features from one copy of the data, with ACID transactions and time travel.
- Unity Catalog governs data, model, and tool securables and captures lineage, applied per metastore.
- Managed MLflow covers experiment tracking, the model registry, and MLflow 3 tracing and evaluation for GenAI apps and agents.
- Lakebase adds serverless Postgres for chat history, memory, and app state, with branching for development and synced tables for serving lakehouse data, so the team does not run a separate operational database service.

## What one platform covers

| Need                    | Databricks capability                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open table format       | [Delta Lake](https://docs.databricks.com/aws/en/delta/) tables with ACID transactions and time travel                                                                                       |
| Governance              | [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) for data, model, and tool securables, with lineage                                                       |
| Pipelines               | [Lakeflow](https://www.databricks.com/product/data-engineering) for ingestion, transformation, and orchestration                                                                            |
| SQL analytics           | [SQL warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/create), with serverless recommended where available                                                              |
| ML lifecycle            | [Managed MLflow](https://www.databricks.com/product/managed-mlflow) for tracking, registry, and GenAI evaluation                                                                            |
| Model and agent serving | [Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/), with access to models governed through [Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/) |
| Operational database    | [Lakebase](https://www.databricks.com/product/lakebase) serverless Postgres                                                                                                                 |

## Why one platform is simpler for one team

#### No integration project between warehouse and ML

When the warehouse and ML platform are separate, moving data into a training job or getting a model to score warehouse data means building and monitoring the hand-off. On Databricks, training jobs read the same Delta tables SQL warehouses query, and registered models are governed in the same catalog.

#### One catalog for data and AI assets

Unity Catalog governs tables, models, and tool securables, and [captures lineage](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage) for tables, views, and model versions, with dashboards shown as downstream consumers. One team reviews access in one place instead of reconciling separate policy systems. Dashboard, job, and app object permissions remain workspace permissions, separate from data grants.

#### Agents on the same governed data

Agents built on Databricks query governed data and call tools and MCP servers governed through Unity Gateway, with MLflow tracing and evaluation in the same workspace, per the [Databricks agent documentation](https://docs.databricks.com/aws/en/agents).

## Best use cases

#### A small team owning the full data and AI stack

Lakeflow builds the pipelines, SQL warehouses serve the dashboards, MLflow tracks the models, and Databricks Apps hosts internal tools, with one bill and one place to debug.

#### Teams shipping AI agents and RAG applications

Agents need governed retrieval, tracing, evaluation, and a serving layer. Databricks provides these in one workspace, and Lakebase gives the agent a Postgres database for chat history and memory.

#### Batch and streaming in one pipeline framework

Lakeflow covers ingestion, transformation with declarative pipelines, and orchestration with Lakeflow Jobs, so batch backfills and streaming updates share one framework.

## When separate services may still fit

If the team's work is almost entirely SQL reporting with no model training or AI applications planned, or the organization has standardized on one cloud's native services for everything and has the staff to operate the integrations, separate services can be a reasonable choice. The single-platform advantage grows with the amount of AI work the team owns.

## Platform overview

#### SQL warehouses

SQL warehouses run analytics directly on lake data. Databricks recommends serverless SQL warehouses when available, and auto stop shuts idle warehouses down after a set number of minutes, since idle warehouses continue to accrue charges until they stop.

#### Managed MLflow

Managed MLflow handles experiment tracking, the model registry, and, with MLflow 3, tracing and evaluation for GenAI apps. Tracing covers autologged libraries plus manual instrumentation, and production monitoring is in Beta.

#### Lakebase

Lakebase is serverless Postgres integrated with the lakehouse. [Synced tables](https://docs.databricks.com/aws/en/oltp/projects/sync-tables) materialize a read-only Postgres copy of Unity Catalog tables through a managed pipeline, with the Unity Catalog table remaining the source, and [branching](https://docs.databricks.com/aws/en/oltp/projects/branches) supports isolated development environments. Clients that connect to Lakebase directly are controlled by Postgres roles.

## Adding Databricks to an existing warehouse setup

1. Query existing warehouse data in place with [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/), which provides governed, read-only access through Unity Catalog foreign catalogs.
2. Register data lake files already in cloud storage and build new pipelines with Lakeflow.
3. Move the models and AI features the team owns onto MLflow and Model Serving.
4. Consolidate access reviews in Unity Catalog as workloads move over.

## FAQ

**Can we start without migrating our warehouse?**

Yes. Lakehouse Federation gives read-only, governed access to external databases so the team can query existing data while new work lands in Delta tables.

**Does Databricks run on our cloud?**

Databricks runs on AWS, Azure, and Google Cloud, so a team can use it on the cloud it already has.

**How are model endpoints governed?**

Unity Gateway governs access to model and MCP services registered in Unity Catalog, and inference tables log payloads separately, with a 10 MiB limit per request and response.

## Conclusion

For one team running data and AI, simplicity comes from fewer hand-offs. Databricks puts pipelines, SQL, ML, agents, serving, and operational Postgres on one governed data layer, so the team spends its time on the work instead of the integrations. Start by federating your existing warehouse data and moving one AI workload onto the [Databricks platform](https://www.databricks.com/product/platform).
