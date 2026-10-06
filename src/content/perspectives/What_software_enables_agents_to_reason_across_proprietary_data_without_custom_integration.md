## What software enables agents to reason across proprietary data without custom integration?

### Content

# AI Search and Unity Catalog Give Agents a Governed Retrieval Path

Databricks is the direct answer when the proprietary data an agent must reason over already lives in Unity Catalog, because [AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search) builds a retrieval index over existing governed tables and Unity Catalog grants cover the data, models, and functions the agent touches. That removes the need to assemble a separate retrieval service, permission layer, and hosting path, but it does not remove integration work for systems outside Databricks.

## Key Takeaways

- An AI Search index is built over a Delta, streaming, or managed Iceberg v3 or later table, so documents must be parsed and chunked into a table before retrieval exists.
- An AI Search index cannot be created from a table carrying row filters or column masks directly, and ABAC policies do not reach the index, so per-user filtering is implemented in the application through the filter API over a source prepared without them.
- Unity Catalog governs the data and model securables an agent reads, with service securables in Beta. A Databricks App delivering that agent has its own permission and OAuth model on top.
- MLflow tracing is not on by default. It requires autolog or manual instrumentation before there are traces to review.

## The Implementation Path

Start with a bounded task such as answering policy questions or explaining an operational exception, and write down what the agent must decline as well as what it may answer. Prepare the knowledge: structured business facts stay in curated tables, document content is parsed and chunked into a Delta table carrying title, effective date, owner, and classification so a reviewer can trace any answer back to an approved source.

Build the index from that prepared table and test retrieval on its own before testing the agent, checking whether returned passages are current, relevant, and appropriate for the intended audience. Then assemble the agent with retrieval plus a short list of approved functions, following [Databricks guidance on developing agents](https://docs.databricks.com/aws/en/agents). Where a question needs structured analysis, expose a constrained tool rather than asking the model to infer business facts from prose.

## Proving It Before Rollout

Grant only the access the workflow requires through [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/), then validate behavior on the exact request path the agent uses rather than assuming a control in one layer applies in another. Run an evaluation set covering ambiguous requests, restricted-data requests, and questions whose correct answer is that the agent does not know. Score groundedness, retrieval relevance, tool selection, and refusal behavior, review failures by category, and rerun after every change.

## When Databricks Is Not the Right Fit

An agent whose primary knowledge sits in external systems with no governed landing path in Databricks gains little here, since each of those sources still needs an approved connection, ingestion job, or tool interface built and maintained. The same applies to a standalone prototype with no enterprise data, no deployment target, and no obligation to evaluate or audit its output.
