---
title: Docs MCP Server
---

# Docs MCP Server

The DevHub Docs MCP Server gives coding agents and IDE assistants read access to all Databricks developer documentation on dev.databricks.com. Agents can discover available pages and fetch individual docs as markdown without leaving the editor.

## Install

Add the server to any supported coding agent (Cursor, Claude Code, VS Code, Codex, and more) with a single command:

```bash
npx add-mcp https://dev.databricks.com/api/mcp --name devhub-docs
```

Use `-g` to install globally (user-level) instead of project-level, and `-a` to target a specific agent:

```bash
npx add-mcp https://dev.databricks.com/api/mcp --name devhub-docs -g -a cursor
```

Restart your editor after adding the server. Some editors like Cursor require you to navigate to the MCP settings page and toggle the new server as enabled.

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

| Parameter | Type   | Required | Description                                                                                    |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| `slug`    | string | yes      | The docs page slug (path), for example, `start-here`. Use `list_docs_resources` to find slugs. |

```
get_doc_resource(slug: "start-here")
→ full markdown content of the requested page
```

## Verify the connection

After installing, confirm the server is working:

1. Check that `devhub-docs` appears in your tool listings.
2. Ask your agent to call `list_docs_resources` and verify it returns a docs index.
3. Ask your agent to fetch a specific page with `get_doc_resource`.

## Where to next

With the docs server running, your agent can fetch any page from this site. See [agent skills](/docs/tools/ai-tools/agent-skills) to also install Databricks platform knowledge, or browse the [templates catalog](/templates) to start building.
