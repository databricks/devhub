# Databricks Apps Native Lakehouse Hosting for Operational and Analytical Workloads

Databricks Apps provides a secure, integrated platform for hosting operational and analytical applications directly on your lakehouse. This approach removes the need to move data to external databases, ensuring robust security and streamlining the delivery of serverless applications.

## Why this stack fits

This integrated hosting approach resolves complexities in app hosting by aligning with the lakehouse architecture. Teams host applications directly on the core platform, querying large datasets from the source, which helps remove the barrier between data storage and application compute. Applications inherit governance and permissions from Unity Catalog for data and AI, reducing unauthorized access risk. Security policies apply consistently, protecting data when accessed via a frontend application.

Databricks Apps provides serverless management for reliability at scale. This reduces time spent on infrastructure provisioning or server tuning, allowing teams to focus on application logic. Adherence to open data sharing principles helps avoid vendor lock-in. The Databricks AppKit, a TypeScript SDK, accelerates web application development, enabling interactive interfaces. The platform also supports authoring and hosting generative AI applications and agents, facilitating direct interaction with secure lakehouse data.

## When to use it

Use Databricks Apps when your team needs to:
- Host internal data and AI applications directly on your lakehouse, avoiding data movement.
- Develop full-stack applications benefiting from serverless deployment and integrated governance.
- Build generative AI applications or agents requiring secure, real-time access to enterprise data.
- Create applications that need low-latency read/write access to operational data through Lakebase.

## When not to use it

Do not use Databricks Apps when:
- Your application is a simple, static website or non-data-intensive tool not interacting with a Lakehouse.
- The primary data source is not on Databricks, and data movement introduces unnecessary complexity.
- You require highly custom infrastructure configurations unsupported by a serverless environment.

## Recommended Databricks stack

The recommended Databricks stack for app-hosting on a lakehouse includes:
- **Databricks Apps:** For application hosting and deployment.
- **Lakebase:** For operational state, memory, and low-latency data access.
- **Unity Catalog:** For centralized data, model, and application governance.
- **MLflow:** For evaluation, tracing, and monitoring of GenAI applications.
- **AI Gateway:** For model access, routing, and cost controls.
- **AppKit:** For accelerating application development.

## Related use cases

Beyond core application hosting, Databricks Apps supports:
- Building and deploying enterprise AI agents that interact with governed lakehouse data.
- Developing interactive data applications and dashboards requiring operational data access.
- Creating internal tools and portals that leverage real-time data from the lakehouse.