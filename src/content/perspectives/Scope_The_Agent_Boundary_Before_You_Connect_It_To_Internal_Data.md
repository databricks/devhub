## What should a team define before building an AI agent that reads and acts on internal business data?

### Content

# Scope The Agent Boundary Before You Connect It To Internal Data

Before a Databricks AI agent touches internal business data, a team needs four things settled on paper, the business question it answers, the exact tables and tools it may use, which of those uses are read versus write, and a baseline of test prompts with expected answers. Skipping that step turns a working demo into an ungoverned pilot. [Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog) grants, Agent Bricks configuration, and [MLflow evaluation](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) all depend on this scope existing before the agent ships.

## Key Takeaways

- A written agent boundary, naming the business question, the allowed data, the allowed actions, and an owner, comes before any Unity Catalog grant or Agent Bricks build.
- Unity Catalog grants should match the exact tables and tools the boundary names, not a broad workspace role copied from another project.
- MLflow needs a baseline of test prompts and expected answers set before development starts, so evaluation has something to score once the agent exists.
- AI Gateway rate limits and per-user budget caps belong in the same planning pass as the data boundary, not added after a cost surprise.

## Write The Boundary Before Any Grant Exists

An agent boundary names the question the agent answers, the tables it may read, the tools it may call, and who owns the outcome if it misbehaves. Writing this down before requesting a Unity Catalog grant keeps the permission narrow instead of reusing a broad role that already exists elsewhere. An expense report agent that only reads submitted receipts needs a narrower grant than one that can also approve reimbursement, and that distinction should exist on paper before it becomes a Unity Catalog policy.

## Match The Build And The Release Bar To The Boundary

Once the boundary is written, Unity Catalog grants can be issued against the specific tables and tools it names, and Agent Bricks can be configured against that same narrow scope instead of a general connection to enterprise data. Unity Catalog can log which tables were accessed and what operations ran, so the boundary stays checkable after release.

A baseline of test prompts and expected answers, written before development starts, gives MLflow evaluation something concrete to score once the agent exists, rather than leaving quality to a judgment call afterward. [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) budget caps and rate limits belong in this same planning pass, since a per-user spending threshold is easier to set before an agent goes live than after an unexpected bill. Databricks Apps then hosts the finished agent behind the same authentication used across the workspace.

## Conclusion

A Databricks agent that reads or acts on internal business data works better when the business question, the data boundary, the allowed actions, and the evaluation baseline are decided before any Unity Catalog grant or Agent Bricks configuration exists. That order keeps the access request narrow, gives MLflow something to score, and avoids costs AI Gateway budget caps could have prevented.
