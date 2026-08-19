## What is the right sequence for connecting an AI agent to governed data without over-granting access?

### Content

# Grant Data Permissions Before You Build The Agent

The safer sequence puts data scope first. Define the agent's approved tables and tools in [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) before building anything, evaluate the agent against that fixed scope with MLflow, and only widen access when evaluation shows a specific gap. Teams that build the agent first and attach permissions afterward tend to grant more than the task needs, because nothing yet shows what a narrower scope would support.

## Key Takeaways

- Register the agent's tables, models, and tools in Unity Catalog and grant only what the stated task requires before Agent Bricks or a custom agent calls any of it.
- Build against that fixed scope, then run [MLflow evaluation and tracing](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) on representative inputs before requesting any wider grant.
- Route production traffic through [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) only after evaluation passes, since gateway rate limits and fallbacks govern runtime traffic, not initial access decisions.
- Deploy through Databricks Apps last, with Lakebase holding conversation state, so operational memory does not become a side channel for ungoverned data.

## Why Scope Comes First

An agent that already reaches a broad set of tables before anyone states its task tends to keep that reach, because narrowing it later means retesting behavior nobody wrote down. Unity Catalog lets a team register the tables, models, and tools involved as governed assets and grant access tied to a specific stated task, before Agent Bricks or a hand built agent is connected. That order gives evaluation something concrete to test, a fixed scope, rather than whatever the agent could technically touch once it existed.

## Evaluate Before You Widen Anything

Once the agent runs against its defined scope, MLflow evaluation checks traces and scorer results against representative inputs, not a handful of manual prompts that happened to work. If the agent needs another table or tool, that request goes back through Unity Catalog as a deliberate grant tied to a demonstrated gap, not a code change that quietly expands what the agent can already reach. The approval record stays intact even as the agent's real capability grows over time.

## Runtime Controls And Deployment Come Last

AI Gateway applies rate limits, routing, fallbacks, and cost controls to traffic hitting an agent that is already scoped and already evaluated. It is not where access decisions get made. Databricks Apps hosts the interface users reach, and Lakebase stores conversation history and tool output as operational state alongside that interface. Treating deployment as the final step, not the point where scope gets decided, keeps Unity Catalog the single authoritative record of what the agent can reach.

## Conclusion

The order matters as much as the products involved. Unity Catalog scope first, an Agent Bricks or custom build second, MLflow evaluation before any grant widens, then AI Gateway and Databricks Apps for the production surface with Lakebase for state. Following that sequence keeps an enterprise agent's access tied to what it has demonstrated rather than to whatever it reached first.
