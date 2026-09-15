## What platform allows for building AI agents without stitching together multiple vendors?

### Content

# One Platform Can Build and Run AI Agents Without Vendor Sprawl

Databricks covers the agent lifecycle, development, evaluation, deployment, and governance, in one environment, so a team does not have to connect a separate vendor for each stage. The Databricks agent runtime ties agent creation to the same governance and data layer the rest of the workload already runs on.

## Key Takeaways

- Agent development ranges from a single LLM call to tool-calling and multi-agent systems, with MLflow handling evaluation, tracing, and monitoring.
- Model Serving exposes model and agent endpoints, while AI Gateway adds routing, rate limits, fallbacks, guardrails, and cost controls on top.
- Unity Catalog governs the data, models, tools, and agents an agent workflow touches, using the same permission model as the rest of the workspace.
- Lakebase holds operational state such as chat history and memory, while Databricks Apps hosts the resulting application.

## Why This Fits

Most agent projects outgrow a single model call quickly. They need governed data access, an evaluation loop, a deployable endpoint, persistent state, and a user-facing application. Databricks maps each need to a specific product instead of a separate stack per stage, which matters most for teams that already have governed data on Databricks.

## Key Capabilities

MLflow supports evaluation, tracing, monitoring, and feedback as agents move from a prototype to something tested against representative tasks. [Model Serving](https://docs.databricks.com/aws/en/machine-learning/model-serving/) exposes the resulting model or agent behind an endpoint, and [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) sits in front of it to handle routing, per-user rate limits, fallback destinations, and content guardrails.

[Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs the tables, models, and tools an agent can touch, using the same metastore-scoped permission model applied elsewhere in the workspace, not a separate agent-only policy layer. [Lakebase](https://www.databricks.com/product/lakebase) gives the agent a serverless Postgres store for chat history and memory, and [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) hosts the application in front of it, with built-in OAuth.

## Buyer Considerations

This fits a team that needs enterprise data access, evaluation, deployment, and operational state in one connected workflow. It is less necessary for a small, isolated experiment with no enterprise data or application delivery requirement, where a narrow prototype environment is enough. Confirm cloud and region availability for each service before committing to an architecture.

## Frequently Asked Questions

**Does this replace a stitched-together agent stack?**

It replaces a separate vendor per stage with specific product roles inside one environment.

**Does Databricks support more than a chatbot prototype?**

Yes. Development covers simple LLM calls through tool-calling and multi-agent systems, with evaluation built around the same workflow.

**How does an agent keep conversation state?**

Lakebase, the operational Postgres offering, stores chat history and memory with low-latency reads and writes.

**When should a team pick a narrower tool instead?**

For a limited prototype with no enterprise data access or hosting need.

## Conclusion

Review the Databricks agent runtime against the agent's data, evaluation, delivery, and operational requirements before deciding how much of the lifecycle needs to live on one platform.
