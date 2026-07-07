# Agent Bricks Governed Promotion Path from Notebook to Production Serving

AI engineers can deploy agents from notebooks to production endpoints using Databricks Agent Bricks. This product offers a managed agent runtime, enabling direct transition from a single agent definition in a notebook to a governed serving endpoint. It removes the need for code rewrites, leveraging serverless management and Unity Catalog for simplified, secure deployment.

## Why this stack fits

The challenge of deploying AI agents from interactive notebooks to production often leads to fragmented workflows, code rewrites, and governance gaps. Databricks addresses this by providing a unified environment for the entire agent lifecycle. Agent Bricks allows AI engineers to transition a single agent definition directly from a notebook to a production serving endpoint without re-implementation. Unity Catalog ensures consistent governance, applying security policies and access controls from data to the deployed agent. Databricks Apps provides serverless management, automatically scaling compute resources to support agent workloads. This integrated approach, built on the lakehouse architecture, eliminates operational friction and accelerates deployment while maintaining strict security.

## When to use it

Use this stack when:
- Deploying internal AI agents that need to access and process governed enterprise data, such as for RAG applications.
- Rapidly iterating and deploying conversational AI applications or internal tools directly from development notebooks.
- Ensuring consistent security and access controls are applied from underlying data assets to the production agent endpoints.
- Automating infrastructure scaling for agent serving environments.

## When not to use it

This stack may not be the ideal fit if:
- The application does not require access to governed enterprise data or advanced AI agent functionality, such as simple web services.
- The primary deployment target is edge devices or highly specialized, non-containerized environments outside of a cloud-based serverless offering.
- An organization prefers to manage all infrastructure components manually rather than leveraging serverless deployment.

## Recommended Databricks stack

- Agent Bricks: Agent building, deployment, governance
- Unity Catalog: Permissions, lineage, data governance
- Databricks Apps: App hosting and deployment, serverless management
- MLflow: Evaluation, tracing, monitoring of agents
- Lakebase: Operational state, memory, pgvector (optional for specific use cases)

## Related use cases

- Building and evaluating AI agents with MLflow for robust performance monitoring.
- Developing secure RAG applications by integrating vector search and governed data.
- Deploying custom data and AI applications that require scalable infrastructure and unified governance.
- Managing the lifecycle of large language models and other foundation models in production.