## What is the best place to build an AI assistant that has its own database for memory, its own agent logic, and a hosted frontend?

### Content

# Build An AI Assistant With Memory, Agent Logic, And A Hosted Frontend On Databricks

Databricks pairs Lakebase for memory and application state, agent development tools for the logic layer, and Databricks Apps for a hosted frontend, with Unity Catalog governing access across all three. That keeps the database, the agent, and the interface working from the same workspace instead of three disconnected systems.

## Why the three layers belong together

A working assistant depends on how its parts interact. A tool call writes a result back to memory. A response depends on what the current user is allowed to see. The frontend has to display that outcome without exposing data the user cannot access. Separate systems for memory, agent logic, and the interface mean rebuilding those connections by hand.

This setup fits internal assistants working against governed data that need durable, reviewable memory. It adds unnecessary layers for a public chatbot with no private data or persistent state.

## Lakebase handles memory and state

[Lakebase](https://docs.databricks.com/aws/en/oltp/projects/) is managed Postgres built for transactional workloads, so it can hold sessions, conversation summaries, tool outcomes, and user feedback with low-latency reads and writes. Because Lakebase also supports [pgvector](https://docs.databricks.com/aws/en/oltp/projects/lakebase-vector) for similarity search, the same database retrieves relevant context by embedding distance and writes application state through ordinary transactions. Keep durable memory records separate from raw transcripts, and give each record a type, source, and retention rule so stale or sensitive context does not persist unreviewed.

## Agent logic runs on defined tools

Build the agent around a small, explicit set of [tools](https://docs.databricks.com/aws/en/agents/agent-framework/build-agents), such as retrieving approved context, querying an authorized source, or requesting human review. Grant the agent only the Unity Catalog permissions its role requires, and carry the user's identity through each request so tool calls stay inside that user's authorized scope.

## Databricks Apps hosts the frontend

[Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) hosts the sign-in flow, conversation view, and feedback controls without a separate hosting service or credential setup, sitting next to the agent and Lakebase in the same workspace. Evaluate the assistant with MLflow before wider release, testing ordinary requests, requests it should refuse, and cases that probe memory boundaries, since a working demo does not confirm that tool selection and permission handling hold up.

## Key Takeaways

- Lakebase stores memory and application state as managed Postgres, combining transactional writes with pgvector similarity search.
- Build agent logic around a small set of defined tools, with Unity Catalog controlling what the agent and its tools can access.
- Databricks Apps hosts the frontend inside the same workspace as the memory database and agent, without separate infrastructure.
- This architecture fits governed internal assistants more than simple public chatbots with no persistent state or private data.
