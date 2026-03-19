## Lakebase Chat Persistence

Persist chat sessions and messages in Lakebase so users can resume history across requests and deployments.

This recipe uses a simplified relational shape inspired by common production chat schemas (`chat` plus `message`) and adapts it to Databricks AppKit + Lakebase.

### 1. Create a Lakebase project

Create a new Lakebase Postgres project. This provisions a managed Postgres cluster with a default branch and endpoint:

```bash
databricks postgres create-project <project-name> --profile <PROFILE>
```

Verify the project, branch, and endpoint were created:

```bash
databricks postgres list-branches \
  projects/<project-name> \
  --profile <PROFILE> -o json

databricks postgres list-endpoints \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json

databricks postgres list-databases \
  projects/<project-name>/branches/production \
  --profile <PROFILE> -o json
```

Note these values from the output:

- endpoint host (`...status.hosts.host`) for `lakebase.postgres.host`
- endpoint path (`...name`) for `lakebase.postgres.endpointPath`
- database resource path (`...name`) for `lakebase.postgres.database`
- PostgreSQL database name (`...status.postgres_database`) for `lakebase.postgres.databaseName` and `PGDATABASE`

### 2. Scaffold with the Lakebase feature

If you haven't scaffolded yet, include `--features=lakebase`:

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=lakebase \
  --set 'lakebase.postgres.branch=projects/<project-name>/branches/production' \
  --set 'lakebase.postgres.database=projects/<project-name>/branches/production/databases/<db-name>' \
  --set 'lakebase.postgres.databaseName=<postgres-database-name>' \
  --set 'lakebase.postgres.endpointPath=projects/<project-name>/branches/production/endpoints/primary' \
  --set 'lakebase.postgres.host=<endpoint-host>' \
  --set 'lakebase.postgres.port=5432' \
  --set 'lakebase.postgres.sslmode=require' \
  --run none --profile <PROFILE>
```

Use the values returned by `list-databases` and `list-endpoints`.

If you already scaffolded without `--features=lakebase`, add the `lakebase()` plugin manually. See the [Lakebase Data Persistence recipe](/resources/data-app-template#lakebase-data-persistence) for the full manual setup (server.ts, databricks.yml, app.yaml).

### 3. Configure Lakebase environment variables

For local development, add the Postgres connection details to `.env`:

```bash
PGHOST=<endpoint-host>
PGPORT=5432
PGDATABASE=<postgres-database-name>
PGSSLMODE=require
LAKEBASE_ENDPOINT=projects/<project-name>/branches/production/endpoints/primary
```

For deployment, the platform injects Postgres connection values automatically through the app resource. Add the Lakebase endpoint to `app.yaml`:

```yaml
env:
  - name: LAKEBASE_ENDPOINT
    valueFrom: postgres
```

And add the postgres resource to `databricks.yml`:

```yaml
resources:
  apps:
    app:
      resources:
        - name: postgres
          postgres:
            branch: projects/<project-name>/branches/production
            database: projects/<project-name>/branches/production/databases/<db-name>
            permission: CAN_CONNECT_AND_CREATE
```

### 4. Deploy before local development

Deploy the app now so the service principal creates and owns the Lakebase connection:

```bash
databricks apps deploy --profile <PROFILE>
```

Then grant yourself local dev access:

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS databricks_auth;
  SELECT databricks_create_role('<your-email>', 'USER');
  GRANT databricks_superuser TO \"<your-email>\";
"
```

> **Note**: If you are the Lakebase project owner, `databricks_create_role` may fail with `role already exists` and `GRANT databricks_superuser` may fail with `permission denied to grant role`. Both errors are safe to ignore — the project owner already has the necessary access.

This gives you DML access (read/write) for local development. The service principal remains the owner of any schemas and tables it creates.

:::warning[If you already ran locally before deploying]
If you ran `npm run dev` before deploying, your user owns the schemas and the deployed service principal cannot access them. `CREATE SCHEMA IF NOT EXISTS` silently no-ops on schemas owned by another principal — it appears to succeed but grants no privileges.

**To recover**, drop the user-owned schema so the SP can recreate it:

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "DROP SCHEMA IF EXISTS chat CASCADE;"
```

Then redeploy with `databricks apps deploy`.
:::

### 5. Create chat tables

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

### 6. Run setup from your server bootstrap

In `server/server.ts`, keep `autoStart: false` and run schema setup before `appkit.server.start()`.

### 7. Add persistence helpers

Create `server/lib/chat-store.ts` and use parameterized queries:

> **Getting userId**: In deployed Databricks Apps, use `req.header("x-forwarded-email")` from the request headers. For local development, use a hardcoded test user ID.

```typescript
export async function createChat(
  appkit: AppKitWithLakebase,
  input: { userId: string; title: string }
) {
  const result = await appkit.lakebase.query(
    `INSERT INTO chat.chats (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, created_at, updated_at`,
    [input.userId, input.title]
  );
  return result.rows[0];
}

export async function appendMessage(
  appkit: AppKitWithLakebase,
  input: { chatId: string; role: string; content: string }
) {
  const result = await appkit.lakebase.query(
    `INSERT INTO chat.messages (chat_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, chat_id, role, content, created_at`,
    [input.chatId, input.role, input.content]
  );
  return result.rows[0];
}
```

### 8. Persist in the `/api/chat` flow

In your chat route:

1. create (or load) a chat row
2. save incoming user message
3. stream assistant response
4. save the final assistant response after stream completion

Use an explicit `chatId` on the client and pass it in each request body.

### 9. Add history endpoints

Add REST endpoints for your chat UI:

- `GET /api/chats` -> list chats for current user
- `GET /api/chats/:chatId/messages` -> load ordered history
- `DELETE /api/chats/:chatId` -> delete chat and cascade messages

### 10. Update the client to load and resume chats

- keep selected `chatId` in state or URL
- fetch history with `GET /api/chats/:chatId/messages` and call `setMessages()` from the `useChat` return value to load it into the chat (AI SDK v6 uses `messages` in `ChatInit`, not `initialMessages`)
- send `chatId` in every `/api/chat` request — pass it via a custom `fetch` wrapper on the `TextStreamChatTransport` constructor (there is no `onResponse` option on the transport; use the custom `fetch` to read response headers like `X-Chat-Id`)

### 11. Verify persistence end-to-end

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

- [Lakebase plugin docs](https://databricks.github.io/appkit/docs/plugins/lakebase)
- [PostgreSQL schema design](https://www.postgresql.org/docs/current/ddl.html)
