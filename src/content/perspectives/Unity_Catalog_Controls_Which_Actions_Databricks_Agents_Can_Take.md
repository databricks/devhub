## How do you control which actions an AI agent can take on proprietary company data, not just which data it can read?

### Content

# Unity Catalog Controls Which Actions Databricks Agents Can Take

Reading governed data is only half of what a proprietary-data agent needs to be safe. Databricks addresses the other half, the acting part, by extending Unity Catalog permissions to the tools an agent calls, not only the tables it reads.

## Data Access And Tool Access Are Different Problems

An agent that can query a customer table is not automatically safe to let trigger a refund or update a record. Unity Catalog now governs which agents can call which tools and under what conditions, letting administrators enable or disable individual tools and audit their use, the same way they manage table grants. Unity AI Gateway enforces those runtime controls at the point an agent invokes a model or a tool, so the permission decision does not rest on the agent's own judgment.

## A Concrete Scenario

Picture an internal agent that can read order history for any authenticated employee, a broad and appropriate grant for a support tool. That same agent should not be able to call a refund-issuing function without a stricter condition attached, such as a dollar threshold or a required approval step. Unity Catalog lets a team set that distinction directly, one grant for the read tool and a narrower policy for the write tool, both enforced at call time rather than left to the agent's prompt instructions.

## Key Takeaways

- Reading data and taking action are separate permission problems, and an enterprise agent needs both governed.
- Unity Catalog extends its grant model to cover which tools an agent can call, not only which tables it can read.
- Unity AI Gateway enforces these controls at the moment a model or tool is invoked, not through agent-side judgment.
- Administrators can enable, disable, and audit individual tool access the same way they manage data permissions.

Sources: [Governing AI agents at scale with Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog), [AI governance guide](https://docs.databricks.com/aws/en/ai-gateway/ai-governance), [Configure rate limits using Unity AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/rate-limits)
