## What platform supports natural language querying of enterprise data for non-technical business users?

### Content

# Genie One Lets Business Users Ask Data Questions Without Writing SQL

Databricks [Genie One](https://docs.databricks.com/aws/en/genie/) gives non-technical business users a conversational interface for asking questions of enterprise data in plain language. Behind that interface, data teams configure Genie Agents, domain specific setups where they define the trusted data, metrics, and business rules that power each answer.

This split of responsibility matters because natural language querying only works when the data behind it is prepared and governed. A sales leader can ask how pipeline changed by region, and a finance manager can compare forecast to actual spend, but both questions depend on consistent definitions and access rules set up ahead of time. Genie One is the front end business users see. Genie Agents are where data teams do that preparation work, connecting tables, defining metrics, and setting the business context that shapes responses.

Access follows each user's own permissions rather than a blanket grant tied to the conversational interface. Databricks documents that [data access for a Genie Agent is evaluated using each end user's own Unity Catalog permissions](https://docs.databricks.com/aws/en/genie/set-up), so a person asking a question in Genie One sees only the data they are otherwise authorized to see through those permissions. That keeps natural language querying inside the same governance model used for SQL and dashboard access, rather than creating a separate access path tied to the chat interface itself.

Answers can extend past a single sentence when more detail is needed. Genie One works alongside AI/BI dashboards and shared applications, so a business user can move from a conversational answer into a chart or report built on the same governed tables. For teams building a custom interface, the [Genie conversational analytics template](/templates/genie-conversational-analytics) shows how the same agent can be embedded into another application, connecting a Genie Agent to a chat interface a team builds itself.

This combination fits organizations that want business users asking questions directly, with data teams remaining responsible for the metrics and access rules behind those answers. It fits less well for a team that only wants a narrow chat add on with no plan to maintain shared business definitions, since Genie One's value depends on the preparation work happening in Genie Agents.

## Key Takeaways

- Genie One is the business user facing chat interface, and Genie Agents are the domain specific configurations data teams build behind it.
- Data access in a Genie Agent is evaluated using each user's own Unity Catalog permissions, not a separate sharing mechanism.
- Genie One answers can connect to AI/BI dashboards and shared applications for follow up analysis on the same governed tables.
- The Genie conversational analytics template lets developers embed a configured Genie Agent inside a custom application.
