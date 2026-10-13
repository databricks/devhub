---
title: Agent memory and sessions
sidebar_label: Memory and sessions
description: "Give an agent conversation history and long-term memory with managed stores: sessions hold one conversation, memory holds facts it recalls later, and memory pipelines distill one into the other."
sourceOfTruth:
  docs:
    - https://docs.databricks.com/aws/en/agents/custom-agents/stateful-agents
    - https://docs.databricks.com/aws/en/agents/agent-memory/memory-pipelines
    - https://github.com/databricks/databricks-ai-bridge/blob/main/integrations/agentbricks/README.md#memory-and-sessions
  note: "No agent skill covers managed memory, sessions, or memory pipelines yet. Product behavior and limits are owned by the canonical docs. CLI, AgentKit SDK, adapter, and REST details are verified against the databricks-agentbricks source and a live workspace. Memory pipeline commands need databricks-agentbricks 0.5.0+."
---

# Agent memory and sessions

:::note[Beta]

Managed agent memory and sessions are in [Beta](https://docs.databricks.com/aws/en/release-notes/release-types). APIs and behavior can change.

:::

Databricks gives agents two managed stores, both backed by [Lakebase](/docs/lakebase/overview) and usable from any framework:

- **Sessions** hold one conversation: the ordered messages, tool calls, and results the agent replays to continue it.
- **Memory** holds durable facts, such as a user's preferences, that the agent recalls in later, separate conversations with a natural-language search.

## Overview

```mermaid
flowchart LR
    Sessions["Session store<br/>(one conversation's transcript)"] <-->|"read and append<br/>each turn"| Agent["Agent"]
    Agent <-->|"recall and save<br/>durable facts"| Memory["Memory store<br/>(facts across conversations)"]
    Sessions -.->|"read by"| Pipeline["Memory pipeline"]
    Pipeline -.->|"distills into"| Memory
```

A session grows within one conversation. When something in it is worth keeping, the agent or your app saves that fact to memory, which outlives the conversation. A [memory pipeline](#distill-memories-with-a-memory-pipeline) can also do this for you in the background, across all of a session store's conversations. The stores are independent, so deleting a session never deletes memory.

### What sessions and memories contain

|               | Session                                                                                                                                     | Memory entry                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Lives in      | A session store                                                                                                                             | A memory store                                                                                                                    |
| Identified by | `actor_id` (who it belongs to) and a `session_id`, which the service generates if you omit it                                               | `actor_id`, a filesystem-like `path` such as `/preferences/contact.md`, and an optional `session_id` recording where it came from |
| Holds         | An ordered list of items. Each item is an opaque JSON value, such as a message, tool call, or tool result, and never changes once appended. | A free-form `content` string and a short `description` that improves retrieval                                                    |

### How they're saved and retrieved

|          | Save                                                                                                                                              | Retrieve                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sessions | Append items as the conversation runs.                                                                                                            | Read the items back in order at the start of each turn to rebuild context.                                                                                                                                      |
| Memory   | Add an entry when the agent learns something durable, from a model tool or your app code, or let a memory pipeline distill entries from sessions. | **List** an actor's entries, optionally filtered by `path` prefix or `session_id`, or **search** them with a natural-language query. Search ranks entries by full-text relevance (BM25), not vector similarity. |

## Creating a new agent with memory and sessions

To create a new agent with memory and sessions, scaffold it with the [Agent Bricks CLI](/docs/agents/cli), which wires in both stores for you. `agentbricks init` declares a `<directory>-memory` and a `<directory>-session` store in `agent.toml`, and `agentbricks deploy` creates them and grants the app's service principal access. To use stores you already have, bind them before you deploy:

```bash
agentbricks memory bind support-agent-memory
agentbricks sessions bind support-agent-sessions
```

The generated `agent/agent.py` wires them in through the AgentKit adapters. `memory_tools(actor)` gives the model `remember` and `recall` tools with the actor fixed in code, so the model can't reach another actor's memory:

```python title="agent/agent.py" tab="LangGraph"
from databricks_agentkit.langgraph import checkpointer, memory_tools, thread_config

agent = create_agent(model=model, tools=[*memory_tools(actor)], checkpointer=checkpointer())
result = await agent.ainvoke(inputs, config=thread_config(session_id, actor))
```

```python title="agent/agent.py" tab="OpenAI Agents SDK"
from agents import Agent, Runner
from databricks_agentkit.openai import memory_tools, session_store

agent = Agent(name="Agent", model=model, tools=[*memory_tools(actor)])
result = Runner.run_streamed(agent, agent_input, session=session_store(session_id, actor))
```

Under `agentbricks dev`, sessions stay in the running process and memory is off. The stores are used only once you deploy.

Each request carries the conversation's `session_id` and an `actor` inside its `input` object. `actor` decides whose memory the agent uses; without it, memory is scoped to the one conversation. The scaffolded chat app sets `actor` to the signed-in user. When you call the agent from your own code, set it on your server from the verified user identity:

```bash
agentbricks --profile <profile> endpoint invoke agent-bricks-my-agent \
  --path /api/invocations \
  --json '{"id":"'"$(uuidgen)"'","input":{"session_id":"case-456","actor":"user-123","messages":[{"role":"user","content":"I prefer email."}]}}'
```

## Use the stores from any agent

For another framework, a backfill job, or an app in another language, call the stores directly with the AgentKit SDK (`pip install databricks-agentbricks`, Python 3.10+):

```python title="example.py"
from databricks.sdk import WorkspaceClient
from databricks_agentkit import AgentKitClient

agentkit = AgentKitClient(WorkspaceClient())

# Sessions: append each turn, then read the history back oldest first.
session_store = agentkit.session_stores.create("support-agent-sessions")
session = session_store.add(actor_id="user-123", session_id="case-456")
session.append_items([{"type": "message", "role": "user", "content": "I need help with my cluster."}])
history = [item.data for item in session.list_items(order_by="create_time asc")]

# Memory: save a durable fact, then recall it in a later conversation.
memory_store = agentkit.memory_stores.create("support-agent-memory")
memory_store.add(
    actor_id="user-123",
    path="/preferences/communication.md",
    content="Prefers email over phone.",
    description="Communication preferences",
)
results = memory_store.search(actor_id="user-123", query="communication preferences")
```

`list_items` returns newest first by default, so pass `order_by="create_time asc"` when you rebuild context. To let a model decide when to save and recall, wrap `add` and `search` as tools in your framework, binding `actor_id` in code.

Every operation is also a REST call under `/api/2.0/agents/session-stores` and `/api/2.0/agents/memory-stores`. When you create a store over REST, set its ID in the query string (`?session_store_id=<name>` or `?managed_memory_store_id=<name>`) so later paths can use the name. AppKit has no built-in integration, so call the REST API from your server code.

## Distill memories with a memory pipeline

A **memory pipeline** builds long-term memory from the conversations a session store already holds, so your agent doesn't need memory-writing tools. Each run reads every actor's new sessions, uses a model to extract durable facts, and writes them to the memory store under the same `actor_id`. It also merges overlapping entries and splits oversized ones, and that maintenance applies to every entry of an actor it processes, including entries your agent saved itself. The pipeline calls its model through [Unity Gateway](/docs/unity-gateway/overview) and runs as a serverless job.

To create a pipeline with the Agent Bricks CLI (`0.5.0+`), point it at both stores. `--instructions` steers what it keeps, as inline text or `@` and a file path:

```bash
agentbricks memory pipeline create \
  --session-store support-agent-sessions \
  --memory-store support-agent-memory \
  --instructions @instructions.md
```

The command prints the pipeline's resource name, `memory-pipelines/<pipeline-id>`. The pipeline uses a default model unless you pass `--model` with a [supported model](https://docs.databricks.com/aws/en/machine-learning/foundation-model-apis/supported-models). To run it about every 24 hours instead of only on demand, add `--trigger scheduled`. You can change the model, trigger, and instructions later with `agentbricks memory pipeline update`.

To distill the sessions now, start a run, then check its `state` with the Databricks CLI:

```bash
agentbricks --profile <profile> memory pipeline run <pipeline-id>
databricks --profile <profile> api get /api/2.0/agents/memory-pipelines/<pipeline-id>/runs/<run-id>
```

`run` prints the run's resource name, `memory-pipelines/<pipeline-id>/runs/<run-id>`. When the run reaches `SUCCEEDED`, the agent recalls the new entries with the same list and search calls as any other memory. Only one run of a pipeline can be in progress at a time.

A pipeline runs as the identity that created it, so that identity needs access to both stores and permission to query the model. Each pair of session store and memory store can have one pipeline. For run states, the REST API, and limits, see [Agent memory pipelines](https://docs.databricks.com/aws/en/agents/agent-memory/memory-pipelines).

## Partition by actor, secure by store

Every memory search and list is scoped to one `actor_id`, so setting it to the signed-in user gives each user private memory. `actor_id` separates data but isn't access control: any principal that can reach a store can read every actor's entries.

- Set `actor_id` in trusted code from the verified user identity. Never let the model or the end user choose it.
- For strict isolation between tenants, use a separate store per tenant.
- A deployed agent runs as its app's service principal, not as you, so that principal needs access to each store. `agentbricks deploy` grants it automatically. If you deploy another way, grant it yourself with the service principal's application ID: `memory_store.grant_permission("<application-id>")`, and the same on the session store.

## Where to next

- [Agent Bricks CLI](/docs/agents/cli) to scaffold and deploy an agent with both stores.
- [Lakebase Agent Memory](/templates/lakebase-agent-memory) template to keep an AppKit chat app's history in your own Lakebase database instead.
- [Managed agent memory](https://docs.databricks.com/aws/en/agents/agent-memory/managed-memory) and [managed agent sessions](https://docs.databricks.com/aws/en/agents/agent-memory/managed-sessions) for the full reference and limits.
- [Agent memory pipelines](https://docs.databricks.com/aws/en/agents/agent-memory/memory-pipelines) for pipeline run states, the REST API, and limits.
