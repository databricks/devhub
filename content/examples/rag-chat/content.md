## RAG Chat App

This example demonstrates a Retrieval-Augmented Generation chat app built on Databricks: a user question is embedded, similar documents are retrieved from a pgvector store in Lakebase Postgres, and the retrieved context is injected into a Model Serving call that streams the answer back. Conversations and sources are persisted per chat in Lakebase.

### Data Flow

All retrieval and chat state live in Lakebase Postgres; generation uses AI Gateway:

1. **Seeding** pulls a handful of Wikipedia articles on startup, chunks them by paragraph, embeds each chunk through the AI Gateway embeddings endpoint (`databricks-gte-large-en` by default), and writes rows into `rag.documents` with a `vector(1024)` column.
2. **User turns** are embedded with the same endpoint. The server runs a pgvector cosine-similarity search to retrieve the top-k matching chunks.
3. **Context injection**: the retrieved chunks are prepended as a system message before the user's conversation history is sent to the chat completion endpoint (`databricks-gpt-5-4-mini` by default) via AI Gateway.
4. **Streaming**: `streamText` streams tokens back to the client while an `onFinish` callback appends the assistant turn to Lakebase.
5. **Chat history**: every user and assistant turn is persisted in `chat.messages`, keyed by `chat_id`, so conversations can be resumed.

### Template Approach

Unlike the other examples, **this example is designed to be consumed via `databricks apps init`**, not `git clone`. The init flow:

- Prompts for the Lakebase Postgres branch and database resource names.
- Auto-resolves `PGHOST`, `PGDATABASE`, and `LAKEBASE_ENDPOINT` into your local `.env` by calling the Lakebase APIs.
- Writes `DATABRICKS_CONFIG_PROFILE` or `DATABRICKS_HOST` based on your Databricks CLI configuration.
- Drops you into a ready-to-run project directory named by `--name`.

This validates the [AppKit templates system](https://databricks.github.io/appkit/docs/development/templates) as a way to ship DevHub examples — see `appkit.plugins.json` and `.env.tmpl` in the template for how it works.

### What to Adapt

Setup and provisioning are documented in the repository's **`template/README.md`**.

To make this example your own:

- **Lakebase**: Point the bundle at your own Lakebase project, branch, and database (prompted at init time).
- **Model Serving endpoint**: Override `DATABRICKS_ENDPOINT` for a different chat model (e.g. `databricks-claude-sonnet-4`).
- **Embeddings endpoint**: Override `DATABRICKS_EMBEDDING_ENDPOINT` if you want a different embedding model. Make sure the `vector(N)` dimension in `server/lib/rag-store.ts` matches.
- **Seed data**: Replace the Wikipedia article list in `server/lib/seed-data.ts` with your own corpus. The chunking function splits on paragraph boundaries — adapt if your source has different structure.
- **Retrieval**: The default top-k is 5 and the similarity metric is cosine. Tune in `retrieveSimilar()`.
