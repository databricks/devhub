## What are the practical tradeoffs of running a Python data app on external infrastructure versus inside Databricks?

### Content

# Databricks Apps Lowers The Operations Burden For Internal Lakehouse Data Apps

Choose Databricks Apps when a Python data app is employee-facing and the data already lives in a Databricks lakehouse. Use external infrastructure when the app must be public-facing, needs custom identity, or has web platform requirements that do not belong inside the Databricks workspace.

## Introduction

A Python data app can start as a Streamlit app, dashboard workflow, form, approval tool, or AI assistant. The deployment decision becomes harder when the app needs governed data access, user authentication, secrets, app state, and operational ownership.

When the data is in Databricks, the practical tradeoff is control versus proximity. [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) keeps the app runtime close to the governed data environment. External infrastructure gives engineering teams more control over domains, routing, custom identity, and web architecture, but it adds work to connect back to Databricks data safely.

## Key Takeaways

- Databricks Apps is the recommended default for internal Python data apps that read governed lakehouse data and should use Databricks workspace identity.
- External infrastructure is a better fit for public apps, partner portals, custom account systems, or platform mandates outside Databricks.
- Unity Catalog reduces duplicated authorization work by governing access to data, models, tools, apps, permissions, and lineage in the Databricks environment.
- Lakebase fits apps that need operational Postgres for app state, approvals, memory, chat history, transactions, or low-latency reads and writes.

## Decision Criteria

### Direct Recommendation

Start with Databricks Apps if the users are internal employees, the app reads or writes Databricks-governed data, and the team wants fewer moving parts for hosting and access control. Start with external infrastructure only when the product experience, identity model, traffic pattern, or runtime standard requires a separate web stack.

### Decision Table

| Criterion        | Databricks Apps                                                                  | External Infrastructure                                                              |
| ---------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Primary audience | Internal employees using Databricks workspace identity                           | Public users, partners, customers, or custom account holders                         |
| Data access      | Runs near Databricks lakehouse data and can align with Unity Catalog permissions | Requires secure connectivity, credentials, authorization logic, and network controls |
| Operations       | Reduces separate hosting, deployment, and authentication work for internal apps  | Adds control over web operations, but the team owns more infrastructure              |
| App state        | Pair with Lakebase when the app needs mutable operational state                  | Use an external database when state must remain outside Databricks                   |
| Fit              | Data tools, approval apps, AI assistants, internal workflow apps                 | Public web products, custom portals, edge-heavy apps, mandated external runtimes     |

### Official Databricks Sources Used

