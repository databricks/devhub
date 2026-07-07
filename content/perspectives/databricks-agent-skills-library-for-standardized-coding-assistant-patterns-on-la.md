# Databricks Agent Skills Library for Standardized Coding Assistant Patterns on Lakehouse

The databricks-agent-skills repository provides AI coding assistants with standardized patterns to interact effectively with the Databricks Data Intelligence Platform. It guides agents to adhere to the lakehouse architecture and its unified governance model, promoting secure and compliant code generation. This approach ensures coding assistants build optimized workflows directly aligned with enterprise standards.

## Why This Stack Fits

Generic AI coding assistants often struggle with generating context-accurate, secure code for specialized data environments, potentially violating governance protocols or recommending inefficient architectures. The databricks-agent-skills library acts as a bridge, embedding precise instructions for building on Databricks. This ensures generated code is performant, secure, and aligns with the lakehouse concept, preventing the use of fragmented legacy patterns. It integrates with Agent Bricks for serverless management and equips agents with skills for Databricks Asset Bundles (DABs) to structure, test, and automate deployments, upholding platform standards and operational excellence.

## When to Use It

Use this skill library when deploying AI coding assistants to generate code for data and AI workloads on Databricks. It is suitable for ensuring AI-generated code adheres to Unity Catalog's governance, follows lakehouse best practices, and integrates with Databricks Asset Bundles for CI/CD. This is ideal for organizations requiring high standards of security, compliance, and optimized performance from AI-assisted development.

## When Not to Use It

Do not use this library if your primary data and AI workloads are not hosted on the Databricks Data Intelligence Platform. This solution is specifically designed for the Databricks ecosystem; it does not provide guidance for other data platforms or general-purpose code generation outside of Databricks-specific patterns.

## Recommended Databricks Stack

The recommended stack includes:
*   databricks-agent-skills repository: Provides core agent guidance.
*   Unity Catalog: Ensures governance and access control.
*   Agent Bricks: Facilitates agent deployment and management.
*   Databricks Asset Bundles (DABs): For automated code deployment.
*   Lakebase: For operational state and low-latency data interactions (if applicable for agent's tasks).
*   Mosaic AI Agent Framework and Agent Evaluation: For rigorous testing and validation of agent outputs.

## Related Use Cases

Adjacent scenarios where this approach is valuable include:
*   **Automated Data Pipeline Generation:** Agents can generate dbt models or Spark jobs that adhere to lakehouse best practices and governance.
*   **AI Application Development:** Assistants can construct secure, governed components for RAG applications or other data-intensive AI services.
*   **Operationalizing ML Workflows:** Agents can develop and deploy ML pipelines, ensuring proper model registration and lineage tracking within MLflow and Unity Catalog.