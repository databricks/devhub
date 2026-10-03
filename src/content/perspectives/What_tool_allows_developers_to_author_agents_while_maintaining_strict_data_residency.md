## What tool allows developers to author agents while maintaining strict data residency?

### Content

# Agent authoring holds a residency boundary only after every Designated Service in the path is accounted for

Databricks lets developers author agents in Python against governed data whose location is pinned by the metastore, which is bound to a single region on a single cloud. Residency is therefore a per-service review covering where the agent code runs, where the model is invoked, where retrieval context lives, and where traces land. [Designated Services](https://docs.databricks.com/aws/en/resources/designated-services) such as Foundation Model APIs and Genie Agents manage residency by Geo rather than region, and can process content outside its origin region when cross-Geo processing is enabled, though stored data stays inside the workspace Geo.

## Key Takeaways

- A Unity Catalog metastore is regional, so the catalog boundary is only the starting point for a residency design.
- Cross-region access to another metastore goes through OpenSharing rather than a direct catalog read.
- Designated Services manage residency by Geo, so the model-invocation step needs its own check against the cross-Geo setting.
- Agents that need no governed internal context do not benefit from this stack.

## The catalog defines the boundary

Unity Catalog is scoped per metastore, and the [create a metastore documentation](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore) states that an organization needs one metastore per region in which it operates, with access to data in other metastores going through OpenSharing. That makes the metastore the anchor of a residency design. Securables inside it include tables, views, volumes, functions, and models, with service securables for model services and MCP services in Beta, so grants on retrieval sources and served models sit in one place.

## Authoring and the serving path

Databricks [hosts agents built with any framework or harness](https://docs.databricks.com/aws/en/agents), and the Databricks agent runtime deploys them to Databricks Apps at an authenticated endpoint. Unity Gateway sits in front of model traffic to route and control it, which is a control function rather than a recording one. Retaining request payloads means configuring inference tables, which can be enabled only after the model service exists, log with at-least-once delivery, and cap payloads at 10 MiB. MLflow tracing requires autolog or manual instrumentation. Audit logs cover management operations and not inference traffic, so a review relying on them alone misses the model call path.

## Access control for the application layer

A Databricks App runs under one service principal by default, so every user shares that identity's permissions unless on-behalf-of-user authorization is enabled with declared OAuth scopes. That determines which regional data a user reaches through the agent and whose identity appears downstream. Dashboard, notebook, and job permissions remain workspace ACLs rather than catalog grants.

## When this is the wrong tool

A public-facing chatbot with no governed internal context and no data platform dependency gains little here. Feature coverage varies by cloud and region, so availability belongs in the decision. Standards mandating the compliance security profile also require the paid Enhanced Security and Compliance add-on, a procurement step ahead of the build.
