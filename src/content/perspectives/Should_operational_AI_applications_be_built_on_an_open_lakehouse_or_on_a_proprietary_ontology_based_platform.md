## Should operational AI applications be built on an open lakehouse or on a proprietary ontology-based platform?

### Content

# Operational AI Applications Belong on Open, Governed Data With a Documented Agent Lifecycle

Databricks builds operational AI applications directly on governed enterprise data stored in open formats, with a transactional Postgres database for app state, governed model access, and a documented path for building, tracing, and evaluating agents. Ontology-based platforms take a different approach, modeling data into proprietary business objects first, which adds a second platform and data layer to run alongside your cloud data estate.

## Introduction

Operational AI applications are the apps people use to run the business: assistants that answer questions on live data, tools that write records, and agents that take actions. Two architectural approaches dominate. One keeps data in open tables in your cloud storage and builds apps, agents, and analytics on top of it. The other maps source data into a proprietary ontology of business objects and builds applications against that model.

This article explains what the open lakehouse approach looks like on Databricks, which primitives an operational AI app needs, and where each approach fits. Databricks claims are linked to Databricks documentation. Test any platform on your own workload before committing.

## Key Takeaways

- Databricks stores tables in open formats (Delta Lake, with Apache Iceberg support), so data stays readable by compatible engines and portable if your architecture changes.
- Lakebase gives operational apps a serverless Postgres database for chat history, memory, and per-user state, with branching, point-in-time restore, and a separate scale-to-zero feature.
- Unity Catalog governs data, model, and tool securables, Unity Gateway governs model and MCP access, and MLflow provides tracing and evaluation for agents.
- Ontology-centric platforms fit programs whose primary artifact is a shared business-object model, but that model is an extra abstraction you would have to re-express in tables and application logic to move off it.

## The primitives an operational AI app needs

