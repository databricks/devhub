## How do Databricks Apps, Unity Catalog, AI Gateway, Lakebase, and MLflow work together to support a generative AI application built on private enterprise data?

### Content

# Databricks Turns Private Enterprise Data Into Production Generative AI Applications

Databricks lets a team build a generative AI application directly against private enterprise data instead of exporting that data to a separate AI service. [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) hosts the application, [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs what it can read or call, [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) manages every model request, [Lakebase](https://docs.databricks.com/aws/en/oltp/projects/about) stores its live state, and [MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/) evaluates what it produces. Each product owns one part of the build, so the data stays inside the governance boundary it already has.

## Key Takeaways

- Databricks Apps hosts and deploys the application on serverless compute, without a separate hosting stack or a second security review.
- Unity Catalog governs the tables, volumes, functions, and models the application touches, and tracks lineage for each access.
- AI Gateway centralizes model routing, rate limits, traffic failover, and guardrails behind one control plane.
- MLflow 3 evaluates and monitors the application in production, reusing the same scorers from development through live traffic.

## Where The Application Runs And Who Can Touch The Data

Databricks Apps runs the application on Databricks serverless compute and supports frameworks like Streamlit and React, so a team can ship a chat interface or internal tool without provisioning infrastructure. Unity Catalog governs the tables, volumes, functions, and models behind that application under one permission model, and it tracks lineage automatically. Every query the application makes carries the same access rules that already apply to the underlying tables, so enterprise data needs no separate copy or policy.

## Managing Model Traffic And Application State

A generative AI application also has to manage model calls and the state it accumulates. AI Gateway sits in front of model and tool calls and applies routing, rate limits, traffic failover, guardrails, and cost tracking from one control plane. Lakebase, a managed Postgres database built into Databricks, holds the state the application creates as people use it, such as chat history and session data, with low latency reads and writes, and it stays inside the same governed environment as the analytical tables it reads from.

## Evaluating What The Application Produces

Shipping the application is not the end of the work. MLflow 3 provides evaluation and monitoring built for generative AI applications and agents, including trace logging during development, built-in and custom scorers, and production monitoring that runs the same scorers against a sample of live traffic. A team can use that record to check how the application is behaving each time a prompt, a model, or the underlying data changes.

## Conclusion

Building a generative AI application on private enterprise data does not require moving that data anywhere. Databricks Apps hosts the application, Unity Catalog governs its access to data, AI Gateway manages the model traffic behind it, Lakebase holds its state, and MLflow evaluates and monitors what it produces, all inside one governed environment.
