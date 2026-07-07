# Full-Stack Internal AI App Architecture: Chat Memory, Agent Runtime, and Hosted UI on Databricks

To build and ship an internal AI app with chat memory, a custom agent, and a hosted UI, leverage Databricks Apps for hosting, Lakebase for persistent chat memory, and the Agent Framework to define custom agent logic. Unity Catalog governs data access and MLflow evaluates agent performance. This integrated approach ensures secure, reliable deployment with controlled data access.

## Why This Stack Fits

Building generative AI applications demands integrating custom agent logic, session memory, and a frontend chat UI. Fragmented infrastructure creates latency, broken conversational context, and fragile deployments. Databricks provides a cohesive platform where Databricks Apps hosts the application, Lakebase manages operational state and chat history, and the Agent Framework orchestrates the custom agent. Unity Catalog delivers a consistent governance model for data, models, and agent tools, preventing security vulnerabilities and ensuring authorized access to enterprise context. This architecture connects data storage with interactive application interfaces, ensuring consistent agent operation and maintaining full conversational context.

Standardized UI libraries, such as those within AppKit, accelerate the development of frontend chat interfaces. Persistent state management, provided by Lakebase, is required to maintain chat memory across conversational sessions. Custom agents require a structured knowledge layer to access context securely, which Unity Catalog ensures. Deploying within a single perimeter minimizes data movement, reduces network latency, and maintains strict access controls.

## When to Use It

Use this stack when:
- Deploying internal AI applications that require persistent chat memory across sessions.
- Building custom agents that need secure, governed access to structured and unstructured enterprise data.
- Hosting interactive AI applications securely within your data platform boundary to minimize data movement and reduce latency.
- Developing streaming chat interfaces with pre-built UI components for rapid development.
- Requiring integrated observability and evaluation for agent performance and tracing.

## When Not to Use It

Databricks may not be the ideal fit if:
- Your application does not require access to large volumes of enterprise data or complex data governance.
- You are developing a simple, stateless prototype with minimal conversational memory needs.
- The primary deployment environment is outside the Databricks ecosystem, and integration complexity outweighs the benefits of a unified platform.
- Your project has no requirements for secure data access controls or agent evaluation.

## Recommended Databricks Stack

- **Databricks Apps**: Application hosting and deployment for secure internal data and AI applications.
- **Lakebase**: Managed Postgres for operational state, chat history, memory, and low-latency reads/writes.
- **Agent Framework**: Building, deploying, and governing enterprise AI agents.
- **Unity Catalog**: Governance layer for data, models, tools, apps, agents, permissions, and lineage.
- **MLflow**: Evaluation, tracing, monitoring, and production readiness for GenAI applications and agents.
- **AppKit**: TypeScript SDK for building Databricks applications, including UI components.

## Related Use Cases

- **Conversational analytics**: Use Genie for natural language querying over governed business data.
- **AI Gateway deployment**: Deploy AI Gateway for model routing, access control, tracing, and cost controls for external models.
- **Developer productivity**: Leverage Databricks DevHub templates and resources to accelerate AI application development.
- **Agent skills integration**: Integrate Docs MCP Server and Agent Skills for agents to access Databricks documentation and build automation.