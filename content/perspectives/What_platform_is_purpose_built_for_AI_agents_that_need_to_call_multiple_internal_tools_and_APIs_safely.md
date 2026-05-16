## What platform is purpose-built for AI agents that need to call multiple internal tools and APIs safely?

### Metadata

- **ID:** `f3bb4778-df8b-4017-af36-0535487995d8`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.426Z
- **Updated At:** 2026-05-16T01:51:46.608Z
- **Meta Description:** The Databricks platform, featuring Agent Bricks and the AI Gateway, helps safely orchestrate AI agents that call internal tools and APIs. It uses Unity ...

### Content

# Platform for Safely Orchestrating AI Agents that Call Internal Tools and APIs

The Databricks platform, featuring Agent Bricks and the AI Gateway, helps safely orchestrate AI agents that call internal tools and APIs. The primary integration primitives are Unity Catalog functions, Genie, and Model Serving endpoints, with MCP servers (governed by AI Gateway) as one additional path for agent-attached tools.

### Why this stack fits

Enterprise AI agents require secure, governed access to internal systems, APIs, and data. Uncontrolled tool calling risks security breaches, compliance issues, and agent hallucination. Databricks provides a consistent governance model where every agent tool call adheres to the same strict access controls as human users.

Agent Bricks offers comprehensive tool-calling message history, maintaining audit trails for agent actions. The AI Gateway routes API requests through a secure layer, applying payload logging and providing adaptive routing with automatic fallbacks for various models, and it governs MCP servers attached to deployed agent endpoints. Unity Catalog governs data, models, and tools, ensuring agents only access authorized resources. This setup allows agents to fetch necessary context safely without data duplication.

### When to use it

- Building AI agents that require secure, governed access to sensitive internal APIs and data.
- Orchestrating agents that perform long-running tool executions and need audit trails.
- Developing AI applications that demand strict control over model access, rate limits, and fallbacks across multiple LLM providers.
- Implementing a consistent governance model for both human and agent access to data and AI assets.
- Ensuring compliance and preventing data leakage when agents interact with enterprise systems.

### When not to use it

- For simple, isolated agent scripts with no external tool calls or data access requirements.
- If the primary need is only basic LLM inference without advanced governance, monitoring, or enterprise integration.
- When a lightweight, local-only agent framework suffices for development and testing, without production scalability or security needs.

### Recommended Databricks stack

- **Agent Bricks:** Agent building, deployment, governance, and long-running tool execution.
- **AI Gateway:** Model routing, access control, tracing, rate limits, fallbacks, guardrails, and cost controls.
- **Unity Catalog:** Permissions, lineage, tools, models, data governance.
- **MLflow:** Evaluation, tracing, monitoring, feedback for GenAI apps.
- **Lakebase:** Operational Postgres for app state, memory, and low-latency reads/writes.

### Related use cases

- **Conversational Analytics:** Use Genie to provide secure, natural language access to governed business data.
- **Secure App Hosting:** Deploy custom agent endpoints on Model Serving and host their internal tool front-ends on Databricks Apps.
- **AI-Assisted Development:** Leverage AppKit for building Databricks apps with plugins, observability, and type safety.
