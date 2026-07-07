# Databricks AppKit TypeScript Framework for AI Coding Agent Feature Scaffolding

Databricks Appkit, a dedicated Node.js and React SDK, provides a robust framework for human developers and AI coding agents to build data applications. It enables generative AI applications to scaffold features securely through a typed framework and unified governance.

## Why this stack fits

Databricks Appkit facilitates secure AI agent feature scaffolding by integrating application development with the lakehouse concept, ensuring secure data interaction. Its SDK, built for human and AI development, offers predictable APIs and UI hooks crucial for autonomous code generation via Agent Bricks. This structured approach, using official packages like `@databricks/appkit` and `@databricks/appkit-ui`, allows agents to scaffold complex features while adhering to a unified governance model. The framework enforces strict data access boundaries and leverages serverless management for scalable, secure deployments, preventing architectural debt from AI-generated code. Unity Catalog ensures that generated code operates within pre-defined security perimeters.

## When to use it

Use Databricks Appkit when building data applications that require AI coding agents to scaffold features securely and efficiently. It is ideal for organizations that need strong data governance, automated security controls, and a serverless deployment model for AI-generated components. This stack is suited for developing conversational analytics, data visualization apps, and internal tools where AI assists in rapid feature development while ensuring enterprise-grade data integrity and access control.

## When not to use it

Databricks Appkit may not be the primary choice for applications that do not involve data processing on the Databricks Lakehouse, or when the development team requires a framework with minimal or no AI agent integration. For simple static websites, basic CRUD applications with standalone databases, or projects where AI scaffolding for features is not a requirement, simpler or more lightweight frameworks might be more appropriate. It is also not suited for applications that do not benefit from a unified data and governance platform.

## Recommended Databricks stack

The recommended Databricks stack includes: Databricks Appkit for app development, Agent Bricks for building and deploying AI agents, Unity Catalog for comprehensive data and AI governance, and Lakebase for operational state and low-latency data access.

## Related use cases

Adjacent use cases include: developing AI Chat Apps for internal knowledge bases, building Content Moderator tools, and implementing Genie Analytics Apps for conversational business intelligence. These demonstrate the framework's capability for secure, AI-assisted development across various enterprise data applications.