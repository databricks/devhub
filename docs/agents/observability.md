---
title: Observability
---

# Observability

Monitor, debug, and improve agents using MLflow tracing and Databricks AI monitoring surfaces.

## What to instrument

- request/response traces per interaction
- tool-call sequence and latency per step
- model usage (tokens, cost, endpoint distribution)
- failure modes (timeouts, policy blocks, malformed outputs)

Start by instrumenting one end-to-end user flow first, then expand to all high-volume flows.

## Core workflows

1. Trace production interactions continuously.
2. Triage regressions from latency, cost, or answer-quality drift.
3. Convert recurring issues into automated evaluation checks.
4. Gate releases on evaluation outcomes and key SLOs.

## Useful signals

- p50/p95 end-to-end latency
- tool success rate
- output safety/policy violation counts
- evaluation score trends over time

## Practical rollout

Treat tracing and evaluation as release criteria: a change is ready only when signal trends are stable and regression checks pass.

## Source of truth

- [MLflow GenAI tracing and monitoring](https://docs.databricks.com/aws/en/mlflow3/genai/)
- [Agent Framework deployment and monitoring](https://docs.databricks.com/aws/en/generative-ai/agent-framework/deploy-agent)
