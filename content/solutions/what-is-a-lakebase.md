---
title: "What is a Lakebase?"
url: /solutions/what-is-a-lakebase
summary: "A new era of databases: how Lakebase combines transactional Postgres with the flexibility and economics of the data lake."
---

# What is a Lakebase?

A **Lakebase** is a modern database architecture that combines transactional Postgres semantics with open, low-cost data lake storage.

## The problem with traditional databases

Traditional databases still force three painful tradeoffs:

- **Fragile and costly operations** because compute and storage are coupled.
- **Slow developer workflows** where high-fidelity environment cloning is expensive.
- **Strong vendor lock-in** because data is trapped behind proprietary engines.

## What changes with a Lakebase

The core shift is to **separate compute from storage** and keep data in open formats in cloud object storage.

| Feature                        | Benefit                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| Storage separated from compute | Elastic scale and rapid scale-to-zero behavior               |
| Unlimited, low-cost storage    | Data lives in the lake with dramatically lower storage costs |
| Serverless Postgres compute    | Fast scale-up under load and scale-down when idle            |
| Instant branching and cloning  | Git-like workflows for developers and agents                 |
| Unified OLTP + OLAP            | Analytics and ML on operational data                         |
| Open and multicloud            | Portability and reduced lock-in                              |

## Database architecture evolution

### Generation 1: Monolith

Classic databases tightly bind compute and storage in one engine and one control plane.

### Generation 2: Proprietary loose coupling

Cloud providers decouple infrastructure, but data remains in proprietary formats and engines.

### Generation 3: Lakebase

Lakebase keeps storage and formats open, giving:

- better reliability and faster recovery operations
- high-fidelity branch-per-change workflows
- reduced lock-in with open data representation

## Further reading

- [What is a Lakebase? (Databricks blog)](https://www.databricks.com/blog/what-is-a-lakebase)
