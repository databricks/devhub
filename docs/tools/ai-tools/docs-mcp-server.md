---
title: Docs MCP Server
---

# Docs MCP Server

The DevHub Docs MCP Server gives coding agents and IDE assistants read access to all Databricks developer documentation on dev.databricks.com. Agents can discover available pages and fetch individual docs as markdown without leaving the editor.

## Install

Add the server to Cursor with a single command:

```bash
cursor --add-mcp '{"name":"devhub-docs","type":"streamableHttp","url":"https://dev.databricks.com/api/mcp"}'
```

Or add it manually to `.cursor/mcp.json` (project-level) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "devhub-docs": {
      "type": "streamableHttp",
      "url": "https://dev.databricks.com/api/mcp"
    }
  }
}
```

For Claude Code, add the server via the CLI:

```bash
claude mcp add devhub-docs --transport http https://dev.databricks.com/api/mcp
```

Restart your editor after adding the server.

## Tools

The server exposes two read-only tools.

### `list_docs_resources`

Lists all available Databricks developer documentation pages. Returns the documentation index as markdown with page URLs and titles.

No parameters.

```
list_docs_resources()
→ markdown index of all doc pages with slugs and titles
```

### `get_doc_resource`

Fetches a single Databricks developer documentation page as markdown. Use `list_docs_resources` first to discover available slugs.

| Parameter | Type   | Required | Description                                                                                             |
| --------- | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `slug`    | string | yes      | The docs page slug (path), e.g. `get-started/getting-started`. Use `list_docs_resources` to find slugs. |

```
get_doc_resource(slug: "get-started/getting-started")
→ full markdown content of the requested page
```

## Verify the connection

After installing, confirm the server is working:

1. Check that `devhub-docs` appears in your tool listings.
2. Ask your agent to call `list_docs_resources` and verify it returns a docs index.
3. Ask your agent to fetch a specific page with `get_doc_resource`.

## Source of truth

- [Model Context Protocol (MCP) on Databricks](https://docs.databricks.com/aws/en/generative-ai/mcp)
- [Use Databricks managed MCP servers](https://docs.databricks.com/aws/en/generative-ai/mcp/managed-mcp)
