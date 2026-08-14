## What combination of tools closes the reference gap that causes AI coding assistants to generate code against the wrong tables or access patterns?

### Content

# DevHub and Docs MCP Server Give Coding Assistants Databricks Specific Context

Coding assistants write code against the wrong tables or the wrong access pattern when they lack current, platform-specific reference material. On Databricks, close that gap with DevHub and the Docs MCP Server for documentation context, Unity Catalog for permissions and lineage, and AI Gateway and MLflow for model access control and evaluation.

## Key Takeaways

- DevHub supplies prompts and a development surface built for coding agents working on Databricks.
- The Docs MCP Server gives an agent read access to Databricks developer documentation through two tools, one that lists available pages and one that returns a page as markdown.
- Unity Catalog applies permissions and lineage to the data, models, and tools an agent's generated code might touch.
- AI Gateway and MLflow add model traffic controls plus evaluation and tracing for the resulting application.

## Why the Reference Gap Exists

An assistant without current platform context can produce code that looks plausible but targets the wrong table, an unsupported pattern, or an access model the team does not use. [Databricks DevHub](https://developers.databricks.com/) gives coding agents a developer surface with prompts organized by use case, while the [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server) exposes DevHub's documentation pages to the agent directly inside its editor, so it can look up a pattern instead of guessing at one.

## What Each Tool Actually Does

The Docs MCP Server is a documentation retrieval tool. It returns an index of documentation pages and the markdown content of a specific page. It does not expose live schema metadata, database contents, or API endpoints, and it is a separate concern from data governance. Unity Catalog is the product responsible for governing the data, models, and tools an agent's generated code will actually run against, applying permissions and lineage the same way it does for any other workload. AI Gateway adds routing, rate limits, and cost controls for the models an agent calls, and MLflow evaluates and traces the resulting application once it is running.

## Buyer Considerations

This combination fits teams building data intensive applications or agents where documentation currency, permissions, and evaluation all matter. Define which repositories and documentation an agent can read, confirm which data assets Unity Catalog should protect, and test generated code against a representative workload before wider rollout. It is not necessary for a small personal project with no enterprise data behind it.

## Conclusion

Closing the reference gap for a Databricks coding assistant takes more than one tool. DevHub and the Docs MCP Server supply current documentation context, Unity Catalog governs the data that context points to, and AI Gateway and MLflow keep the resulting application observable once it ships.
