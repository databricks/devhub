import type { Template } from "./recipes/recipes";

export type TemplateContentBlock =
  | { type: "markdown"; content: string }
  | { type: "recipe"; recipeId: string }
  | { type: "code"; language: string; content: string };

type RawRecipeMarkdownById = Record<string, string | undefined>;

const templateContentById: Record<string, TemplateContentBlock[]> = {
  "rag-chat-app-template": [
    {
      type: "markdown",
      content: `## What you are building

A RAG (retrieval-augmented generation) chat app on Databricks. When a user sends a message, the server embeds the query, retrieves relevant documents from a pgvector table, injects them as context into the prompt, and streams a grounded response. The app persists chat sessions so users can resume conversations after refresh.

### Architecture

\`\`\`
Client (React)                    Server (Express + AppKit)
--------------                    -------------------------
ChatPage                          POST /api/chat
  useChat (AI SDK v6)               embed query -> retrieveSimilar -> build context
  SourcesDisplay                     prepend system message -> streamText -> persist
  chat sidebar                    GET  /api/chat/sources
  auto-create chat on first msg     embed query -> retrieveSimilar -> return sources
                                  GET  /api/chats          (list sessions)
                                  POST /api/chats          (create session)
                                  GET  /api/chats/:id/messages (load history)
\`\`\`

### Final project structure

After completing all recipes, your project will have these files:

\`\`\`
server/
  server.ts                      # Entry point: setup tables, seed, register routes, start
  lib/
    embeddings.ts                # generateEmbedding() via AI Gateway
    rag-store.ts                 # setupRagTables(), insertDocument(), retrieveSimilar()
    chat-store.ts                # setupChatTables(), createChat(), appendMessage(), listChats(), getChatMessages()
    seed-data.ts                 # seedFromWikipedia() with paragraph chunking
  routes/
    chat-routes.ts               # POST /api/chat (RAG flow), GET /api/chat/sources
    chat-persistence-routes.ts   # CRUD endpoints for chat sessions
client/
  src/pages/
    ChatPage.tsx                 # Chat UI with sources display and sidebar
\`\`\`

### Prerequisites

- A Databricks workspace with a CLI profile configured
- A Lakebase Postgres project with pgvector extension enabled
- AI Gateway endpoints for chat (e.g. \`databricks-meta-llama-3-3-70b-instruct\`) and embeddings (e.g. \`databricks-gte-large-en\`)

Work through the recipes below in order. Each one builds on the previous.`,
    },
    {
      type: "markdown",
      content: `---

## Phase 1: Project setup

Scaffold the app, authenticate, and install agent skills. This creates the base AppKit project structure.`,
    },
    { type: "recipe", recipeId: "databricks-local-bootstrap" },
    {
      type: "markdown",
      content: `---

## Phase 2: Database layer

Add Lakebase (managed Postgres) to your app. This recipe creates the \`lakebase()\` plugin connection and a sample CRUD app. You will not use the sample CRUD routes in the final app, but you need the Lakebase plugin wiring, environment variables, and \`databricks.yml\` resource configuration it sets up.

**Important:** When scaffolding with \`--features=lakebase\`, use the full resource paths from \`databricks postgres list-branches\` and \`databricks postgres list-databases\`. Short names like \`main\` will fail on deploy.`,
    },
    { type: "recipe", recipeId: "lakebase-data-persistence" },
    {
      type: "markdown",
      content: `---

## Phase 3: AI Gateway

Configure your chat and embedding model endpoints. The key outputs from this recipe are the \`DATABRICKS_ENDPOINT\` and \`DATABRICKS_WORKSPACE_ID\` environment variables, and understanding how to use \`createOpenAI()\` with the AI Gateway URL pattern.`,
    },
    { type: "recipe", recipeId: "foundation-models-api" },
    {
      type: "markdown",
      content: `---

## Phase 4: Embeddings

Create the \`generateEmbedding()\` function that calls a Databricks embedding endpoint. This function is used in three places later:
1. **Document seeding** — embed each text chunk before inserting into pgvector
2. **RAG retrieval** — embed the user's query to find similar documents
3. **Sources endpoint** — embed the query to return sources to the client

Create this as \`server/lib/embeddings.ts\` and export the \`generateEmbedding\` function.`,
    },
    { type: "recipe", recipeId: "embeddings-generation" },
    {
      type: "markdown",
      content: `---

## Phase 5: Vector store

Set up pgvector tables and the insert/query functions. This recipe produces three exports from \`server/lib/rag-store.ts\`:
- \`setupRagTables(appkit)\` — creates the \`rag.documents\` table with a \`VECTOR(1024)\` column on startup
- \`insertDocument(appkit, { content, embedding, metadata })\` — inserts a document with its embedding
- \`retrieveSimilar(appkit, queryEmbedding, limit)\` — cosine similarity search

These are used by the seeding module and chat routes in later recipes.`,
    },
    { type: "recipe", recipeId: "lakebase-pgvector" },
    {
      type: "markdown",
      content: `---

## Phase 6: Streaming chat

Build the base chat experience with AI SDK v6 streaming. This recipe gives you:
- The \`getDatabricksToken()\` auth helper
- A basic \`POST /api/chat\` route with \`streamText()\`
- A \`ChatPage\` component with \`useChat()\` and \`TextStreamChatTransport\`

**Important:** Phase 8 replaces \`server/server.ts\`, \`server/routes/chat-routes.ts\`, and \`ChatPage.tsx\` with RAG-augmented versions. If you are building the full RAG app in one pass, **skip creating those files now** — just install the packages and read this recipe for context, then use the Phase 8 versions.

Install the required packages:

\`\`\`bash
npm install ai@6 @ai-sdk/react@3 @ai-sdk/openai@3 @databricks/sdk-experimental
\`\`\``,
    },
    { type: "recipe", recipeId: "ai-chat-model-serving" },
    {
      type: "markdown",
      content: `---

## Phase 7: Chat persistence

Add chat session storage so conversations survive page refreshes. This recipe provides the complete \`server/lib/chat-store.ts\` module with five exports:
- \`setupChatTables(appkit)\` — creates \`chat.chats\` and \`chat.messages\` tables on startup
- \`createChat(appkit, { userId, title })\` — creates a new chat session
- \`listChats(appkit, userId)\` — lists all chats for a user
- \`getChatMessages(appkit, chatId)\` — loads message history in chronological order
- \`appendMessage(appkit, { chatId, role, content })\` — saves a message and updates the chat's \`updated_at\` timestamp`,
    },
    { type: "recipe", recipeId: "lakebase-chat-persistence" },
    {
      type: "markdown",
      content: `---

## Phase 8: RAG integration

This is the capstone recipe. It ties everything together: document seeding, RAG-augmented chat routes (replacing the basic ones from Phase 6), sources API, chat persistence REST endpoints, the server bootstrap, and client-side sources display.

**This recipe's \`server/server.ts\`, \`server/routes/chat-routes.ts\`, and \`ChatPage\` replace the versions from earlier recipes.** The earlier recipes taught the individual patterns; this recipe provides the final integrated versions.

This recipe also replaces the scaffold's \`App.tsx\` — the chat becomes the entire app (root route), removing the scaffold's Home page and Lakebase demo.`,
    },
    { type: "recipe", recipeId: "rag-chat-integration" },
  ],
};

