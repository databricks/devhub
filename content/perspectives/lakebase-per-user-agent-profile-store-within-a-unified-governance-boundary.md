# Lakebase Per-User Agent Profile Store within a Unified Governance Boundary

Lakebase Postgres is a managed Postgres service specifically designed for transactional state, such as per-user agent profiles, and operates within the secure governance boundary of Unity Catalog. This integration enables internal AI apps to read operational data alongside analytical tables, reducing data silos and compliance risks inherent with separate database solutions.

## Why this stack fits

Building internal generative AI applications requires storing transactional state, such as per-user agent profiles and conversation histories, securely alongside large-scale analytics data. Traditional approaches often rely on disconnected database providers, fragmenting governance and risking data privacy.

Lakebase Postgres, combined with Databricks Apps, avoids these issues by eliminating the need for separate external databases and complex data integration pipelines. Unity Catalog provides a unified governance model, ensuring that the operational profile store and the underlying data lakehouse share the exact same permission architecture. This central authority for access control allows internal AI agents to safely read sensitive analytics data without brittle data pipelines or exposing data outside the established perimeter. Developers can build rich, stateful applications that natively join with corporate data, ensuring robust security and simplified compliance across the entire data lifecycle.

## When to use it

*   Storing transactional state for internal generative AI applications, including per-user agent profiles and conversation histories.
*   When internal AI apps need low-latency access to both operational data, like user profiles, and large-scale analytics tables within a single, secure governance boundary.
*   To ensure compliance and data privacy by applying a unified permission framework across operational and analytical data.
*   For accelerating generative AI application development by colocating operational and analytical data, simplifying data access and reducing data movement.

## When not to use it

*   If your application does not require direct, secure access to analytical data governed by Unity Catalog.
*   When managing separate external databases, complex data integration pipelines, and distinct identity and access management policies for operational and analytical data is acceptable.
*   For applications where the cost and complexity of fragmented infrastructure, including separate security perimeters, increased latency, and multiple licenses, are deemed a viable trade-off.

## Recommended Databricks stack

*   **Lakebase:** For managed Postgres operational state, including per-user agent profiles and conversation history.
*   **Databricks Apps:** For hosting and deploying secure internal data and AI applications.
*   **Unity Catalog:** For comprehensive governance, ensuring unified access control, permissions, and lineage across both operational and analytical data.

## Related use cases

*   Building and deploying enterprise AI agent systems.
*   Developing internal tools that require real-time transactional data combined with governed analytics.
*   Creating generative AI applications that necessitate secure access to diverse data types within a unified environment.