import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type UIMessage } from 'ai';
import { Config } from '@databricks/sdk-experimental';
import type { Application } from 'express';
import { generateEmbedding } from '../lib/embeddings';
import { retrieveSimilar } from '../lib/rag-store';
import { appendMessage } from '../lib/chat-store';

interface AppKitWithLakebase {
  lakebase: { query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }> };
  server: { extend(fn: (app: Application) => void): void };
}

async function getDatabricksToken() {
  if (process.env.DATABRICKS_TOKEN) return process.env.DATABRICKS_TOKEN;
  const config = new Config({ profile: process.env.DATABRICKS_CONFIG_PROFILE || 'DEFAULT' });
  await config.ensureResolved();
  const headers = new Headers();
  await config.authenticate(headers);
  const authHeader = headers.get('Authorization');
  if (!authHeader) throw new Error('Failed to get Databricks token. Check your CLI profile or set DATABRICKS_TOKEN.');
  return authHeader.replace('Bearer ', '');
}

export function setupChatRoutes(appkit: AppKitWithLakebase) {
  appkit.server.extend((app) => {
    // Retrieve RAG sources for a query (called by client before/alongside chat)
    app.get('/api/chat/sources', async (req, res) => {
      const query = req.query.q as string | undefined;
      if (!query) {
        res.json([]);
        return;
      }
      try {
        const embedding = await generateEmbedding(query);
        const similar = await retrieveSimilar(appkit, embedding, 5);
        const sources = similar.map((d: Record<string, unknown>, i: number) => ({
          index: i + 1,
          content: d.content as string,
          similarity: d.similarity as number,
          metadata: d.metadata as Record<string, unknown>,
        }));
        res.json(sources);
      } catch (err) {
        console.error('[chat:sources]', (err as Error).message);
        res.json([]);
      }
    });

    app.post('/api/chat', async (req, res) => {
      const { messages, chatId } = req.body as {
        messages: UIMessage[];
        chatId: string;
      };
      const coreMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content:
          m.parts
            ?.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
            .map((p) => p.text)
            .join('') ?? '',
      }));

      try {
        const lastUserMsg = coreMessages.filter((m) => m.role === 'user').pop();

        // Save the user message
        if (lastUserMsg && chatId) {
          await appendMessage(appkit, {
            chatId,
            role: 'user',
            content: lastUserMsg.content,
          });
        }

        const token = await getDatabricksToken();
        const endpoint = process.env.DATABRICKS_ENDPOINT || 'databricks-gpt-5-4-mini';

        let contextPrefix = '';
        if (lastUserMsg) {
          const similar = await retrieveSimilar(appkit, await generateEmbedding(lastUserMsg.content), 5);
          if (similar.length > 0) {
            contextPrefix =
              'Use the following context to inform your answer. If not relevant, say so.\n\n' +
              similar.map((d: Record<string, unknown>, i: number) => `[${i + 1}] ${d.content}`).join('\n\n');
          }
        }

        const augmented = [
          ...(contextPrefix ? [{ role: 'system' as const, content: contextPrefix }] : []),
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
                role: 'assistant',
                content: text,
              });
            }
          },
        });
        result.pipeTextStreamToResponse(res);
      } catch (err) {
        console.error('[chat]', (err as Error).message);
        res.status(502).json({ error: 'Chat request failed' });
      }
    });
  });
}
