## Streaming AI Chat with Model Serving

Build a streaming AI chat experience in a Databricks App using Vercel AI SDK with Databricks Model Serving and OpenAI-compatible endpoints.

### 1. Follow the prerequisite recipes first

Complete these recipes before adding chat:

- [`Databricks Local Bootstrap`](/resources/base-app-template#databricks-local-bootstrap)
- [`Query AI Gateway Endpoints`](/resources/ai-chat-app-template#query-ai-gateway-endpoints)

:::tip[Deploy before local development]
Lakebase tables are owned by the identity that creates them. Deploy the app first so the service principal creates and owns the schemas. Then grant yourself local dev access:

```bash
databricks psql --project <project-name> --profile <PROFILE> -- -c "
  CREATE EXTENSION IF NOT EXISTS databricks_auth;
  SELECT databricks_create_role('<your-email>', 'USER');
  GRANT databricks_superuser TO \"<your-email>\";
"
```

> **Note**: If you are the Lakebase project owner, `databricks_create_role` may fail with `role already exists` and `GRANT databricks_superuser` may fail with `permission denied to grant role`. Both errors are safe to ignore — the project owner already has the necessary access.

If you run `npm run dev` before deploying, your user creates schemas that the deployed service principal cannot access. `CREATE SCHEMA IF NOT EXISTS` appears to succeed even on schemas you don't own, but subsequent `CREATE TABLE` fails with `permission denied`.
:::

### 2. Install AI SDK packages

```bash
npm install ai@6 @ai-sdk/react@3 @ai-sdk/openai@3 @databricks/sdk-experimental
```

> **Version note**: This recipe uses AI SDK v6 APIs (`TextStreamChatTransport`, `sendMessage({ text })`, transport-based `useChat`). Tested with `ai@6.1`, `@ai-sdk/react@3.1`, and `@ai-sdk/openai@3.x`.

> **Note**: `@databricks/sdk-experimental` is included in the scaffolded `package.json`. It is listed here for reference if adding AI chat to an existing project.

> **Optional**: For pre-built chat UI components, initialize shadcn and add AI Elements:
>
> ```bash
> npx shadcn@latest init
> ```
>
> This basic recipe works without AI Elements — they're optional prebuilt components.

### 3. Configure environment variables for AI Gateway

Configure your Databricks workspace ID and model endpoint:

For local development (`.env`):

```bash
echo 'DATABRICKS_WORKSPACE_ID=<your-workspace-id>' >> .env
echo 'DATABRICKS_ENDPOINT=<your-endpoint>' >> .env
echo 'DATABRICKS_CONFIG_PROFILE=DEFAULT' >> .env
```

For deployment in Databricks Apps (`app.yaml`):

```yaml
env:
  - name: DATABRICKS_WORKSPACE_ID
    value: "<your-workspace-id>"
  - name: DATABRICKS_ENDPOINT
    value: "<your-endpoint>"
```

> **Workspace ID**: AppKit auto-discovers this at runtime. For explicit setup, run `databricks api get /api/2.1/unity-catalog/current-metastore-assignment --profile <PROFILE>` and use the `workspace_id` field.

> **Model compatibility**: This recipe uses OpenAI-compatible models served via Databricks AI Gateway, which support the AI SDK's streaming API. The AI Gateway URL uses the `/mlflow/v1` path (not `/openai/v1`).

> **Find your endpoint**: Run `databricks serving-endpoints list --profile <PROFILE>` to see available models. Common endpoints include `databricks-meta-llama-3-3-70b-instruct` and `databricks-claude-sonnet-4`, but availability varies by workspace.

### 4. Configure authentication helper

Create a helper function that works for both local development and deployed apps:

```typescript
import { Config } from "@databricks/sdk-experimental";

async function getDatabricksToken() {
  // For deployed apps, use service principal token
  if (process.env.DATABRICKS_TOKEN) {
    return process.env.DATABRICKS_TOKEN;
  }

  // For local dev, use CLI profile auth via Databricks SDK
  const config = new Config({
    profile: process.env.DATABRICKS_CONFIG_PROFILE || "DEFAULT",
  });
  await config.ensureResolved();
  const headers = new Headers();
  await config.authenticate(headers);
  const authHeader = headers.get("Authorization");
  if (!authHeader) {
    throw new Error(
      "Failed to get Databricks token. Check your CLI profile or set DATABRICKS_TOKEN.",
    );
  }
  return authHeader.replace("Bearer ", "");
}
```

This function uses the Databricks SDK auth chain, which reads ~/.databrickscfg profiles and handles OAuth token refresh. For deployed apps, set DATABRICKS_TOKEN directly.

> **User identity in deployed apps**: Databricks Apps injects user identity via request headers. Extract it with `req.header("x-forwarded-email")` or `req.header("x-forwarded-user")`. Use this for chat persistence and access control.

### 5. Add `/api/chat` route with streaming

Create a server route using the AI SDK's streaming support:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage } from "ai";

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  // AI SDK v6 client sends UIMessage objects with a parts array.
  // Convert to CoreMessage format for streamText().
  const coreMessages = (messages as UIMessage[]).map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content:
      m.parts
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("") ??
      m.content ??
      "",
  }));

  try {
    const token = await getDatabricksToken();
    const endpoint = process.env.DATABRICKS_ENDPOINT || "<your-endpoint>";

    // Configure Databricks AI Gateway as OpenAI-compatible provider
    const databricks = createOpenAI({
      baseURL: `https://${process.env.DATABRICKS_WORKSPACE_ID}.ai-gateway.cloud.databricks.com/mlflow/v1`,
      apiKey: token,
    });

    // Stream the response using AI SDK v6
    const result = streamText({
      model: databricks.chat(endpoint),
      messages: coreMessages,
      maxOutputTokens: 1000,
    });

    // v6 API: pipe the text stream to the Express response
    result.pipeTextStreamToResponse(res);
  } catch (err) {
    const message = (err as Error).message;
    console.error(`[chat] Streaming request failed:`, message);
    res.status(502).json({
      error: "Chat request failed",
      detail: message,
    });
  }
});
```

### 6. Render the streaming chat UI

Use `useChat` from the AI SDK with `TextStreamChatTransport` for streaming support:

```tsx
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState } from "react";

export function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <span className="text-sm font-medium">
              {m.role === "user" ? "You" : "Assistant"}
            </span>
            {m.parts.map((part, i) =>
              part.type === "text" ? (
                <p key={`${m.id}-${i}`} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              ) : null,
            )}
          </div>
        ))}
        {status === "submitted" && <div className="p-4">Loading...</div>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            void sendMessage({ text: input });
            setInput("");
          }
        }}
        className="border-t p-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border rounded px-3 py-2"
          disabled={status !== "ready"}
        />
        <button type="submit" disabled={status !== "ready"}>
          {status === "submitted" || status === "streaming"
            ? "Sending..."
            : "Send"}
        </button>
      </form>
    </div>
  );
}
```

### 7. Deploy and verify

```bash
databricks apps deploy --profile <PROFILE>
databricks apps list --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

Open the app URL while signed in to Databricks, send a message, and verify streaming responses appear token-by-token from the AI Gateway endpoint.

#### References

- [Model Serving Overview](https://docs.databricks.com/aws/en/machine-learning/model-serving/)
- [Serving Endpoints](https://docs.databricks.com/aws/en/machine-learning/model-serving/create-foundation-model-endpoints)
- [AI Elements docs](https://ui.shadcn.com/docs/registry/ai-elements)
