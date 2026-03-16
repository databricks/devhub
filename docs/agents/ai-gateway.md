---
title: AI Gateway
---

# AI Gateway

Use AI Gateway as the centralized control plane for LLM endpoint governance and monitoring.

## Why AI Gateway

- unify access across models and providers
- apply team-level rate limits and capacity controls
- track usage and cost with platform-native telemetry
- enforce governance policies before requests reach model endpoints

## Core capabilities

- endpoint configuration and routing
- usage tracking and cost analysis
- inference logging in Unity Catalog tables
- rate limits and policy controls
- coding-agent integrations

## Adoption pattern

1. Define gateway endpoints by workload type.
2. Move agent traffic behind gateway endpoints.
3. Enable usage tracking and payload/inference logging.
4. Add limits and policy gates for production.

## Verify the setup

- requests are routed through gateway endpoints (not direct model endpoints)
- usage and cost telemetry appears for the target traffic
- policy/rate-limit events are visible and explainable
- inference logs land in the expected Unity Catalog tables

## Source of truth

- [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway)
- [AI Gateway for serving endpoints](https://docs.databricks.com/aws/en/ai-gateway/overview-serving-endpoints)
