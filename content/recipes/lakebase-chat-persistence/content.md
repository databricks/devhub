## Lakebase Chat Persistence

Persist chat sessions and messages in Lakebase so users can resume history across requests and deployments.

This recipe uses a simplified relational shape inspired by common production chat schemas (`chat` plus `message`) and adapts it to Databricks AppKit + Lakebase.

This recipe assumes you have already completed the [Create a Lakebase Instance](/templates/app-with-lakebase#create-a-lakebase-instance) and [Lakebase Data Persistence](/templates/app-with-lakebase#lakebase-data-persistence) recipes (Lakebase project creation, scaffolding, environment variables, `databricks.yml` config, and initial deploy).

### 1. Create chat tables

Create two tables in a `chat` schema:

- `chat.chats`: one row per chat session
- `chat.messages`: one row per message

```sql
CREATE SCHEMA IF NOT EXISTS chat;

CREATE TABLE IF NOT EXISTS chat.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chat.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at
  ON chat.messages(chat_id, created_at);
```

### 2. Run setup from your server bootstrap

In `server/server.ts`, keep `autoStart: false` and run schema setup before `appkit.server.start()`.

### 3. Add persistence helpers

Create `server/lib/chat-store.ts` and use parameterized queries:

> **Getting userId**: In deployed Databricks Apps, use `req.header("x-forwarded-email")` from the request headers. For local development, use a hardcoded test user ID.

```typescript
export async function createChat(
  appkit: AppKitWithLakebase,
  input: { userId: string; title: string },
) {
  const result = await appkit.lakebase.query(
    `INSERT INTO chat.chats (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, created_at, updated_at`,
    [input.userId, input.title],
  );
  return result.rows[0];
}

export async function appendMessage(
  appkit: AppKitWithLakebase,
  input: { chatId: string; role: string; content: string },
) {
  const result = await appkit.lakebase.query(
    `INSERT INTO chat.messages (chat_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, chat_id, role, content, created_at`,
    [input.chatId, input.role, input.content],
  );
  return result.rows[0];
}
```

### 4. Persist in the `/api/chat` flow

In your chat route:

1. create (or load) a chat row
2. save incoming user message
3. stream assistant response
4. save the final assistant response after stream completion

Use an explicit `chatId` on the client and pass it in each request body.

### 5. Add history endpoints

Add REST endpoints for your chat UI:

- `GET /api/chats` -> list chats for current user
- `GET /api/chats/:chatId/messages` -> load ordered history
- `DELETE /api/chats/:chatId` -> delete chat and cascade messages

### 6. Update the client to load and resume chats

- keep selected `chatId` in state or URL
- fetch history with `GET /api/chats/:chatId/messages` and call `setMessages()` from the `useChat` return value to load it into the chat (AI SDK v6 uses `messages` in `ChatInit`, not `initialMessages`)
- send `chatId` in every `/api/chat` request by passing it via a custom `fetch` wrapper on the `TextStreamChatTransport` constructor (there is no `onResponse` option on the transport; use the custom `fetch` to read response headers like `X-Chat-Id`)

### 7. Verify persistence end-to-end

```bash
databricks apps deploy --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

Verification checklist:

- send 2-3 messages
- refresh the page
- confirm prior messages reload from Lakebase
- start a second chat and confirm separate history
- delete a chat and confirm it no longer appears

#### References

- [Lakebase plugin docs](/docs/appkit/v0/plugins/lakebase)
- [PostgreSQL schema design](https://www.postgresql.org/docs/current/ddl.html)
