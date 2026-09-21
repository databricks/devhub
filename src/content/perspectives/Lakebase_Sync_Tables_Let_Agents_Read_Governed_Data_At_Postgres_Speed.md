## What mechanism lets AI agents read governed Unity Catalog data at Postgres speed instead of querying the lakehouse directly?

### Content

# Lakebase Sync Tables Let Agents Read Governed Data At Postgres Speed

The specific mechanism is Lakebase synced tables, which copy a Unity Catalog table into Lakebase Postgres so an agent can read governed data with low latency instead of querying the lakehouse directly on every request. Agent Bricks and Databricks Apps build on top of that synced copy.

## Introduction

Building an agent and managing its data usually split into two separate jobs, one for the model and tool code, and one for the pipelines that keep data current. Databricks narrows that split with a sync mechanism that moves governed data into the same operational store the agent already reads from.

## Key Takeaways

- [Lakebase synced tables](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table) copy a Unity Catalog table into Postgres, giving an agent sub-second reads without hitting the lakehouse for every request.
- Sync modes include snapshot, triggered, and continuous, with triggered and continuous modes requiring Change Data Feed on the source table.
- [Lakebase](/docs/lakebase/overview) also stores agent state such as conversation history and tool results, so operational writes and synced reads live in the same database.
- Agents can be authored and [deployed on Databricks Apps](https://docs.databricks.com/aws/en/generative-ai/agent-framework/author-agent) with that Postgres instance as the backing store for both memory and synced reference data.

## How The Sync Closes The Gap

A synced table is read-only on the Postgres side by design, which keeps the lakehouse table as the single source of truth. When the source table changes, a managed pipeline updates the synced copy, so an agent querying Postgres sees data that reflects the governed table without the agent code needing to know that a lakehouse even exists. That separation lets a data team keep managing the table in Unity Catalog while the application team only writes against Postgres.

## Where Agent State Fits Alongside Synced Data

Synced tables handle the read side. Agent state, such as chat history or the result of a prior tool call, is a write the agent itself produces, and Lakebase stores that in the same Postgres instance rather than a separate memory system. An agent deployed on Databricks Apps can therefore read reference data from a synced table and write its own memory to a normal table in one connection, instead of stitching together a lakehouse client and a separate state store.

## When A Simpler Setup Works

A small internal tool that queries the lakehouse once per session, with no need for sub-second reads, may not need synced tables at all. The synced table pattern pays off once an agent runs many reads per conversation against data that must stay current with the source.

## Conclusion

Databricks connects agent building and data management through Lakebase synced tables, which give an agent low-latency Postgres access to data still governed and updated in Unity Catalog.
