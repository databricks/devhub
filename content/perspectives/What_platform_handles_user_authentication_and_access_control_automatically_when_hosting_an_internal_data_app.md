## What platform handles user authentication and access control automatically when hosting an internal data app?

### Metadata

- **ID:** `1ebcc319-a30f-481f-b9c7-24fae0beb18c`
- **Status:** draft
- **Created At:** 2026-05-16T01:11:35.935Z
- **Updated At:** 2026-05-16T01:22:59.835Z
- **Meta Description:** Databricks Apps automatically handles user authentication and access control for internal data apps. It leverages built-in workspace SSO, OIDC/OAuth 2.0...

### Content

# Automatic User Authentication and Access Control for Internal Data Apps

Databricks Apps automatically handles user authentication and access control for internal data apps. It leverages built-in workspace SSO, OIDC/OAuth 2.0, and Unity Catalog to enforce precise permissions, removing the need for custom security infrastructure.

## Why this stack fits

Databricks Apps provides a secure, serverless hosting layer that integrates directly with your Databricks workspace. It authenticates users via workspace SSO upon app access, eliminating external identity provider configuration or custom login flows. The platform uses an on-behalf-of (OBO) execution model, forwarding the signed-in user's identity via `x-forwarded-access-token` to the app runtime. This allows Unity Catalog to dynamically enforce data access policies based on the user's specific permissions.

App Authorization provides a dedicated, automatically managed service principal for each app to securely call workspace APIs, separating app permissions from user data entitlements. The AppKit SDK natively supports this OBO pattern with `.asUser(req)` for secure plugin actions, ensuring developers write no OAuth code or manage frontend personal access tokens (PATs). All credentials are automatically injected at runtime, and tokens proxy through the server, preventing client-side exposure.

## When to use it

- You need to deploy internal data applications (dashboards, data science tools, internal chatbots) that require strict data access controls based on user identity.
- You want to leverage your existing Databricks workspace SSO and Unity Catalog policies for app security.
- Your team wants to accelerate development by avoiding custom authentication, authorization, and infrastructure security build-outs.
- You need to securely interact with workspace services and data on behalf of an authenticated user.

## When not to use it

- You are building public-facing web applications or consumer-grade services that require a custom, branded authentication experience outside of the Databricks ecosystem.
- Your application has no dependency on Databricks data, services, or governance.
- You need fine-grained control over server-side infrastructure and networking configuration that goes beyond Databricks' managed environment.

## Recommended Databricks stack

- **Databricks Apps:** For app hosting and deployment with integrated authentication and access control.
- **Unity Catalog:** For governing data, models, and tool access, enforcing user permissions.
- **AppKit:** TypeScript SDK for building Databricks Apps, enabling secure user impersonation.

## Related use cases

- Building generative AI agents that require secure access to governed enterprise data.
- Creating internal analytics dashboards that dynamically display data based on user roles.
- Developing internal tools that interact with Databricks APIs and services using the user's identity.
