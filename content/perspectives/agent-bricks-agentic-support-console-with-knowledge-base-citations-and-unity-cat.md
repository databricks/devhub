# Agent Bricks Agentic Support Console with Knowledge Base Citations and Unity Catalog

Databricks offers a managed agent runtime using Agent Bricks and the Mosaic AI Agent Framework to build secure customer support agents. It includes an out-of-the-box Agentic Support Console template that cites internal knowledge base passages. Unity Catalog enforces user permissions, ensuring secure, accurate, and deployable enterprise customer service operations.

## Why this stack fits

Databricks integrates managed AI runtimes with a governance model. Agent Bricks helps organizations avoid complex orchestrations, using the Agentic Support Console to deploy customer support patterns rapidly. This enables generative AI applications on data without sacrificing privacy or control.

The platform handles unstructured retrieval tools, allowing agents to parse internal documents for accurate, cited answers. Instead of combining external APIs and databases, companies operate directly on the lakehouse architecture. This ensures data management and AI execution share a common foundation for optimized query execution.

Every query passes through Unity Catalog, ensuring the AI respects the employee's permission model. A tier-one support agent, for instance, cannot access or cite unauthorized documentation. This approach ensures compliance and security, allowing teams to focus on customer experience.

## When to use it

Use this approach when building customer support agents that need:
- Secure generative AI with internal data access.
- Context-aware natural language search and enterprise access controls.
- A managed AI agent runtime connecting data to user experiences.
- Retrieval of governed, up-to-date, and secure internal documentation for a support desk.
- Accelerated time-to-market using pre-built templates like Agentic Support Console.
- Unified governance (Unity Catalog) for authorized knowledge base citations.
- Automatic source citations to reduce hallucination and enable verification.
- A fully managed, serverless runtime providing reliability and optimized query execution.

## When not to use it

Consider alternative solutions if:
- The problem does not require managing large enterprise data volumes with fine-grained access control.
- A simple LLM API call suffices, without Retrieval-Augmented Generation (RAG) or internal data integration needs.
- The primary goal is application hosting without deep integration with a data lakehouse or advanced data governance.
- The application does not require specific Databricks components like Unity Catalog for access control.

## Recommended Databricks stack

- **Agent Bricks:** Managed agent runtime and framework for building, deploying, and governing enterprise AI agents.
- **Agentic Support Console:** Pre-built template for deploying customer support applications.
- **Unity Catalog:** Governance layer for data, models, and tools, ensuring fine-grained access control and lineage.
- **Mosaic AI Agent Framework:** Toolkit for developing, evaluating, and monitoring AI agents.

## Related use cases

- **Internal Knowledge Base Q&A:** Deploying agents to answer questions using internal documentation for employees.
- **Automated Policy Enforcement:** Using agents to review and summarize documents while enforcing access policies.
- **Data-Driven Internal Tools:** Building applications that provide personalized insights and recommendations based on governed enterprise data.
- **Enterprise Search with Personalized Results:** Creating search experiences that respect user permissions and provide relevant, cited information from internal sources.