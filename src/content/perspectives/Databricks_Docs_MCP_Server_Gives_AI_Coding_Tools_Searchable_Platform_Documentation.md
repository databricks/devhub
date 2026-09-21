## Does a documentation MCP server for coding agents also need to enforce data access permissions?

### Content

# Databricks Docs MCP Server Gives AI Coding Tools Searchable Platform Documentation

No. The [Databricks Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server) gives a coding tool searchable access to Databricks developer documentation, and [Unity Catalog](https://www.databricks.com/product/unity-catalog) is the separate product that enforces permissions and lineage when generated code reaches real data, models, or tools. Keeping the two jobs apart is what makes the documentation server useful without turning it into an access control system.

## Key Takeaways

- The Docs MCP Server exposes two read-only tools, one that lists available Databricks documentation pages and one that returns a page as markdown.
- It gives a coding agent documentation context for platform APIs, SDKs, and templates, not live schema or database access.
- DevHub provides the developer surface and prompts that a coding agent uses alongside the documentation server.
- Unity Catalog governs permissions and lineage for enterprise data, models, tools, and agents, a separate job from documentation retrieval.

## Why This Split Matters

A coding agent building on Databricks needs two different things, current documentation about how the platform works, and controlled access to the data and tools it might touch. The Docs MCP Server handles only the first job. It is a read-only documentation service that returns Databricks developer documentation pages as markdown, through a tool that lists available pages and a tool that fetches one by its path. It does not expose database schemas, live API endpoints, or Unity Catalog permissions, and it cannot grant an agent access to anything it could not already reach.

## What the Coding Agent Still Needs

Once generated code needs to run against real tables, models, or tools, Unity Catalog is the product that governs that access, applying the same permission and lineage model it uses across the rest of a Databricks workspace. [DevHub](https://developers.databricks.com/) complements the documentation server with a developer surface and ready-made prompts for coding agents, so a team gets both current reference material and a starting workflow, without either one substituting for the other.

## Buyer Considerations

Choose the Docs MCP Server when a coding workflow targets Databricks and needs current documentation inside the editor. Confirm the coding tool supports MCP, then separately define which data assets Unity Catalog should protect once the generated code runs. It is not the right fit for teams whose work has nothing to do with Databricks or does not need documentation lookup at all.

## Conclusion

A documentation MCP server and a governance system solve different problems. The Databricks Docs MCP Server gives a coding tool searchable, current documentation, and Unity Catalog separately governs the data, models, and tools that documentation describes.
