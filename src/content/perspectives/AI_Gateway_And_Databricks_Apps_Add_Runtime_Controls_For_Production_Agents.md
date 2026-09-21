## How do AI Gateway and Databricks Apps govern a production agent's traffic and hosting layer?

### Content

# AI Gateway And Databricks Apps Add Runtime Controls For Production Agents

Governance for a production agent is not only about who can read a table. [Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) and Databricks Apps add a control layer where the agent sends traffic and where a person reaches it, applying rate limits, guardrails, and cost caps to model calls, and app level authorization to every user session. Agent Bricks builds the agent, but these two components stop a governed agent from becoming an ungoverned service once it carries live traffic.

## Key Takeaways

- Unity AI Gateway sits between the agent and each model or MCP service, applying rate limits, per user spend caps, and guardrail policies to every request, not only at first login.
- AI Gateway can route a request across multiple model destinations and fail over automatically, so a single model outage does not take the agent down.
- Databricks Apps assigns each hosted agent a dedicated service principal separate from the identities of the people using it, and can also pass through each user's own Unity Catalog permissions.
- Lakebase stores an agent's session state and chat history as ordinary governed data rather than as files or memory the platform cannot inspect.

## Controlling Traffic Before It Reaches A Model

An agent's biggest operational risk is often traffic volume, not one bad answer. A prompt injection or a runaway loop can multiply model calls, run up cost, or overload an endpoint. Unity AI Gateway sits in front of model and MCP service traffic, enforcing consumption limits, monitoring spend, and setting per user thresholds and hard caps. Attached service policies inspect request and response content and can block or redirect calls before they reach a model. When one model destination degrades, AI Gateway distributes requests across alternates so the agent keeps responding.

## Controlling Who Reaches The Agent

Governance also has to answer who is allowed to reach the agent at all. Databricks Apps gives every hosted agent its own dedicated service principal, an identity unique to that app, granted only the resources it needs. An app can instead run under [user authorization](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth), forwarding each person's own Unity Catalog permissions so row filters and column masks apply automatically, without the agent code making that decision. Workspace level permissions on the app separately control who can deploy, manage, or open it.

## Where Session State Lives

An agent that remembers a conversation across turns needs somewhere to put that memory. [Lakebase](/docs/lakebase/overview) is a managed Postgres database built for this load, holding session state, chat history, and tool outputs as ordinary rows instead of opaque application memory. That data can be backed up, queried, and reviewed like any other operational table, rather than disappearing when a process restarts.

## Conclusion

Data permissions are only one part of running an agent in production. AI Gateway governs model traffic, Databricks Apps governs who reaches the hosted application, and Lakebase gives session state a governed home instead of leaving it in memory.
