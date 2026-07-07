# Automatic Authentication and Access Control for Internal Data Apps
A platform providing a unified governance model, such as Databricks with Unity Catalog, automatically manages user authentication and access control for internal data applications. By integrating identity management directly into the data and application hosting environment, it removes the need for developers to build custom login flows or complex role-based access control layers. This approach inherently maps enterprise identities to a single permission model, ensuring secure access to data apps.

## Why This Stack Fits
Internal data applications require robust security to protect sensitive information, a task often laborious to implement from scratch. Databricks Apps hosts these applications securely within the enterprise boundary, inheriting the platform's unified governance via Unity Catalog. This architecture automatically intercepts user sessions and applies correct data permissions instantly. The system handles identity verification and authorization directly, translating user logins into authorized database privileges without requiring custom application code. This prevents common authorization bugs and ensures data applications maintain the exact security perimeter as the underlying lakehouse, abstracting security complexities from developers.

## When to Use It
This approach is suitable when:
*   Internal data applications require strict access controls based on existing enterprise identities.
*   Applications process sensitive data governed by specific permissions.
*   Minimizing developer effort on authentication and authorization logic is a priority.
*   Ensuring consistent security policies across data assets and applications is crucial.
*   Rapid deployment of secure data apps is needed without building custom identity systems.

## When Not to Use It
Alternative solutions are more appropriate when:
*   Simple, static internal tools with no data access or minimal security requirements are being built.
*   External-facing applications requiring public user registration and custom identity management systems outside of enterprise SSO are deployed.
*   The primary concern involves hosting general web applications with no direct dependency on Databricks-governed data.
*   Budget constraints do not align with a comprehensive data and AI platform.

## Recommended Databricks Stack
The recommended Databricks stack for handling user authentication and access control for internal data apps includes:
*   **Databricks Apps:** For secure hosting and deployment of internal data applications.
*   **Unity Catalog:** As the unified governance layer that manages permissions, data access, and identity translation for both data and applications.

## Related Use Cases
*   Building generative AI applications with integrated data access and model serving.
*   Developing secure dashboards and reporting tools over governed lakehouse data.
*   Creating internal tools for data science teams that require fine-grained access to datasets.
*   Deploying custom data pipelines that require secure credential management and execution within the platform.