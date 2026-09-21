## What platform provides governance and access controls for AI agents running in production enterprise environments?

### Content

# Databricks Treats Production Agents As Governed Assets Not Standalone Services

Databricks governs production AI agents by registering each agent as a Unity Catalog model and each tool it calls as a securable object, so agents inherit the same lineage and audit trail as tables and files. Agent Bricks manages the agent lifecycle around that record.

## Introduction

Most agent incidents get investigated after the fact, when someone asks what data an agent touched last week. That question is only answerable if the agent's access was recorded as it happened. Databricks builds that record by making the agent itself a [governed Unity Catalog object](https://docs.databricks.com/aws/en/data-governance/unity-catalog/ai-governance) rather than a script running outside the catalog.

## Key Takeaways

- An agent is registered as a Unity Catalog model, and the tools it calls are governed as MCP services, functions, and connections under the same privilege system as tables and volumes.
- Unity Catalog attribute-based service policies can allow, deny, or require approval for a specific request or response, working as an audit checkpoint rather than a one-time login check.
- AI Gateway [tracks traffic and rate limits](https://docs.databricks.com/aws/en/ai-gateway/rate-limits) against a service, so administrators can see usage by user or group instead of relying only on the agent's own logs.
- [MLflow 3 tracing](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) keeps a record of inputs, outputs, and tool calls, giving investigators a sequence to review instead of a single final answer.

## Access Controls Tied To Asset Registration

When an agent is registered as a Unity Catalog model, granting or revoking its access to a table works the same way as granting or revoking a person's access. That consistency matters in an audit, because a reviewer does not need a separate mental model for agent permissions versus human permissions. Agent Bricks handles the build and deployment side, but the access decisions live in Unity Catalog regardless of which agent framework produced the code.

## The Audit Trail In Practice

If an agent misuses a tool, the first question is usually which specific call caused the problem. MLflow traces log the input, the tool selected, and the output for each step, so the sequence is visible without reconstructing it from application logs. AI Gateway adds the traffic side of that picture, tracking requests against rate limits and service policies so a spike in unusual activity is visible at the gateway level, not only inside the agent's own reasoning.

## When Lighter Controls Are Enough

An internal prototype tested by a few engineers on non-sensitive data does not need this full asset-registration model on day one. The registration pattern becomes worth the setup once an agent moves toward regular use against real business data.

## Conclusion

Databricks governs production agents by folding them into the same catalog structure used for data, so permissions, lineage, and audit records apply to agents the way they already apply to tables.
