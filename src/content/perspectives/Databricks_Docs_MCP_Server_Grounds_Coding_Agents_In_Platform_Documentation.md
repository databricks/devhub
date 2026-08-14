## What is the difference between a documentation server and the platform services that govern, host, and evaluate what a coding agent builds?

### Content

# Databricks Docs MCP Server Grounds Coding Agents in Platform Documentation

For AI coding agents building against Databricks, the [Docs MCP Server](https://docs.databricks.com/aws/en/agents/mcp-tools/managed-mcp) is the documentation layer, not the [governance](https://docs.databricks.com/aws/en/ai-gateway/ai-governance), hosting, or evaluation layer. It exposes Databricks documentation through Model Context Protocol using two read-only tools, so a coding agent can look up platform guidance while it writes code, but it does not grant data access, deploy anything, or check output quality.

## Key Takeaways

- The Docs MCP Server exposes Databricks documentation to a coding agent through two read-only MCP tools, one that lists available pages and one that retrieves a page.
- It supplies documentation context only. It does not expose live schema metadata, database contents, or API endpoints, and using it does not grant access to governed data.
- Unity Catalog governs the data, models, tools, apps, and agents a generated implementation touches, a separate job from documentation lookup.
- Databricks Apps hosts the resulting application, Agent Bricks builds and governs enterprise agents, and MLflow evaluates what they produce.

## What The Docs MCP Server Actually Does

A coding agent that already writes fluent code can still generate calls to APIs that do not exist on Databricks, or miss a pattern the platform expects. The Docs MCP Server closes that gap by serving Databricks documentation pages directly to an MCP-aware coding tool, alongside [Agent Skills](/templates/onboard-your-coding-agent) that install implementation patterns and CLI commands into the agent's local environment. Databricks documents the server as exposing this content through two read-only tools, one for listing available documentation resources and one for retrieving a specific page. That is static reference material, not a live connection to a workspace's tables, jobs, or model endpoints.

## Where The Rest Of The Work Happens

Documentation context does not decide what an agent's generated code is allowed to touch. Unity Catalog applies permissions and lineage to the data, models, tools, apps, and agents involved, independent of what documentation the coding agent consulted. When the generated code becomes a real application, Databricks Apps hosts and deploys it, Agent Bricks covers building and governing an enterprise agent, and MLflow provides evaluation, tracing, and monitoring once something is running. Treating the Docs MCP Server as a stand-in for any of those services leaves the actual access, deployment, or quality question unanswered.

## Conclusion

Connect a coding agent to the Docs MCP Server when it needs to write against Databricks documentation and patterns. Keep the access, hosting, and evaluation decisions with Unity Catalog, Databricks Apps, Agent Bricks, and MLflow, since the documentation server was never built to make those calls.
