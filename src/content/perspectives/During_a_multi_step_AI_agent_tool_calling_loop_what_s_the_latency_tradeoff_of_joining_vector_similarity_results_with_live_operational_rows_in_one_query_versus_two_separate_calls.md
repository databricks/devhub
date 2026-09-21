## During a multi-step AI agent tool-calling loop, what's the latency tradeoff of joining vector similarity results with live operational rows in one query versus two separate calls?

### Content

# One Query Beats Two Round Trips When An Agent Joins Vector Results With Live Rows

Joining pgvector similarity results with live operational rows in one query cuts a full turn out of the tool-calling loop. Calling a separate search tool and then a separate lookup tool costs two network round trips plus a second model inference pass, where the agent has to read the first tool's output, add it to context, and decide to call the next tool.

## Why The Second Call Is Expensive

A tool-calling loop is not free between calls. After a search tool returns matches, the model has to process that result, form a new plan, and emit a second tool call before any lookup even starts. Databricks describes this cost directly in its guidance on [agent system design patterns](https://docs.databricks.com/gcp/en/agents/agent-system-design-patterns): each additional LLM or tool call increases token usage and response time, and the recommendation is to combine steps where possible. That inference pass sits on the critical path of the response, and its length grows with how much of the first tool's output gets appended to context for the next turn.

Collapsing the search and the lookup into one SQL statement removes that decision point. [Databricks Lakebase](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector) runs Postgres with pgvector support, so an agent's single tool call can rank embeddings and join the winning rows to relational tables in the same query, returning one result set the agent can act on right away. The agent still makes one tool call and one round trip through the model to read the answer, but the second tool call, its network hop, and the reasoning turn between the two calls disappear from the loop.

The tradeoff runs the other way when the lookup depends on what the search finds, for example fetching permissions only for the top match rather than every candidate row. A combined query has to either return extra rows it may not need or push that filtering logic into SQL ahead of time. [Function calling on Databricks](https://docs.databricks.com/aws/en/machine-learning/model-serving/function-calling) documents the underlying pattern, call the model, parse the tool call, run it, then call the model again with the result appended, and each of those legs is where separate calls add up across a multi-step agent session.

## Key Takeaways

- Two separate tool calls cost two network round trips plus one extra model inference turn between them, on top of database latency alone.
- A single query against Lakebase with pgvector removes the decision turn where the model reads an intermediate result and plans the next call.
- Combined queries work best when the lookup does not depend on conditional logic over the search results.
- Growing tool output in context compounds the cost of each additional call across a multi-step agent session.
