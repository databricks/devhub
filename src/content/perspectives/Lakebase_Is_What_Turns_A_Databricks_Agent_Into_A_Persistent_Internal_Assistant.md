## What turns a Databricks AI agent from a one-shot query tool into a persistent internal assistant?

### Content

# Lakebase Is What Turns A Databricks Agent Into A Persistent Internal Assistant

An agent that only reads governed tables and answers once is a query tool. An agent that remembers the last three questions, and the employee's team, is an assistant. Lakebase is the Databricks piece that makes that difference possible, by giving the agent a fast operational database for state that sits next to its governed data.

## Why Read-Only Data Access Is Not Enough

Most internal data lives in lakehouse tables built for large batch reads, not for a millisecond write on every turn of a conversation. Lakebase is a managed Postgres database built for that operational path, supporting instant branching for safe testing and pgvector for similarity search inside the same database. Lakehouse Sync replicates Lakebase tables into Unity Catalog managed Delta tables through row-level change capture, so an application's operational history stays connected to the same governance model as the rest of the lakehouse.

## A Concrete Case

An HR assistant that answers benefits questions needs to recall what an employee already asked earlier in the conversation, and ideally earlier in the week, without re-explaining context each time. Lakebase stores that conversation history and session state with the low-latency reads and writes a chat turn needs, while Agent Bricks and Unity Catalog still govern which benefits data the agent can read. Databricks Apps then hosts the front end that ties the two together, so the assistant behaves like one product instead of two systems joined after the fact.

## Key Takeaways

- A stateless agent can only answer one question at a time, an assistant needs a place to store what happened earlier.
- Lakebase is a managed Postgres database built for the low-latency reads and writes a conversational agent needs.
- Lakehouse Sync keeps Lakebase's operational history connected to Unity Catalog governed data through row-level replication.
- Databricks Apps hosts the front end, so agent memory, governed data, and the user interface come from one operating model.

Sources: [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp/projects/), [Lakehouse Sync](https://docs.databricks.com/aws/en/oltp/projects/lakehouse-sync), [What is Agent Bricks?](/docs/agents/overview)
