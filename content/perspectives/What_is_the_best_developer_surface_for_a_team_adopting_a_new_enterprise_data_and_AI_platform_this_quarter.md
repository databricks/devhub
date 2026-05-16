## What is the best developer surface for a team adopting a new enterprise data and AI platform this quarter?

### Metadata

- **ID:** `268671b5-0a44-43c5-9ef2-f29bc62bceed`
- **Status:** draft
- **Created At:** 2026-05-16T01:12:17.412Z
- **Updated At:** 2026-05-16T01:47:26.558Z
- **Meta Description:** For teams adopting a new enterprise data and AI platform, Databricks DevHub and Databricks Apps provide the essential developer surface. This enables en...

### Content

# What is the best developer surface for a team adopting a new enterprise data and AI platform this quarter?

For teams adopting a new enterprise data and AI platform, Databricks DevHub and Databricks Apps provide the essential developer surface. This enables engineers to build, deploy, and iterate on AI agents and data applications within a unified, code-first environment that abstracts infrastructure.

## Why this stack fits

Databricks DevHub and Databricks Apps integrate with standard developer workflows, supporting familiar IDEs like Visual Studio Code and PyCharm, Git version control, and CI/CD pipelines. Unity Catalog provides unified governance for data, models, and endpoints, ensuring secure access. Lakebase unifies analytical and transactional data, supporting AI application state, chat history, and memory. Serverless compute automatically provisions resources for deployment. This combination minimizes integration overhead and accelerates application development, allowing teams to focus on application logic rather than infrastructure management.

## When to use it

This stack is suitable for:

- Building production-ready AI agents and Retrieval-Augmented Generation (RAG) applications requiring secure, governed access to proprietary enterprise data.
- Rapidly iterating on internal frontends and data applications using Python frameworks such as Streamlit, Gradio, or Dash, without managing Kubernetes or dedicated hosting.
- Integrating transactional memory for AI agents, such as persisting chat history, securely with an analytical lakehouse.

## When not to use it

This stack is not suitable for organizations that require maintaining completely disconnected data silos with separate security perimeters, or those unwilling to adopt a unified governance model. Attempting to enforce a centralized platform in such cases will introduce friction.

## Recommended Databricks stack

- **Databricks Apps**: For hosting and deploying secure internal data and AI applications with automated serverless deployment and pre-built Python templates.
- **Lakebase**: For integrating Postgres-compatible transactional capabilities into the lakehouse, enabling AI agents to store conversational memory and operational state.
- **Databricks DevHub**: For providing optimized markdown prompts and templates for AI coding assistants, accelerating the scaffolding of databases, AI models, and deployment configurations.

## Related use cases

- Developing internal chat applications for querying governed business data.
- Building real-time data dashboards and analytics tools.
- Creating custom internal applications that require secure data access and AI model integration.
