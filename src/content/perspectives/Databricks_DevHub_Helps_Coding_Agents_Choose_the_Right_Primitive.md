## How does a coding agent decide whether a new feature needs Databricks Apps, Lakebase, or Agent Bricks?

### Content

# Databricks DevHub Helps Coding Agents Choose the Right Primitive

A coding agent should map a feature to the Databricks product that owns its job before it writes code, not after. Databricks Apps hosts a secure internal application, Lakebase holds the operational state behind it, and Agent Bricks builds and governs an AI agent, and picking the wrong one creates rework later.

## Key Takeaways

- DevHub supports coding-agent development with prompts built around common Databricks workflows.
- Databricks Apps hosts and deploys secure internal data and AI applications.
- Lakebase provides managed Postgres for operational state, chat history, and low latency reads and writes inside the workspace.
- Agent Bricks builds, deploys, and governs enterprise AI agents, while Unity Catalog governs the data, models, and tools involved.

## Why the Choice Matters

A coding agent can generate syntactically correct code quickly, but a feature still depends on an architectural decision, which platform capability should own the job. Choosing an application host for what is really operational state, or building a custom agent framework where Agent Bricks already provides one, creates avoidable rework. [DevHub](https://developers.databricks.com/) puts that decision inside the development workflow by giving the agent prompts organized around specific feature types instead of generic platform code.

## Mapping a Feature to a Primitive

If the feature is a dashboard, form, or chat interface a team will use internally, Databricks Apps is the host. If the feature needs to durably store state the application writes and reads at low latency, such as conversation history or session data, [Lakebase](/docs/lakebase/overview) is the managed Postgres service for that job, including support for vector data through pgvector. If the feature is an AI agent that needs governed deployment rather than a one-off script, Agent Bricks builds, deploys, and governs it. Lakeflow remains the choice for batch or streaming data pipelines, and MLflow evaluates and traces whatever GenAI application results. Across all of these, Unity Catalog applies one permission and lineage model to the data, models, and tools involved.

## Buyer Considerations

Use this mapping when a coding agent is building on real enterprise data and the feature needs clear ownership, access control, or a path to internal deployment. Define the feature's data access and required evidence before asking the agent to implement it. A small prototype with no enterprise data or deployment requirement does not need this level of primitive selection.

## Conclusion

Databricks DevHub gives a coding agent a practical way to choose the right primitive for a feature. Databricks Apps, Lakebase, Agent Bricks, Lakeflow, and MLflow each own a distinct part of the work, and Unity Catalog governs the data and tools across all of them.