export function getTemplateContentBlocks(
  templateId: string,
): TemplateContentBlock[] | undefined {
  return templateContentById[templateId];
}

export function collectTemplateRecipeIds(template: Template): string[] {
  const blocks = getTemplateContentBlocks(template.id);
  if (!blocks) {
    return template.recipeIds;
  }

  return [
    ...new Set(
      blocks.flatMap((block) =>
        block.type === "recipe" ? [block.recipeId] : [],
      ),
    ),
  ];
}

function getRecipeMarkdown(
  recipeId: string,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const markdown = rawBySlug[recipeId];
  if (!markdown) {
    throw new Error(`Recipe markdown not found: ${recipeId}`);
  }
  return markdown.trim();
}

export function buildLegacyTemplateRawMarkdown(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  return template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export function serializeTemplateContentBlocks(
  blocks: TemplateContentBlock[],
  rawBySlug: RawRecipeMarkdownById,
): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "markdown":
          return block.content.trim();
        case "recipe":
          return getRecipeMarkdown(block.recipeId, rawBySlug);
        case "code":
          return `\`\`\`${block.language}\n${block.content.trimEnd()}\n\`\`\``;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function buildTemplateRawMarkdown(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const blocks = getTemplateContentBlocks(template.id);
  if (!blocks) {
    return buildLegacyTemplateRawMarkdown(template, rawBySlug);
  }

  return serializeTemplateContentBlocks(blocks, rawBySlug);
}

function escapeFrontmatter(value: string): string {
  return value.replace(/"/g, '\\"');
}

export function buildTemplateMarkdownDocument(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const body = buildTemplateRawMarkdown(template, rawBySlug);

  return [
    "---",
    `title: "${escapeFrontmatter(template.name)}"`,
    `url: /resources/${template.id}`,
    `summary: "${escapeFrontmatter(template.description)}"`,
    "---",
    "",
    `# ${template.name}`,
    "",
    template.description,
    "",
    body,
  ].join("\n");
}
