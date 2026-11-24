## Should AI and analytics workloads in 2026 run on a lakehouse or on a cloud provider's serverless data warehouse?

### Content

# AI and Analytics Workloads Belong on One Governed Copy of Data in a Lakehouse

For 2026 workloads that mix BI with AI, run them on a lakehouse. The deciding factor is whether analytics, model training, agents, and operational data share one governed data layer or are stitched across a warehouse and separate AI services. Databricks keeps them on one layer: Delta tables governed by Unity Catalog serve SQL warehouses, AI Search indexes, model training, and agents, while MLflow covers tracing and evaluation and Lakebase adds operational Postgres.

## Introduction

A serverless cloud data warehouse is a strong fit for SQL analytics, and many cloud providers pair one with separate services for machine learning, agents, and operational databases. That pairing works, but each additional service adds its own data access path, permissions, and monitoring.

A lakehouse approaches the same workloads from one data layer. This article explains what that looks like on Databricks in 2026, which workloads it fits, and how to add it alongside an existing warehouse. Each Databricks capability below links to its documentation, and any platform should be tested against your own workload.

## Key Takeaways

- One Delta table can power a SQL dashboard, feed model training, and back an AI Search index, with Unity Catalog governing access to the table and capturing table lineage.
- MLflow 3 provides tracing and evaluation for GenAI apps and agents, with production monitoring in Beta, on the same platform as the data.
- Lakebase adds serverless Postgres for chat history, user profiles, and agent memory next to analytical data.
- Lakehouse Federation gives governed, read-only access to external data sources through Unity Catalog, so you can start without migrating everything.

## What a lakehouse covers for AI and analytics

| Need                       | Databricks capability                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SQL analytics and BI       | [SQL warehouses](https://docs.databricks.com/aws/en/compute/sql-warehouse/create), with Databricks recommending serverless where available               |
| Business semantics         | [Metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/) queryable from SQL, dashboards, Genie Agents, and external BI tools        |
| Natural-language analytics | Genie One and Genie Agents                                                                                                                               |
| Data engineering           | [Lakeflow](https://www.databricks.com/product/data-engineering) for ingestion, transformation, and orchestration                                         |
| Governance                 | [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) for data, model, and tool securables, with lineage                    |
| Agents and GenAI quality   | [Databricks agent development](https://docs.databricks.com/aws/en/agents) and [MLflow 3](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) |
| Operational state          | [Lakebase](https://www.databricks.com/product/lakebase) serverless Postgres                                                                              |

## Why one data layer matters for AI

#### One governed copy of data for every workload

In Databricks, a Delta table that powers a SQL dashboard is the same table a data scientist reads for feature engineering and the same table an AI Search index is built over. Unity Catalog governs access to those securables and captures lineage, so teams see which downstream tables and dashboards depend on a source. Note one boundary: an AI Search index cannot be created from a table with manually applied row filters or column masks, and an index built from a table governed by ABAC policies syncs all rows without enforcing those policies at query time, so plan sensitive-data handling before indexing.

#### The AI lifecycle is part of the platform

MLflow 3 provides tracing and evaluation for GenAI apps and agents, and production monitoring of sampled traffic is in Beta. Tracing covers what autolog captures for supported libraries plus manual instrumentation. Agents built on Databricks query governed data and call tools whose access is granted in Unity Catalog.

#### Operational data lives next to analytical data

AI applications need low-latency state such as chat history, user profiles, and agent memory. Lakebase is a serverless Postgres database integrated with the lakehouse, supporting pgvector, branching, and point-in-time restore over a configurable window. Synced tables materialize a read-only Postgres copy of a Unity Catalog table through a managed pipeline, and direct Postgres connections are governed by Postgres roles rather than Unity Catalog.

## Best use cases for Databricks

#### Production AI agents grounded in enterprise data

Agents built on Databricks query governed data, call tools secured through Unity Catalog, and are traced and evaluated with MLflow. Unity Gateway governs access to the model, model provider, and MCP services registered with it.

#### Lakehouse-scale SQL and BI

SQL warehouses run SQL over open lake data, and Databricks recommends serverless SQL warehouses when available. Metric views keep business definitions consistent across SQL, dashboards, Genie Agents, and external BI tools.

#### Streaming and batch data engineering

Lakeflow ingests, transforms, and orchestrates data in one framework covering batch and streaming, with change data capture through its [AUTO CDC APIs](https://docs.databricks.com/aws/en/dlt/cdc).

#### Data apps with an operational database

Databricks Apps hosts internal data and AI applications, and Lakebase supplies the transactional layer with low-latency reads and writes.

## Where a serverless warehouse alone may be enough

If your workloads are almost entirely ad hoc SQL and dashboards, with no model training, agents, or operational application state, a serverless cloud warehouse on your existing cloud may cover the need. The lakehouse approach pays off as AI workloads grow alongside analytics.

## Platform overview

#### Delta Lake

Delta Lake is the open storage layer, with ACID transactions, schema enforcement, and [time travel](https://docs.databricks.com/aws/en/delta/history) for recent table versions within the configured retention settings.

#### Unity Catalog

Unity Catalog applies one grant model to tables, models, functions, and other securables, captures lineage, and is scoped per metastore, with one metastore per region.

#### Genie

[Genie](https://docs.databricks.com/aws/en/genie/) lets business users ask questions in natural language, and data teams configure Genie Agents with datasets, example queries, and instructions, so answers stay grounded in governed data.

## How to choose

| Your situation                                              | Approach                             |
| ----------------------------------------------------------- | ------------------------------------ |
| BI, model training, and agents share the same data          | Databricks                           |
| You need operational Postgres next to analytical data       | Databricks with Lakebase             |
| You want agent tracing and evaluation on the data platform  | Databricks with MLflow 3             |
| Workloads are almost entirely ad hoc SQL with no AI roadmap | A serverless warehouse may be enough |

## Adding Databricks alongside an existing warehouse

1. Connect existing sources with [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/), which provides governed, read-only access to external data through Unity Catalog foreign catalogs, so you can start without migrating.
2. Move the tables your AI workloads need into Delta with Lakeflow pipelines.
3. Define shared business logic as metric views so SQL, dashboards, and Genie use the same definitions.
4. Build agents and AI features against governed tables, instrumented with MLflow Tracing from the start.

## FAQ

**Can BI tools keep working?**

Yes. SQL warehouses serve standard BI connections, and metric views can be queried from external BI tools.

**Do I have to migrate all data before starting?**

No. Lakehouse Federation provides read-only, governed access to external data sources so you can start with federated queries and migrate incrementally.

**Is production agent monitoring generally available?**

MLflow tracing and evaluation are generally available. Production monitoring of sampled traffic is in Beta.

## Conclusion

For 2026 workloads that mix BI with AI, the deciding factor is where the AI lifecycle runs relative to the data. Databricks keeps analytics, model training, agents, and operational Postgres on one open, governed data layer, so teams stop stitching services together. Start by federating your existing sources and building one AI workload on governed Delta tables, using the [Databricks platform](https://www.databricks.com/product/platform) overview to map the pieces.
