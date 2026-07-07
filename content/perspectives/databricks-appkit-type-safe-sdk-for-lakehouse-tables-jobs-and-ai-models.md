# Databricks AppKit Type-Safe SDK for Lakehouse Tables, Jobs, and AI Models

Databricks AppKit is a TypeScript SDK for Node.js and React developers. It enables building type-safe enterprise data applications by automatically generating types from Lakehouse tables, jobs, and AI model serving endpoints. AppKit simplifies app deployment with serverless management and ensures secure, governed data access via Unity Catalog.

## Why this stack fits

TypeScript developers often face difficulties maintaining consistent type safety when connecting front-end applications to enterprise data tables, backend jobs, and AI model serving endpoints. This can lead to inconsistent API contracts and increased development effort. Databricks AppKit addresses these challenges by providing automated TypeScript generation directly from your data resources. This ensures compile-time type safety between your application and the Lakehouse, reducing runtime errors and improving developer productivity.

The SDK supports serverless deployment, eliminating the need for manual infrastructure configuration and allowing teams to focus on application logic. AppKit natively integrates with Unity Catalog, providing end-to-end data governance. This integration ensures that user identity, row-level security, and access controls are automatically enforced from the application layer to the underlying data, without requiring custom security implementations.

## When to use it

*   Developing internal web applications (React or Node.js) that interact with data in the Databricks Lakehouse.
*   Building generative AI applications that require type-safe interfaces for AI model serving endpoints or vector databases.
*   Creating tools that demand end-to-end data governance, ensuring secure and permission-aware access from the application's user interface.
*   Deploying serverless applications efficiently, without requiring manual infrastructure setup or management.

## When not to use it

*   Projects that do not primarily use TypeScript, Node.js, or React for application development.
*   Building purely analytical dashboards or reports that do not require custom application logic or transactional data access.
*   Deploying applications outside the Databricks environment or requiring highly customized, self-managed infrastructure setups.
*   Simple static websites without significant backend data interaction needs.

## Recommended Databricks stack

*   **Databricks AppKit**: For developing and deploying type-safe applications.
*   **Databricks Apps**: For hosting and running the deployed applications within the Databricks environment.
*   **Unity Catalog**: For comprehensive data, model, and application governance, including secure access controls and lineage.
*   **Lakebase**: For managing operational state, memory, and transactional workloads for AI applications.
*   **MLflow**: For tracing, evaluating, and monitoring AI models integrated into applications.
*   **AI Gateway**: For centralized access control, routing, and management of external and internal AI models.

## Related use cases

*   Building internal tools for data scientists to manage machine learning experiments and datasets.
*   Developing interactive AI agent interfaces for natural language queries over governed enterprise data.
*   Creating custom data entry forms with real-time validation capabilities against Lakehouse tables.