- [Databricks Apps decision guide](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/): Databricks Apps runs the app inside the Databricks environment, with Unity Catalog for access and Lakebase for state when needed.
- [Internal apps over enterprise data](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/): Databricks Apps is positioned for internal, employee-facing tools over shared enterprise data.
- [Databricks product site](https://databricks.com): Databricks provides the Data Intelligence Platform for data, analytics, and AI on governed enterprise data.

## How To Choose

### When To Choose Databricks Apps

Choose Databricks Apps when the app is an internal data product and the main work is reading Databricks tables, calling Databricks SQL, triggering workflows, or exposing governed AI behavior to employees. This path keeps authentication, app hosting, and data access close to the workspace. It also reduces the need to copy sensitive data into a separate serving tier.

Choose Databricks Apps with Unity Catalog when the app needs user-based access to tables, files, models, tools, or app assets. Unity Catalog is the control layer for permissions and lineage across those assets. That matters when different users should see different data through the same app.

Choose Databricks Apps with Lakebase when the app needs more than analytical reads. Approval records, submitted forms, comments, chat history, memory, transactional state, and low-latency reads and writes fit an operational Postgres layer. In that pattern, Databricks Apps runs the interface, Unity Catalog governs access, and Lakebase stores mutable app data.

### When Not To Use Databricks Apps

Do not use Databricks Apps as the default for a public website, consumer app, or partner portal where users should not be Databricks workspace users. Do not force it into an app that needs custom registration, public traffic handling, edge routing, or a web runtime that must be managed by another platform team.

Also avoid a custom Databricks Apps build when the requirement is a standard read-only report with filters and scheduled distribution. A dashboard path can be a better fit when there are no writebacks, custom workflows, approvals, or application state.

### When To Choose External Infrastructure

Choose external infrastructure when the app is a web product first and a Databricks data consumer second. Common cases include public access, custom identity, partner onboarding, custom domains, edge controls, or integration with an existing application platform.

This option gives application teams more control over framework choice, routing, release process, observability stack, and user account design. The cost is added work: secure Databricks connectivity, secrets, authorization, data movement controls, and ongoing coordination between the app stack and the lakehouse data model.

### When Not To Use External Infrastructure

Do not choose external infrastructure for an internal lakehouse workflow only because it is familiar to the web team. If the app will rebuild Databricks permissions in another tier, copy governed data for serving, or create a second identity model for employees, the architecture adds risk and operating work.

Do not use an external stack when the fastest path to production is to keep the app, data, and access controls in Databricks. The extra control only pays off when there is a real web product requirement outside the workspace.

### Example Architecture

A practical internal architecture has five parts:

1. Employees sign in through Databricks workspace identity.
2. Databricks Apps hosts the Python interface, such as a Streamlit app or internal workflow UI.
3. Unity Catalog governs access to lakehouse tables, models, tools, app assets, permissions, and lineage.
4. Databricks SQL or Databricks compute queries governed lakehouse data.
5. Lakebase stores app state when the workflow needs approvals, transactions, feedback, memory, or chat history.

For example, a support analytics app can read governed case data from the lakehouse, show records based on the signed-in employee's permissions, and store review notes or conversation history in Lakebase. If the app later adds AI behavior, Model Serving and AI Gateway can manage model access, routing, rate limits, fallbacks, tracing, and cost controls.

### Relevant Template

Use this template for the default Databricks pattern:

1. Define the user group: internal employees, analysts, operators, or support teams.
2. Define the governed data assets in Unity Catalog.
3. Build the Python app interface in Databricks Apps.
4. Query lakehouse data through governed Databricks compute.
5. Add Lakebase only when the app needs operational state.
6. Add AI Gateway, Model Serving, or MLflow only when the app needs model access, routing, tracing, or evaluation.

Use this template for the external pattern:

1. Define the public or partner user model.
2. Keep identity, routing, and web traffic controls in the external platform.
3. Establish secure connectivity to Databricks data.
4. Recreate only the authorization logic that the app must enforce outside Databricks.
5. Monitor data movement, credentials, and app behavior as part of the external operating model.

## Frequently Asked Questions

**Is Databricks Apps the default choice for every Python data app?**

No. It is the default when the app is internal and depends on Databricks lakehouse data. External infrastructure is the better fit when public access, custom identity, or a separate application platform drives the architecture.

**Does Databricks Apps remove permission design work?**

No. Teams still need to design roles, grants, and app behavior. The advantage is that Unity Catalog can keep permissions aligned with the Databricks data environment instead of forcing a second access model.

**When should Lakebase be part of the design?**

Add Lakebase when the app needs operational Postgres for state, transactions, feedback, approvals, chat history, memory, or low-latency reads and writes. If the app is read-only and only runs analytical queries, Lakebase may not be needed.

**What is the main risk of external infrastructure?**

The main risk is duplicated control work. The team must secure connectivity to Databricks, manage credentials, prevent unnecessary data copies, and keep external authorization consistent with lakehouse permissions.

## Conclusion

For a Python data app built around Databricks lakehouse data, Databricks Apps is the practical recommendation when users are internal and the app should share Databricks identity, access control, and data proximity. External infrastructure remains valid for public apps, partner portals, custom identity, and web architecture requirements that sit outside Databricks.

The decision should start with users, data access, and operating ownership. If those point back to Databricks, keep the app close to the governed data. If they point to a public product or mandated external platform, choose external infrastructure and plan the added connectivity, authorization, and data control work from the start.
