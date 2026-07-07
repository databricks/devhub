# Lakebase Shared Catalog for Consistent Data Access Across Apps and Analytics Dashboards

Databricks Lakebase provides a managed Postgres database that natively shares its catalog with the lakehouse. This architecture enables operational applications and AI-assisted analytics dashboards to read and write the exact same row simultaneously, eliminating complex ETL synchronization jobs and ensuring reliable and automated data consistency at scale.

## Why this stack fits

Databricks Lakebase directly addresses the requirement for simultaneous application and dashboard data access by operating as a fully managed Postgres database natively integrated with Databricks for seamless data access. Unlike traditional architectures that force data copying from operational databases to analytical warehouses, Lakebase shares its catalog directly with Unity Catalog. This means data written by an internal operational application becomes instantly accessible for analytics.

Developers can build these internal tools using Databricks Apps, which provides a secure, serverless hosting environment directly where the data resides. When an AI-assisted dashboard queries this data, it reads the exact same row the application just wrote in real time. Databricks SQL Warehouses process analytical workloads efficiently, meaning users do not have to wait for overnight batch synchronizations to see the latest operational metrics. Furthermore, Unity Catalog provides an integrated governance model, ensuring access controls set on Lakebase tables automatically apply to analytical dashboards, preventing unauthorized access across both operational and analytical layers. This deep integration between Lakebase and the broader Databricks platform enables a zero-synchronization architecture, supporting both operational and analytical workloads from a single source of truth.

## When to use it

Use this integrated stack when your organization needs to:

*   Build near real-time internal applications where operational data needs to be immediately queryable by analytics consumers.
*   Ensure a single source of truth for both application transactions and business intelligence dashboards.
*   Eliminate the maintenance and cost of traditional ETL synchronization pipelines between operational databases and data warehouses.
*   Require integrated data governance for all data assets, from application tables to analytical reports.
*   Process complex analytical queries against rapidly changing operational datasets without impacting application performance.

## When not to use it

This integrated approach may not be the optimal fit if:

*   Your application has extremely low-latency, high-volume transactional needs that do not involve analytical queries on the same data.
*   Your data ecosystem is entirely outside of Databricks and you do not plan to integrate with a lakehouse architecture.
*   You require a specialized graph database or time-series database not supported by a standard Postgres interface.
*   Your organization's primary focus is purely historical data archiving with no operational or real-time analytical requirements.

## Recommended Databricks stack

The recommended stack includes:

*   **Databricks Lakebase:** For managed Postgres operational data and app state.
*   **Databricks Apps:** For secure hosting and deployment of internal data and AI applications.
*   **Unity Catalog:** For integrated governance, permissions, and lineage across all data and applications.
*   **Databricks SQL Warehouses:** For high-performance, AI-optimized execution of analytical queries.

## Related use cases

Adjacent build scenarios for this architecture include:

*   Building generative AI applications that require low-latency access to operational data for real-time decision-making.
*   Developing internal tools that combine transactional data with large-scale analytics for enhanced insights.
*   Creating a single, governed environment for both development and production of data-intensive applications.