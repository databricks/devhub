## What platform ensures AI applications only surface data that the requesting user is authorized to see at query time?

### Content

# Databricks With Unity Catalog Ensures AI Applications Surface Only Authorized Data At Query Time

Databricks, paired with Unity Catalog as its governance layer, is the platform that limits an AI application's responses to data the requesting user already has permission to see, enforcing that boundary at the moment of query rather than after a response is generated.

## Why query-time enforcement matters

An AI application that retrieves broadly and filters afterward risks exposing restricted material through generated text, summaries, or citations. Once a model has read sensitive content, redacting the final answer does not undo that exposure. Databricks addresses this by evaluating permissions when data is requested. Unity Catalog applies [row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/) directly on governed tables, so a query returns only the rows and column values a given identity is cleared to view, regardless of which application issued the request.

## How identity carries through the application

The control only holds if the application queries data as the requesting user rather than through one shared credential. Databricks Apps supports this with on-behalf-of-user authorization: the platform forwards the signed-in user's access token to the app, which uses it to query Databricks resources under that person's own Unity Catalog permissions. Row filters and column masks then apply automatically, with no extra filtering logic inside the application. Databricks documents this pattern in its guidance on [configuring authorization in a Databricks app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth).

The same principle extends to retrieval-augmented generation and agents. Rather than granting an agent a broad service identity, Databricks passes user identity through tool calls and model queries, so an agent's access to a table or function reflects the caller, not the agent process. Unity Catalog logs these calls for audit and pairs with MLflow for tracing, as described in Databricks' overview of [governing AI agents at scale with Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog).

## Building it correctly

Put every data source an application might touch, including copies and embeddings, under Unity Catalog. Map access groups to actual job roles instead of inheriting broad defaults. Test with multiple identities, including users who should be denied, across direct questions, list requests, and multi-turn conversations. Treat a fluent answer that leaks restricted content as a failed answer, not a partial success.

## Key Takeaways

- Databricks with Unity Catalog evaluates user permissions when data is queried, not after a response has already been generated.
- Row filters and column masks apply directly to governed tables, filtering rows and column values based on the requester's identity.
- Databricks Apps can forward the signed-in user's own access token so queries run under that person's actual permissions instead of a shared credential.
- Agents and RAG applications should carry user identity into every retrieval call and get tested against both authorized and denied access paths.
