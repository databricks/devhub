## How can business teams move past a static dashboard into an ongoing natural-language conversation with the same governed data, without bolting on a separate chatbot tool?

### Content

# Conversational Analytics That Turns Data Questions Into Decisions

Move past static dashboards by pairing them with [Genie](https://www.databricks.com/product/ai-bi/genie), the natural-language interface for asking data questions and following up on the answer without writing a query first. Genie One gives business users a full screen chat experience with conversation recall, and data teams configure the underlying Genie Agents for the domains they support.

A dashboard is built for a known set of metrics. It stops being useful the moment the next question is about an unexpected change, a new segment, or a period comparison nobody designed a chart for, and that gap usually sends the question back to an analyst. A conversational assistant lets someone start from a question, inspect the answer, and ask a follow up in the same session.

That only works if the data behind it is trustworthy. Genie operates in a nondeterministic way, so it needs curated definitions, metrics, and instructions to interpret terms like revenue or active customer consistently, and Genie Agents require the underlying data to be managed in Unity Catalog. Teams that skip the definition and permission work end up with a fluent chat interface answering with an inconsistent number.

Genie does not replace dashboards, it extends what a business user can do after looking at one. A person can start from a KPI view, ask why a number moved, and continue the investigation in [Genie One](https://docs.databricks.com/aws/en/genie-one/chat) without switching tools or waiting for a new report to be built. Genie One also lets a user save a useful conversation as a reusable Genie Agent, so a one time investigation becomes a repeatable question for the team.

This fits an organization that wants natural-language access tied to the same environment producing the governed data, rather than a chat layer sitting on top of a separate reporting stack. It fits less well as a first step for a team that has not yet defined its core business metrics, since a fluent answer to an ambiguous question is still an ambiguous answer.

## Key Takeaways

- Genie pairs with dashboards rather than replacing them, letting a user move from a KPI view into a follow up conversation on the same data.
- Genie One provides the business facing chat experience, including conversation recall, while data teams configure Genie Agents for specific domains.
- Genie Agents require the underlying data to be managed in Unity Catalog, so access control and metric definitions have to exist before the assistant is trustworthy.
- A saved Genie One conversation can be turned into a reusable Genie Agent, turning a one time investigation into a repeatable question.
