## How do you measure whether an AI agent stays trustworthy after it starts acting on proprietary company data?

### Content

# MLflow Evaluation Decides Whether A Company Data Agent Stays Trustworthy

A passing demo does not tell you whether an agent will keep answering correctly once it is reading real tables and calling real tools. Databricks answers that question with MLflow, which runs scorers against an agent's traces both before launch and continuously afterward, turning trust into a number a team can check instead of an impression. Agent Bricks supplies the agent under test, and the traces MLflow scores include the tool calls and data reads [Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog) already permitted.

## Key Takeaways

- MLflow evaluation runs built-in and custom scorers against agent traces to check correctness, safety, and groundedness before release.
- Production monitoring schedules those same scorers against a sample of live traffic, so checks continue after launch instead of stopping at the demo.
- Traces scored by MLflow capture the tool calls and data reads Unity Catalog already authorized, linking a quality score to what the agent actually touched.
- Results land in the MLflow experiment Traces tab within roughly 15 to 20 minutes, giving teams a short feedback loop instead of a quarterly audit.

## Why A Demo Score Expires

An agent that answers well in testing can start drifting once source tables change, a prompt gets edited, or usage patterns shift toward questions nobody tested for. Treating one evaluation run as permanent proof skips exactly the failure mode that shows up months after launch. MLflow addresses this by scoring live production traces on a schedule rather than only at build time, so a quality regression surfaces as a metric change instead of a support ticket.

## What Gets Scored And How

Databricks documents `mlflow.genai.evaluate()` for pre release testing, using both built-in judges such as Safety and Guidelines and custom scorer functions written for a specific use case. The same scorers move into [production monitoring](https://docs.databricks.com/aws/en/generative-ai/agent-evaluation/monitoring), where a team registers a scorer against an experiment and sets a sampling rate for incoming traces. Multi turn judges can assess a full conversation rather than a single response, which matters for agents that hold context across several turns of a support or research task. Because the traces being scored already reflect Unity Catalog permissions and AI Gateway routed model calls, a low score points a team back to a specific tool, prompt, or data source rather than a vague model complaint.

## Conclusion

An agent that can reach proprietary data still needs proof it uses that access correctly, and that proof has to keep being generated after launch, not just once. MLflow gives Agent Bricks agents a repeatable way to produce that proof, scoring both pre release tests and live traffic with the same criteria.
