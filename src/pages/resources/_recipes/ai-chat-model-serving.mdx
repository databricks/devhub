## AI Chat with Databricks Model Serving

Build a streaming chat app powered by Databricks AI Gateway (model serving). Uses Vercel AI SDK with an OpenAI-compatible provider pointed at your Databricks serving endpoint, plus AI Elements for the chat UI.

### 1. Identify your model serving endpoint

List available serving endpoints in your workspace. Pick the endpoint name you want to use for chat (e.g. a foundation model endpoint like `databricks-claude-haiku-4-5` or a custom model endpoint).

```bash
databricks serving-endpoints list --profile <PROFILE> -o json
```

You can also inspect a specific endpoint:

```bash
databricks serving-endpoints get <endpoint-name> --profile <PROFILE>
```

### 2. Install AI SDK and the OpenAI-compatible provider

```bash
bun add ai @ai-sdk/react @ai-sdk/openai-compatible
```

### 3. Install AI Elements UI components

```bash
bunx shadcn@latest add @ai-elements/all
```

### 4. Configure Databricks environment variables

`DATABRICKS_HOST` is your workspace URL. `DATABRICKS_TOKEN` is a personal access token or service principal token. `DATABRICKS_SERVING_ENDPOINT` is the name of the model serving endpoint you identified in step 1.

For local development, add these to `.env`:

```bash
echo 'DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
DATABRICKS_TOKEN=<your-token>
DATABRICKS_SERVING_ENDPOINT=<endpoint-name>' >> .env
```

For deployment, add the environment variables to `app.yaml`:

```yaml
env:
  - name: DATABRICKS_SERVING_ENDPOINT
    value: "<endpoint-name>"
```

The app has access to the workspace host and token automatically at runtime.

### 5. Create the Databricks AI provider

Create a provider module that connects AI SDK to your Databricks model serving endpoint using the OpenAI-compatible interface:

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

### 6. Create a streaming chat API route

Implement a `/api/chat` route that streams responses from your Databricks model serving endpoint:

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

### 7. Create the chat UI with useChat and AI Elements

Use the `useChat` hook for streaming and AI Elements components for the chat interface:

```tsx
import { useChat } from "@ai-sdk/react";

export function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

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

### 8. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Open the chat page in your browser and send a message. Responses stream from your Databricks model serving endpoint through the AI SDK.

#### References

- [AI Gateway docs](https://docs.databricks.com/en/ai-gateway/)
- [Model Serving endpoints](https://docs.databricks.com/en/machine-learning/model-serving/create-manage-serving-endpoints.html)
- [AI SDK OpenAI-compatible providers](https://ai-sdk.dev/providers/openai-compatible-providers)
- [AI Elements docs](https://ui.shadcn.com/docs/registry/ai-elements)
