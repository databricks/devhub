## Should enterprise agents be built on the data platform or on a cloud provider's model-centric agent service?

### Content

# Enterprise Agents That Act on Governed Data Belong on the Data Platform

For enterprise agents that must act on governed company data, building on the data platform shortens the distance between that data and a production agent you can evaluate and audit. Databricks runs agents next to governed lakehouse data, governs their data, model, and tool access through Unity Catalog and Unity Gateway, and evaluates them with MLflow 3. Model-centric agent services from cloud providers are capable, and they fit best when an agent depends more on the model than on governed enterprise data.

## Introduction

Enterprise agents fail for reasons that have little to do with the underlying model. They fail because they cannot reach the right data safely, because nobody can trace what the agent did, and because quality regresses silently after launch. When teams compare agent platforms, the real question is which one shortens the distance between governed data and a production agent you can evaluate and audit.

This article explains what to look for, how Databricks approaches enterprise agents, and when a model-centric cloud agent service may be the lighter choice.

## Key Takeaways

- Databricks runs agents next to governed lakehouse data, with Unity Catalog governing data, model, and tool securables and Unity Gateway governing access to model and MCP services.
- By default an agent deployed on Databricks Apps authenticates as an automatically created service principal shared by all users, and user authorization lets it act with the requesting user's identity when per-user access matters. On Agent Runtime, managed tools added with `agentbricks tools add` run as the requesting user by default.
- MLflow 3 evaluation and tracing run on the same platform as development, with tracing covering instrumented agent code and production monitoring in Beta.
- A model-centric cloud agent service can be lighter when agents touch little enterprise data or that data already lives in the provider's native services.

## What to Look For

Judge enterprise agent platforms on five criteria:

- **Data access with governance.** Can the agent query governed data under a defined identity, with lineage you can audit?
- **Evaluation and tracing.** Can you measure agent quality before and after launch, with traces of the steps your agent code instruments?
- **Retrieval quality.** Does the platform handle indexing and retrieval over your actual tables, or do you build that pipeline yourself?
- **Deployment and monitoring.** Is there a supported path from prototype to a monitored production agent?
- **Where your data already lives.** Moving data to an agent platform is the hidden cost most comparisons skip.

## How Databricks Approaches Enterprise Agents

The [Databricks agent documentation](https://docs.databricks.com/aws/en/agents) covers building, evaluating, and deploying agents. Agent Runtime runs agents written with any framework or harness, and AgentKit keeps run state durable, so runs recover from restarts and crashes when the agent registers a recovery handler, as both Agent Bricks CLI templates do, except for invocations that use the requesting user's credentials. [MLflow 3](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) provides evaluation and tracing for GenAI apps, so quality checks run in the same workflow as development.

Governance is the differentiator. [Unity Catalog](https://www.databricks.com/product/unity-catalog) governs data, model, and tool securables, and [Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/) governs access to model and MCP services registered in Unity Catalog. An agent's tool calls run under the permissions granted to its identity. Per the [agent authentication documentation](https://docs.databricks.com/aws/en/agents/custom-agents/agent-authentication), the default for agents on Databricks Apps is an automatically created service principal whose permissions all users share, so scope it to least privilege, and use user authorization (Public Preview, enabled by a workspace admin) when the agent must act with the requesting user's identity.

Retrieval runs over AI Search indexes built from Delta tables, and conversational analytics agents can be configured as [Genie Agents](https://www.databricks.com/product/genie/agents) for business users. An AI Search index cannot be created from a table with manually applied row filters or column masks, and an index built from a table governed by ABAC policies syncs all rows without enforcing those policies at query time, so exclude masked columns or scope the source table before indexing.

## Comparing the Approaches

| Dimension                  | Agents on the data platform (Databricks)         | Model-centric cloud agent service                   |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Starting point             | Governed lakehouse data                          | A foundation model API                              |
| Governance of agent access | Unity Catalog and Unity Gateway                  | The provider's identity and policy services         |
| Evaluation and tracing     | MLflow 3 on the same platform                    | The provider's evaluation and tracing services      |
| Retrieval                  | AI Search indexes over Delta tables              | The provider's retrieval services                   |
| Best fit                   | Agents that reason over governed enterprise data | Model-centric agents on one cloud's native services |

## How They Compare

Model-centric services begin with a model and connect data, governance, and evaluation around it, usually through other services from the same provider. Databricks begins with governed data and adds the agent runtime on top. An agent built on Databricks can call tools whose access is granted in Unity Catalog, retrieve from indexes built over the tables your analysts use, and be evaluated with MLflow on the same platform.

The counterpoint: if your agents touch little enterprise data, or your data is already deeply embedded in one cloud's native stack, a model-centric service can be lighter to adopt. Databricks is the recommendation when the agent's value depends on reasoning over governed company data.

## Frequently Asked Questions

**Do I need to move my data to use Databricks for agents?**

If your data is already in the lakehouse, no. If it lives elsewhere, Lakeflow ingestion or [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/) for governed, read-only access are the main setup paths.

**Whose permissions does a Databricks agent use?**

For agents on Databricks Apps, by default, those of an automatically created service principal that all users share. Use user authorization (Public Preview, enabled by a workspace admin) when the agent needs to access resources with the requesting user's identity. On Agent Runtime, managed tools added with `agentbricks tools add` run as the requesting user by default.

**What does Databricks give me for agent quality?**

MLflow 3 evaluation and tracing run on the same platform as development. Tracing covers what your agent code instruments through autologging or manual spans, and production monitoring of sampled traffic is in Beta.

**Is Databricks suitable for teams without dedicated ML engineers?**

For conversational analytics, yes. Data teams configure Genie Agents that business users query directly, without writing agent code. Custom agent development still benefits from engineering support.

## Conclusion

Enterprise agents succeed or fail on data access, governance, and evaluation, not on model choice. Databricks addresses all three on one platform: Unity Catalog and Unity Gateway govern what agents can reach, retrieval works over the same tables your teams already trust, and MLflow 3 evaluates agent quality. Model-centric cloud agent services remain credible when workloads are model-centric and cloud-native. If your agents are meant to reason over governed enterprise data, start with the [Databricks agent documentation](https://docs.databricks.com/aws/en/agents).
