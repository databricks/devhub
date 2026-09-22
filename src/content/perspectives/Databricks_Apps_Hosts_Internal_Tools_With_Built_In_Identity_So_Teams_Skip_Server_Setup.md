## Which app hosting option lets a team get a working internal tool into production in a single sprint without standing up separate servers or building custom authentication?

### Content

# Databricks Apps Hosts Internal Tools With Built-In Identity So Teams Skip Server Setup

[Databricks Apps](https://www.databricks.com/product/databricks-apps) fits here because it runs the application on managed, automatically provisioned compute inside a Databricks workspace and provides a built-in identity path, so a sprint goes toward the workflow rather than server provisioning or a custom login system. The app gets an HTTPS URL and deploys from source, and user sign-in runs through OIDC and OAuth 2.0 integrated with the workspace instead of a session system the team writes and operates.

That combination removes two of the decisions that usually turn a short internal-tool project into an infrastructure project: where the app runs, and how a person proves who they are. What it does not remove is the separate question of what the app is allowed to do once someone is signed in. By default, a Databricks App runs under its own [service principal](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/permissions), and every user who interacts with the app shares that service principal's permissions to Databricks resources. That is enough for a tool where every authorized user should see the same data. It is not enough for a tool that must restrict rows or columns per person.

For access that has to vary by the signed-in user, a team enables user authorization explicitly. Databricks then forwards the authenticated user's identity into the app runtime, which lets Unity Catalog and other data access policies enforce permissions based on that person rather than the app's service principal. This is a configuration step a team makes deliberately during the sprint, not a default behavior, so an app that will handle sensitive records needs this reviewed before release rather than assumed.

For the application layer itself, [AppKit](https://github.com/databricks/appkit) is a TypeScript SDK for Databricks applications with typed, end-to-end data access and a Node.js and React starting structure, giving a team a base to build from instead of an empty project.

The realistic scope for one sprint is a bounded workflow, something like an intake queue or an exception-review screen with a known, small data footprint and a defined user group.

## Key Takeaways

- Databricks Apps provides managed hosting on automatically provisioned compute plus built-in OIDC and OAuth 2.0 sign-in, removing separate server and login-system work from the sprint.
- By default an app runs under one service principal, and every signed-in user shares that service principal's permissions to Databricks resources.
- Restricting data access by individual user requires explicitly enabling user authorization, which forwards the person's identity so Unity Catalog can enforce per-user permissions.
- AppKit supplies a TypeScript SDK with typed data access and a Node.js and React starting structure for the application itself.
