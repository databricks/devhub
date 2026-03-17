## AI Chat with Databricks Model Serving

Build a streaming AI chat experience in a Databricks App using AI SDK, AI Elements, and a Databricks Model Serving endpoint.

### 1. Follow the prerequisite recipes first

Complete these recipes before adding chat:

- [`Databricks Local Bootstrap`](/resources/base-app-template#databricks-local-bootstrap)
- [`Lakebase Data Persistence`](/resources/data-app-template#lakebase-data-persistence)
- [`Create a Databricks Model Serving endpoint`](/resources/ai-chat-app-template#create-a-databricks-model-serving-endpoint)

### 2. Install AI SDK and AI Elements packages

```bash
bun add ai @ai-sdk/react @ai-sdk/openai-compatible
bunx shadcn@latest add @ai-elements/all
```

### 3. Install AI SDK and AI Elements agent skills

Install and verify the Databricks agent skills, then add AI SDK and AI Elements skills from your agent skill registry.

```bash
npx skills add databricks/databricks-agent-skills --all
npx skills add <ai-sdk-skill-id> --all
npx skills add <ai-elements-skill-id> --all
npx skills list
```

### 4. Configure environment variables for model serving

Set your workspace URL, token, and endpoint name for local development:

```bash
echo 'DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
DATABRICKS_TOKEN=<your-token>
DATABRICKS_SERVING_ENDPOINT=<endpoint-name>' >> .env
```

For deployment, keep endpoint selection in `app.yaml`:

```yaml
env:
  - name: DATABRICKS_SERVING_ENDPOINT
    value: "<endpoint-name>"
```

### 5. Create the model provider module

Use the OpenAI-compatible adapter pointed at Databricks Model Serving:

```typescript
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const databricks = createOpenAICompatible({
  name: "databricks",
  baseURL: `${process.env.DATABRICKS_HOST}/serving-endpoints`,
  headers: {
    Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
  },
});

export const chatModel = databricks.chatModel(
  process.env.DATABRICKS_SERVING_ENDPOINT!,
);
```

### 6. Add a streaming `/api/chat` route

Create a server route that accepts chat messages and streams model output:

```typescript
import { streamText } from "ai";
import { chatModel } from "./provider";

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = streamText({
    model: chatModel,
    messages,
  });
  result.pipeDataStreamToResponse(res);
});
```

### 7. Render the chat UI with `useChat`

Use `useChat` for transport and AI Elements for composition. Keep your existing chat UI structure and point requests at `/api/chat`.

```tsx
import { useChat } from "@ai-sdk/react";

export function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            <span className="text-sm font-medium">
              {m.role === "user" ? "You" : "Assistant"}
            </span>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### 8. Add chat persistence in Lakebase

Persist chat sessions and messages using this recipe:

- [`Lakebase Chat Persistence`](/resources/ai-chat-app-template#lakebase-chat-persistence)

### 9. Deploy and verify

```bash
databricks apps deploy --profile <PROFILE>
databricks apps list --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

Open the app URL while signed in to Databricks, send a message, and verify streamed responses plus persisted chat history.

#### References

- [Databricks AI Gateway](https://docs.databricks.com/en/ai-gateway/)
- [Databricks Model Serving endpoints](https://docs.databricks.com/en/machine-learning/model-serving/create-manage-serving-endpoints.html)
- [AI SDK OpenAI-compatible providers](https://ai-sdk.dev/providers/openai-compatible-providers)
- [AI Elements docs](https://ui.shadcn.com/docs/registry/ai-elements)
