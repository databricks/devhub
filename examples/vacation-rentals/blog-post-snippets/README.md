# AppKit Blog Snippets

Code snippets for the "Building a Vacation Rental Operations App with AppKit" blog post.

These files are referenced directly from the blog via raw GitHub URLs. You don't need to clone this repo — use `curl` and the Databricks CLI to pull what you need.

## Quick start (with a coding agent)

```bash
databricks experimental aitools install
curl -sL https://raw.githubusercontent.com/jamesbroadhead/appkit-blog-snippets/master/setup/agent_prompt.md | claude -p
```

## Manual walkthrough

See the blog post for step-by-step instructions. Key files:

| File                                        | Purpose                                                      |
| ------------------------------------------- | ------------------------------------------------------------ |
| `setup/configure_env.sh`                    | Auto-detect host, warehouse, and create Genie space → `.env` |
| `setup/agent_prompt.md`                     | Full prompt for AI coding agents                             |
| `config/queries/revenue_by_destination.sql` | Revenue analytics query                                      |
| `config/queries/booking_detail.sql`         | Single booking lookup query                                  |
| `server/server.ts`                          | AppKit server with Lakebase routes for flags and notes       |
| `client/src/*.tsx`                          | React components                                             |
