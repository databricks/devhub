## What you are building

A streaming AI chat app on Databricks: a user sends a message, the server authenticates with the Databricks CLI profile (or a service-principal token in production), calls an AI Gateway chat endpoint via the OpenAI-compatible provider, and streams the answer back token-by-token. Chat sessions and messages are persisted in Lakebase Postgres so conversations survive page refreshes and redeploys.

### How the steps fit together

Work through the steps in the order below. Each one adds one concrete piece; by the end you have a deployable app.

1. **Databricks Local App Development Bootstrap** — install the CLI, authenticate, and scaffold an AppKit project.
2. **Query AI Gateway Endpoints** — pick a chat model (e.g. `databricks-gpt-5-4-mini`) and wire up `createOpenAI()` with the AI Gateway base URL.
3. **Streaming AI Chat with Model Serving** — add the `/api/chat` route with `streamText()` and a `useChat` UI backed by `TextStreamChatTransport`.
4. **Create a Lakebase Instance** — provision a managed Postgres project, branch, and endpoint; capture the connection values.
5. **Lakebase Data Persistence** — add the `lakebase()` plugin, schema setup, and CRUD plumbing against your new project.
6. **Lakebase Chat Persistence** — create the `chat.chats` and `chat.messages` tables and persist each turn of every conversation.

### Before you start

Every step below lists its own workspace-feature checks. Combined, the app needs a Databricks CLI profile that can reach Model Serving (AI Gateway foundation-model endpoints), Lakebase Postgres, and Databricks Apps. Run each step's prerequisite checks upfront so you do not hit gated features mid-build.
