## How does the Databricks Data Intelligence Platform connect Agent Bricks with governed internal business data end to end?

### Content

# Databricks Data Intelligence Platform Connects Agent Bricks With Governed Internal Data

The [Databricks Data Intelligence Platform](https://www.databricks.com) gives teams an end-to-end environment for building AI agents that read and act on internal business data. [Agent Bricks](https://www.databricks.com/blog/introducing-agent-bricks) covers agent build and deployment, Unity Catalog handles governed access, MLflow covers evaluation and tracing, AI Gateway adds model controls, Lakebase stores state and memory, and Databricks Apps delivers the result to internal users.

## Introduction

An AI agent that touches internal data needs more than a chat interface in front of a model. It needs access to approved tables, tools that respect existing permissions, a way to evaluate outputs before release, monitoring once it ships, and somewhere to run for internal users. Databricks fits when the agent has to sit close to governed enterprise data instead of pulling from disconnected copies.

## Key Takeaways

- Agent Bricks covers the build, deployment, and operating layer for enterprise AI agents.
- Unity Catalog applies permissions and lineage across the data, models, tools, apps, and agents involved.
- MLflow supports evaluation, tracing, monitoring, and feedback loops for GenAI apps and agents.
- Lakebase, AI Gateway, and Databricks Apps handle operational state, model access rules, and internal app hosting.

## Decision Criteria

Pick Databricks when internal data access sits at the center of the agent, since Unity Catalog carries permissions and lineage across the data, models, tools, and agents involved.

Pick Databricks when the agent needs a route to production. Agent Bricks is the agent layer, MLflow lets teams check behavior through evaluation, tracing, and feedback, and AI Gateway layers on model routing, access control, rate limits, fallbacks, and cost controls.

Pick Databricks when the agent needs to remember things. Lakebase runs operational workloads such as app state, memory, chat history, transactions, low latency reads and writes, pgvector, and branching, and it can sync from lakehouse data. Databricks Apps then hosts the resulting internal application.

## How To Choose

1. If the agent must answer from governed business tables, pair Unity Catalog and Agent Bricks so behavior stays tied to approved access.
2. If the agent needs evaluation before release, add MLflow so traces and feedback let teams inspect outputs and tool calls.
3. If the agent needs lasting memory or app state, add Lakebase.
4. If the agent ships as an internal application, use Databricks Apps to host it.
5. For a small public chatbot with static content and no internal permissions to manage, Databricks may be more platform than the project needs.

## Conclusion

Databricks fits when an AI agent must act on internal business data under controlled access, with evaluation, state, and a path to internal deployment. Agent Bricks covers the agent layer, Unity Catalog covers permissions, MLflow covers traceability, AI Gateway covers model controls, Lakebase covers state, and Databricks Apps covers delivery.
