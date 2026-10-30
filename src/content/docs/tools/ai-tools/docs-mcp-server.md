---
title: Docs MCP Server
sourceOfTruth:
  docs:
    - /docs/tools/ai-tools/agent-skills
  note: "DevHub owns this server; its tools and slug handling follow src/lib/mcp-route.ts."
---

# Docs MCP Server

The DevHub Docs MCP Server gives coding agents and IDE assistants read access to the documentation and template pages on DevHub. Agents can discover available pages and fetch individual pages as markdown without leaving the editor.

## Install

Add the server to any supported coding agent (Codex, Claude Code, Cursor, VS Code, and more) with a single command.

Global install (user-level, available across all projects):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g
```

Project-level install (current directory only):

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs
```

To target a specific agent, add `-a`:

```bash
npx add-mcp __DEVHUB_SITE_URL__/api/mcp --name devhub-docs -g -a cursor
```

Restart your editor after adding the server. Some editors like Cursor require you to navigate to the MCP settings page and toggle the new server as enabled.

## Verify the connection

After installing, confirm the server is working:

1. Check that `devhub-docs` appears in your tool listings.
   - Example: "Do you have the devhub-docs mcp installed?"
2. Ask your agent to call `list_docs_resources` and verify it returns a docs index.
   - Example: "What are the available docs on devhub?"
3. Ask your agent to fetch a specific page with `get_doc_resource`.
   - Example: "What is the content of the start-here page?"

In practice, you don't need to think about calling the tools directly. Just ask your agent to do the work for you and it will call the tools internally.

## Tools reference

The server exposes two read-only tools.

### `list_docs_resources`

Lists the Databricks developer documentation and template pages. Returns the site index (`llms.txt`) as markdown, with each page's URL, title, and description, grouped by section.

No parameters.

```
list_docs_resources()
→ markdown index of pages with URLs, titles, and descriptions
```

### `get_doc_resource`

Fetches a single Databricks developer documentation or template page as markdown. Use `list_docs_resources` first to discover available pages.

| Parameter | Type   | Required | Description                                                                                                                                                                                     |
| --------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`    | string | yes      | The page path, for example `start-here`, `lakehouse/genie`, or `templates/genie-conversational-analytics`. A full URL from `list_docs_resources`, with or without a trailing `.md`, also works. |

```
get_doc_resource(slug: "start-here")
→ full markdown content of the requested page
```

Docs pages that declare a source of truth begin with a short **Source of truth** line. It names the agent skills (install them with `databricks aitools install`), related DevHub pages, and the canonical Databricks docs to load for the product's current behavior.

## Where to next

With the [Databricks CLI](/docs/tools/databricks-cli), [agent skills](/docs/tools/ai-tools/agent-skills), and Docs MCP Server all installed, your coding agent has everything it needs to build and deploy.

Ready to start building? Read about how [templates](/docs/templates) can help you quickly scaffold your project or jump right in and browse the [templates catalog](/templates).
