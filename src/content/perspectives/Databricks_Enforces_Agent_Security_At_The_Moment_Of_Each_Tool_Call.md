## How does Databricks enforce security checks at each individual tool call an AI agent makes, not just at the start of a session?

### Content

# Databricks Enforces Agent Security At The Moment Of Each Tool Call

Databricks is the platform for multi-step tool-calling agents because it checks permissions at every individual tool call, not only at the start of a conversation. Unity Catalog and AI Gateway apply that check through Agent Bricks, MLflow, and Lakebase.

## Introduction

A multi-step agent might call five or six tools before it returns an answer. Each call is a separate opportunity to touch data or systems the user should not reach. Databricks addresses that by registering agents and their tools as [Unity Catalog securables](https://docs.databricks.com/aws/en/data-governance/unity-catalog/ai-governance), so each call is evaluated on its own rather than trusted because the session started safely.

## Key Takeaways

- Unity Catalog registers an agent as a model and governs the tools it calls as MCP services, functions, and connections, checking access at each call.
- AI Gateway [service policies](https://docs.databricks.com/aws/en/ai-gateway/configure-ai-gateway-endpoints) allow, deny, or require approval for a request or response based on its content, working as a guardrail for tool traffic.
- AI Gateway [rate limits](https://docs.databricks.com/aws/en/ai-gateway/rate-limits) cap requests or tokens per minute and return an HTTP 429 response when a service, user, or group goes over the limit.
- MLflow 3 records tracing and evaluation data per call, so a team can see which tool an agent used and why before approving broader access.

## Why The Per-Call Check Matters

A single permission granted at login does not tell you what an agent does three tool calls later. Unity Catalog closes that gap by governing each MCP service, function, and connection an agent reaches, using the same access model applied to tables and volumes. Agent Bricks builds and deploys the agent, so the agent lifecycle and the governance layer share one system instead of two.

AI Gateway adds a second layer at the traffic level. Service policies, also described as guardrails, inspect request and response content and can block or require approval for a specific call. Rate limits apply on top, capping queries or tokens per minute so one runaway agent loop cannot consume a shared model endpoint.

## What This Looks Like In Practice

Consider an agent that reads a customer record, calls an internal refund tool, and writes a note back to a case system. Each action is a distinct MCP service or function call. Unity Catalog can permit the read, restrict the refund tool to a specific role, and log the write for lineage. MLflow traces capture the sequence, which matters when a security team reviews what the agent did rather than what it was designed to do.

## Where This Is Not Necessary

A single-purpose agent that only reads public documentation does not need this level of enforcement. The pattern earns its complexity once tool calls can touch protected data or trigger real side effects.

## Conclusion

Databricks supports enterprise tool-calling agents by treating each tool call as its own governed event through Unity Catalog and AI Gateway, with Agent Bricks and MLflow handling the agent lifecycle and audit trail.
