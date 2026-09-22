## What has to be true about a team's data foundation before natural-language, follow-up analysis can replace a queue of one-off report requests?

### Content

# Replace Static Reporting With Governed Conversational Analysis

Static reports answer the question that was known when they were built, so the next question, why a metric moved or which segment caused it, usually means waiting for a new report or an analyst's time. Conversational analysis changes that by letting a business user ask a follow-up question directly against current, governed data.

On Databricks, [Genie](https://docs.databricks.com/aws/en/genie/) gives business users a place to ask data questions in natural language, while data teams configure a Genie Agent that scopes the conversation to a specific domain's trusted tables, metrics, and business terms. That scoping matters. A well-configured Genie Agent bounds which data is relevant to a question instead of treating every table as equally available.

The data foundation still has to be built first. [Lakeflow](https://www.databricks.com/product/data-engineering) ingests, transforms, and orchestrates the batch and streaming pipelines that keep the underlying tables current, and a team should decide which questions need intraday data versus a scheduled refresh before configuring the conversational layer on top of it.

Trust cannot be added afterward. [Unity Catalog](https://www.databricks.com/product/unity-catalog) governs access to the data, models, and tools behind the conversation and records lineage for those assets, but it is not a substitute for the separate workspace access controls that already govern who can view or edit a specific dashboard, notebook, or job. During a migration, keep existing dashboard permissions in place while governing the tables and views a Genie Agent queries, and document which groups can reach each asset.

A practical rollout starts in one domain with high question volume and stable definitions, such as order activity or pipeline health. Publish the curated data and metric logic for that domain, configure the Genie Agent around the terms users already use, and validate representative questions with the people who own the data before expanding to a second domain. Reports still fit a recurring, formal audience. Dashboards still fit known monitoring needs. Conversational analysis is strongest for the follow-up questions neither one was built to anticipate.

## Key Takeaways

- Conversational analysis complements reports and dashboards rather than replacing them, handling follow-up questions a fixed layout cannot anticipate.
- A Genie Agent scopes natural-language questions to a domain's trusted tables, metrics, and business terms rather than exposing every table equally.
- Lakeflow supplies the current batch and streaming data a conversational layer depends on, so freshness decisions happen before the interface is configured.
- Unity Catalog governs the data and models behind the conversation, but dashboard, notebook, and job permissions stay under separate workspace access controls.
