## RAG Chat Integration

Wire pgvector retrieval, document seeding, and a sources API into a streaming chat app to build a complete RAG experience. This recipe builds on the embeddings, pgvector, chat, and persistence recipes to produce a fully working RAG chat app.

### 1. Follow the prerequisite recipes first

Complete these recipes before continuing:

- [`Generate Embeddings with AI Gateway`](/resources/rag-chat-app-template#generate-embeddings-with-ai-gateway)
- [`Lakebase pgvector`](/resources/rag-chat-app-template#lakebase-pgvector)
- [`Streaming AI Chat with Model Serving`](/resources/rag-chat-app-template#streaming-ai-chat-with-model-serving)
- [`Lakebase Chat Persistence`](/resources/rag-chat-app-template#lakebase-chat-persistence)

### 2. Add seed environment variable

Add `RAG_RESEED` to `.env` so you can control whether seeding re-runs on restart:

`.env`:

```bash
RAG_RESEED=false
```

`app.yaml` (add under `env`):

```yaml
env:
  - name: RAG_RESEED
    value: "false"
```

### 3. Create the document seeding module

This module fetches Wikipedia articles, chunks them at paragraph boundaries, and seeds the pgvector table. Adapt `fetchWikipediaArticle()` for your own data sources.

`server/lib/seed-data.ts`:

```typescript
import type { Application } from "express";

interface AppKitWithLakebase {
  lakebase: {
    query(
      text: string,
      params?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

const WIKIPEDIA_ARTICLES = [
  "Databricks",
  "Apache_Spark",
  "Delta_Lake_(software)",
  "Apache_Iceberg",
  "Data_lakehouse",
  "Apache_Parquet",
  "Extract,_transform,_load",
  "Retrieval-augmented_generation",
  "Data_lake",
];

const SHOULD_RESEED = process.env.RAG_RESEED === "true";

async function fetchWikipediaArticle(title: string): Promise<string> {
  const url =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      prop: "extracts",
      explaintext: "1",
      format: "json",
      titles: title,
    });
  const res = await fetch(url);
  const data = (await res.json()) as {
    query: { pages: Record<string, { extract?: string }> };
  };
  const page = Object.values(data.query.pages)[0];
  return page.extract ?? "";
}

function chunkText(text: string, maxLen = 1000): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paragraphs) {
    if (cur.length + p.length > maxLen && cur) {
      chunks.push(cur.trim());
      cur = "";
    }
    cur += p + "\n\n";
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

export async function seedFromWikipedia(
  appkit: AppKitWithLakebase,
  generateEmbedding: (text: string) => Promise<number[]>,
  insertDocument: (
    appkit: AppKitWithLakebase,
    input: {
      content: string;
      embedding: number[];
      metadata?: Record<string, unknown>;
    },
  ) => Promise<Record<string, unknown>>,
) {
  const { rows } = await appkit.lakebase.query(
    "SELECT COUNT(*) as count FROM rag.documents",
  );
  const existingCount = parseInt(String(rows[0].count), 10);
  if (existingCount > 0 && !SHOULD_RESEED) return;
  if (existingCount > 0 && SHOULD_RESEED) {
    await appkit.lakebase.query("DELETE FROM rag.documents");
  }
  for (const title of WIKIPEDIA_ARTICLES) {
    try {
      const chunks = chunkText(await fetchWikipediaArticle(title));
      for (const [index, chunk] of chunks.entries()) {
        await insertDocument(appkit, {
          content: chunk,
          embedding: await generateEmbedding(chunk),
          metadata: { source: "wikipedia", article: title, chunkIndex: index },
        });
      }
    } catch (err) {
      console.warn(`[seed] ${title} failed:`, (err as Error).message);
    }
  }
}
```

Key points:

- `chunkText()` splits on paragraph boundaries (double newlines) and merges short paragraphs up to `maxLen`. This keeps semantic units together.
- `seedFromWikipedia()` is idempotent: it skips seeding if documents exist unless `RAG_RESEED=true`.
- `generateEmbedding` and `insertDocument` are injected as parameters from earlier recipes.

### 4. Create RAG-augmented chat routes

This is the core RAG flow. The `/api/chat` route embeds the user query, retrieves similar documents, injects them as system context, and streams the response. The `/api/chat/sources` endpoint lets the client fetch sources in parallel.

`server/routes/chat-routes.ts`:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage } from "ai";
import { Config } from "@databricks/sdk-experimental";
import type { Application } from "express";
import { generateEmbedding } from "../lib/embeddings";
import { retrieveSimilar } from "../lib/rag-store";
import { appendMessage } from "../lib/chat-store";

interface AppKitWithLakebase {
  lakebase: {
    query(
      text: string,
      params?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: { extend(fn: (app: Application) => void): void };
}

async function getDatabricksToken() {
  if (process.env.DATABRICKS_TOKEN) return process.env.DATABRICKS_TOKEN;
  const config = new Config({
    profile: process.env.DATABRICKS_CONFIG_PROFILE || "DEFAULT",
  });
  await config.ensureResolved();
  const headers = new Headers();
  await config.authenticate(headers);
  const authHeader = headers.get("Authorization");
  if (!authHeader)
    throw new Error(
      "Failed to get Databricks token. Check your CLI profile or set DATABRICKS_TOKEN.",
    );
  return authHeader.replace("Bearer ", "");
}

export function setupChatRoutes(appkit: AppKitWithLakebase) {
  appkit.server.extend((app) => {
    // Retrieve RAG sources for a query (called by client before/alongside chat)
    app.get("/api/chat/sources", async (req, res) => {
      const query = req.query.q as string | undefined;
      if (!query) {
        res.json([]);
        return;
      }
      try {
        const embedding = await generateEmbedding(query);
        const similar = await retrieveSimilar(appkit, embedding, 5);
        const sources = similar.map(
          (d: Record<string, unknown>, i: number) => ({
            index: i + 1,
            content: d.content as string,
            similarity: d.similarity as number,
            metadata: d.metadata as Record<string, unknown>,
          }),
        );
        res.json(sources);
      } catch (err) {
        console.error("[chat:sources]", (err as Error).message);
        res.json([]);
      }
    });

    app.post("/api/chat", async (req, res) => {
      const { messages, chatId } = req.body as {
        messages: UIMessage[];
        chatId: string;
      };
      const coreMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content:
          m.parts
            ?.filter(
              (p): p is Extract<typeof p, { type: "text" }> =>
                p.type === "text",
            )
            .map((p) => p.text)
            .join("") ?? "",
      }));

      try {
        const lastUserMsg = coreMessages.filter((m) => m.role === "user").pop();

        // Save the user message
        if (lastUserMsg && chatId) {
          await appendMessage(appkit, {
            chatId,
            role: "user",
            content: lastUserMsg.content,
          });
        }

        const token = await getDatabricksToken();
        const endpoint =
          process.env.DATABRICKS_ENDPOINT || "databricks-gpt-5-4-mini";

        let contextPrefix = "";
        if (lastUserMsg) {
          const similar = await retrieveSimilar(
            appkit,
            await generateEmbedding(lastUserMsg.content),
            5,
          );
          if (similar.length > 0) {
            contextPrefix =
              "Use the following context to inform your answer. If not relevant, say so.\n\n" +
              similar
                .map(
                  (d: Record<string, unknown>, i: number) =>
                    `[${i + 1}] ${d.content}`,
                )
                .join("\n\n");
          }
        }

        const augmented = [
          ...(contextPrefix
            ? [{ role: "system" as const, content: contextPrefix }]
            : []),
          ...coreMessages,
        ];

        const databricks = createOpenAI({
          baseURL: `https://${process.env.DATABRICKS_WORKSPACE_ID}.ai-gateway.cloud.databricks.com/mlflow/v1`,
          apiKey: token,
        });
        const result = streamText({
          model: databricks.chat(endpoint),
          messages: augmented,
          maxOutputTokens: 1000,
          onFinish: async ({ text }) => {
            if (chatId) {
              await appendMessage(appkit, {
                chatId,
                role: "assistant",
                content: text,
              });
            }
          },
        });
        result.pipeTextStreamToResponse(res);
      } catch (err) {
        console.error("[chat]", (err as Error).message);
        res.status(502).json({ error: "Chat request failed" });
      }
    });
  });
}
```

The RAG flow in `/api/chat`:

1. Extract the last user message
2. Save it to the chat session via `appendMessage()`
3. Embed the query with `generateEmbedding()`
4. Retrieve the top 5 similar documents with `retrieveSimilar()`
5. Build a context prefix with numbered sources
6. Prepend it as a system message
7. Stream the response and persist the assistant reply on finish

### 5. Create chat persistence routes

These REST endpoints let the client list, create, and load chat sessions. The `getUserId()` function reads the `x-forwarded-email` header set by Databricks Apps in production.

`server/routes/chat-persistence-routes.ts`:

```typescript
import type { Application } from "express";
import {
  listChats,
  createChat,
  getChatMessages,
  appendMessage,
} from "../lib/chat-store";

interface AppKitWithLakebase {
  lakebase: {
    query(
      text: string,
      params?: unknown[],
    ): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

function getUserId(req: { header(name: string): string | undefined }): string {
  return req.header("x-forwarded-email") || "local-dev-user";
}

export function setupChatPersistenceRoutes(appkit: AppKitWithLakebase) {
  appkit.server.extend((app) => {
    // List all chat sessions for the current user
    app.get("/api/chats", async (req, res) => {
      try {
        const chats = await listChats(appkit, getUserId(req));
        res.json(chats);
      } catch (err) {
        console.error("[chats:list]", (err as Error).message);
        res.status(500).json({ error: "Failed to list chats" });
      }
    });

    // Create a new chat session
    app.post("/api/chats", async (req, res) => {
      try {
        const { title } = req.body as { title?: string };
        const chat = await createChat(appkit, {
          userId: getUserId(req),
          title: title || "New Chat",
        });
        res.status(201).json(chat);
      } catch (err) {
        console.error("[chats:create]", (err as Error).message);
        res.status(500).json({ error: "Failed to create chat" });
      }
    });

    // Load messages for a chat session
    app.get("/api/chats/:id/messages", async (req, res) => {
      try {
        const messages = await getChatMessages(appkit, req.params.id);
        res.json(messages);
      } catch (err) {
        console.error("[chats:messages]", (err as Error).message);
        res.status(500).json({ error: "Failed to load messages" });
      }
    });

    // Save a message to a chat session
    app.post("/api/chats/:id/messages", async (req, res) => {
      try {
        const { role, content } = req.body as { role: string; content: string };
        const message = await appendMessage(appkit, {
          chatId: req.params.id,
          role,
          content,
        });
        res.status(201).json(message);
      } catch (err) {
        console.error("[chats:save-message]", (err as Error).message);
        res.status(500).json({ error: "Failed to save message" });
      }
    });
  });
}
```

### 6. Wire everything together in the server entry point

The server bootstrap creates the AppKit instance, runs table setup and seeding, registers all routes, and starts the server.

`server/server.ts`:

```typescript
import { createApp, server, lakebase } from "@databricks/appkit";
import { setupRagTables, insertDocument } from "./lib/rag-store";
import { setupChatRoutes } from "./routes/chat-routes";
import { setupChatPersistenceRoutes } from "./routes/chat-persistence-routes";
import { setupChatTables } from "./lib/chat-store";
import { seedFromWikipedia } from "./lib/seed-data";
import { generateEmbedding } from "./lib/embeddings";

const appkit = await createApp({
  plugins: [server({ autoStart: false }), lakebase()],
});

await setupRagTables(appkit);
await setupChatTables(appkit);
await seedFromWikipedia(appkit, generateEmbedding, insertDocument);
setupChatRoutes(appkit);
setupChatPersistenceRoutes(appkit);
await appkit.server.start();
```

The order matters: tables must exist before seeding, and seeding must complete before routes start handling requests.

### 7. Create the RAG chat page

This replaces the basic `ChatPage` from the streaming chat recipe with a full RAG-enabled version. It includes a chat sidebar, auto-creation of chat sessions, parallel source fetching, and an expandable sources display beneath each assistant response.

`client/src/pages/ChatPage.tsx`:

```tsx
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquarePlus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Input,
  ScrollArea,
  Separator,
} from "@databricks/appkit-ui/react";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface RagSource {
  index: number;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

function createTransport(chatIdRef: React.RefObject<string | null>) {
  return new TextStreamChatTransport({
    api: "/api/chat",
    body: () => (chatIdRef.current ? { chatId: chatIdRef.current } : {}),
    headers: { "Content-Type": "application/json" },
  });
}

function SourcesDisplay({ sources }: { sources: RagSource[] }) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-2 rounded-md border bg-muted/20 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 px-3 py-2 text-left text-muted-foreground hover:text-foreground"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="font-medium">
          Retrieved context ({sources.length} source
          {sources.length !== 1 ? "s" : ""})
        </span>
      </button>
      {expanded && (
        <div className="space-y-2 border-t px-3 py-2">
          {sources.map((source) => (
            <div
              key={source.index}
              className="rounded border bg-background p-2"
            >
              <div className="mb-1 flex items-center justify-between text-muted-foreground">
                <span className="font-medium">Source {source.index}</span>
                <span>
                  similarity: {(Number(source.similarity) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap text-foreground">
                {source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatPage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const chatLoadTokenRef = useRef(0);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const transportRef = useRef(createTransport(chatIdRef));
  const [sourcesMap, setSourcesMap] = useState<Record<string, RagSource[]>>({});

  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: transportRef.current,
  });

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    if (res.ok) setChats(await res.json());
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const selectChat = useCallback(
    async (id: string) => {
      const loadToken = ++chatLoadTokenRef.current;
      setChatId(id);
      chatIdRef.current = id;
      setSourcesMap({});
      setMessages([]);
      const res = await fetch(`/api/chats/${id}/messages`);
      if (!res.ok) return;
      const saved: ChatMessage[] = await res.json();
      if (loadToken !== chatLoadTokenRef.current) return;
      const restored = saved.map((m, i) => ({
        id: m.id || String(i),
        role: m.role as "user" | "assistant",
        content: m.content,
        parts: [{ type: "text" as const, text: m.content }],
        createdAt: new Date(m.created_at),
      }));
      setMessages(restored);
    },
    [setMessages],
  );

  const startNewChat = useCallback(() => {
    chatLoadTokenRef.current += 1;
    setChatId(null);
    chatIdRef.current = null;
    setMessages([]);
    setSourcesMap({});
  }, [setMessages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;

      let activeChatId = chatId;

      if (!activeChatId) {
        const title = text.slice(0, 80);
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) return;
        const chat: ChatSession = await res.json();
        activeChatId = chat.id;
        setChatId(activeChatId);
        chatIdRef.current = activeChatId;
      }

      const sourcesPromise = fetch(
        `/api/chat/sources?q=${encodeURIComponent(text)}`,
      )
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => [] as RagSource[]);

      await sendMessage({ text });
      setInput("");

      const sources: RagSource[] = await sourcesPromise;
      if (sources.length > 0) {
        setSourcesMap((prev) => ({ ...prev, [text]: sources }));
      }

      void loadChats();
    },
    [input, chatId, sendMessage, setInput, loadChats],
  );

  function getSourcesForAssistantMessage(index: number): RagSource[] {
    if (index === 0) return [];
    const prevMessage = messages[index - 1];
    if (!prevMessage || prevMessage.role !== "user") return [];
    const userText =
      prevMessage.parts
        ?.filter(
          (p): p is Extract<typeof p, { type: "text" }> => p.type === "text",
        )
        .map((p) => p.text)
        .join("") ?? "";
    return sourcesMap[userText] || [];
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="flex w-72 flex-col border-r bg-muted/30">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Lakehouse Knowledge Assistant
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask questions about Databricks, Spark, Delta Lake, and the
              lakehouse.
            </p>
          </div>
          <div className="px-4 pb-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={startNewChat}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    chatId === chat.id
                      ? "bg-primary/10 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
              {chats.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No previous chats
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground"
          >
            {sidebarOpen ? "\u2190" : "\u2192"}
          </Button>
          <h1 className="text-sm font-semibold text-foreground">RAG Chat</h1>
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-foreground">
                  Lakehouse Knowledge Assistant
                </p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask questions about Databricks, Apache Spark, Delta Lake, and
                  the data lakehouse. Answers are grounded in a curated
                  knowledge base.
                </p>
              </div>
            )}
            {messages.map((message, msgIndex) => (
              <div key={message.id} className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <p
                      key={`${message.id}-${index}`}
                      className="whitespace-pre-wrap text-sm"
                    >
                      {part.text}
                    </p>
                  ) : null,
                )}
                {message.role === "assistant" && (
                  <SourcesDisplay
                    sources={getSourcesForAssistantMessage(msgIndex)}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form
            className="mx-auto flex max-w-3xl gap-2"
            onSubmit={handleSubmit}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={status !== "ready"}
            />
            <Button
              type="submit"
              disabled={status !== "ready" || !input.trim()}
            >
              {status === "submitted" || status === "streaming"
                ? "Sending..."
                : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

Key patterns in this component:

- **`createTransport`** passes `chatId` via the `body` callback so the server knows which session to persist to
- **`SourcesDisplay`** is an expandable panel showing retrieved context with similarity scores
- **Auto-create chat**: on first message, `handleSubmit` creates a chat session via `POST /api/chats` before sending
- **Parallel source fetch**: sources are fetched from `/api/chat/sources` in parallel with the chat request
- **`sourcesMap`** keys sources by user message text so each assistant response maps to its retrieval context
- **`selectChat`** loads persisted messages and restores them into the `useChat` state

### 8. Make ChatPage the root route

Update `client/src/App.tsx` so the chat is the entire app — remove the scaffold's Home page and Lakebase demo, and make `ChatPage` the root route:

`client/src/App.tsx`:

```tsx
import { createBrowserRouter, RouterProvider } from "react-router";
import { ChatPage } from "./pages/ChatPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ChatPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

You can also delete the scaffold pages you no longer need:
- `client/src/pages/lakebase/LakebasePage.tsx`
- Any `HomePage` or welcome page from the scaffold

### 9. Deploy and verify

Deploy the app and verify the full RAG flow:

```bash
databricks apps deploy --profile <PROFILE>
```

Verification checklist:

- Send "What is Apache Spark?" and confirm the answer is grounded in retrieved context
- Expand the sources panel beneath the response and verify similarity scores appear
- Refresh the page and confirm the chat session persists in the sidebar
- Start a new chat and verify it creates a separate session

#### References

- [Vercel AI SDK](https://ai-sdk.dev/docs/getting-started/overview)
- [pgvector](https://github.com/pgvector/pgvector)
- [Databricks Apps](https://docs.databricks.com/en/dev-tools/databricks-apps/index.html)
- [AppKit](https://databricks.github.io/appkit/)