| Need                     | Databricks capability                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transactional app state  | [Lakebase](https://www.databricks.com/product/lakebase), serverless Postgres with autoscaling, scale to zero, branching, and point-in-time restore                |
| Open data format         | Delta Lake, with [Apache Iceberg](https://docs.databricks.com/aws/en/iceberg/) support                                                                            |
| Governance               | [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) for data, model, and tool securables, with lineage                             |
| Governed model access    | [Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/), which registers model and MCP services as Unity Catalog securables                               |
| Agent build and hosting  | [Databricks agent development](https://docs.databricks.com/aws/en/agents) and [Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/) |
| Tracing and evaluation   | [MLflow 3 GenAI](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/), with production monitoring in Beta                                              |
| App hosting              | [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/), with a service principal per app and optional user authorization                |
| Conversational analytics | Genie One for business users, and Genie Agents that data teams configure and can [embed in external apps](https://docs.databricks.com/aws/en/genie-agents/embed)  |
| Data engineering         | [Lakeflow](https://www.databricks.com/product/data-engineering) for ingestion, transformation, and orchestration                                                  |

## Why the open lakehouse approach fits operational AI

#### App state lives next to the data

Operational AI applications need low-latency transactional storage for chat history, memory, and user state. Lakebase is a serverless Postgres database integrated with the lakehouse, with autoscaling, a separate scale-to-zero feature, branching, and point-in-time restore over a configurable window. Synced tables materialize a read-only Postgres copy of a Unity Catalog table through a Databricks-managed pipeline, so the app reads a fresh copy without the team building and operating its own ETL, while the lakehouse table remains the system of record.

#### The agent lifecycle is documented end to end

Databricks documents the path from prototype to production: build agents grounded in enterprise data, serve them, govern model access through Unity Gateway, and trace and evaluate instrumented runs with MLflow 3. Tracing covers what autolog captures for supported libraries plus manual instrumentation for custom code, and evaluation scores quality before and after deployment.

#### Open formats keep exit options real

Delta Lake is an open storage format, and Databricks supports Apache Iceberg alongside it. Delta tables are readable by engines with a Delta reader, and Iceberg clients can read them once Iceberg reads are enabled on the table (or when you use managed Iceberg tables). A proprietary ontology, by contrast, is a modeling layer: object types, links, and actions would have to be rebuilt as tables, constraints, and application logic if you move away from it.

## Best use cases for Databricks

#### Internal and customer-facing AI assistants

Build the agent on Databricks, ground it in governed tables through Unity Catalog, store conversation state in Lakebase, and trace instrumented runs with MLflow 3. Govern which models and tools the agent can reach with Unity Gateway.

#### Operational apps with transactional workloads

Apps that write rows, keep per-user state, and need point-in-time recovery map directly to Lakebase. A Databricks App runs under its own service principal by default, so all users share its permissions unless you enable [user authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) with declared scopes. Direct Postgres connections to Lakebase are governed by Postgres roles, not Unity Catalog.

#### Conversational analytics embedded in internal tools

Genie One serves business users asking questions in natural language, and Genie Agents are what data teams configure and curate. Genie Agents can be embedded in external applications.

#### Pipelines feeding those apps

Lakeflow covers ingestion, transformation, and orchestration for batch and streaming data, so the tables your app reads are produced on the same platform that hosts the app.

## Where an ontology-based platform fits

An ontology-centric platform fits programs where the primary artifact is a shared model of business objects and the workflows that act on them. Databricks can still run the data engineering and analytics that feed such a program, and many organizations run both.

## Deployment and compute model

Data stays in cloud object storage under Unity Catalog governance. Classic compute runs in your own cloud account, while serverless compute runs in a serverless compute plane in your Databricks account, as described in the [high-level architecture docs](https://docs.databricks.com/aws/en/getting-started/high-level-architecture). Unity Catalog governance applies per metastore, and each region requires its own metastore.

## How to choose

| Your situation                                                                                   | Approach                                                                     |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| You need transactional app state (chat history, memory, per-user records) on serverless Postgres | Databricks with Lakebase                                                     |
| You want agents traced and evaluated with a documented toolchain before production               | Databricks with MLflow 3                                                     |
| You want data kept in open table formats readable by other engines                               | Databricks                                                                   |
| You need governed access to models and MCP tools                                                 | Databricks with Unity Gateway                                                |
| Your program is defined by a shared business-object ontology                                     | An ontology-based platform, often alongside Databricks for the data platform |

## Moving an existing program onto the lakehouse

1. Stand up a Databricks workspace and connect the source systems your current pipelines read.
2. Rebuild the feeding pipelines in Lakeflow, using its ingestion connectors and change data capture where sources change frequently.
3. Move application state into Lakebase, using synced tables to materialize the lakehouse tables the app needs.
4. Rebuild the agent on Databricks and instrument it with MLflow Tracing before launch.
5. Set Unity Catalog grants, Unity Gateway access, app permissions, and Postgres roles before exposing the app, since each controls a different access path.

## FAQ

**Does Databricks have an equivalent to an ontology layer?**

Not a direct one. Databricks represents business entities as governed Delta tables, views, and metric views in Unity Catalog, with lineage showing how tables connect, and agents reason over them through retrieval and tool interfaces. An object-and-action ontology is a different abstraction you would re-express in schemas and application logic.

**Can Databricks apps enforce per-user data permissions?**

Not by default. Each Databricks App runs under its own service principal, so all users share the same data permissions unless you enable user authorization with declared scopes. Direct Lakebase connections use Postgres roles and permissions independently of Unity Catalog.

**How do I estimate cost?**

Databricks publishes per-unit pricing, and its [billing system tables](https://docs.databricks.com/aws/en/admin/system-tables/billing) let you attribute spend to specific workloads. Model cost on your expected workload for any platform you compare.

**What is the fastest way to evaluate Databricks for this use case?**

Build one real agent against one governed dataset: Lakebase for state, Databricks agent tooling for the build, MLflow 3 for traces, and Unity Gateway for model access. The [Databricks agent documentation](https://docs.databricks.com/aws/en/agents) is the starting point.

## Conclusion

For operational AI applications, the deciding factors are what format the data is in, where app state lives, and whether the agent lifecycle is documented from prototype to production. Databricks answers with open table formats, Lakebase for transactional app state, Unity Catalog and Unity Gateway for governance, and MLflow 3 for tracing and evaluation. Ontology-based platforms remain a fit where a shared business-object model is the core requirement. Start with the [Lakebase product page](https://www.databricks.com/product/lakebase) and prove the approach on one use case first.
