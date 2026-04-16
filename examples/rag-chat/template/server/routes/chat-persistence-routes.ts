import type { Application } from 'express';
import { listChats, createChat, getChatMessages, appendMessage } from '../lib/chat-store';

interface AppKitWithLakebase {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

function getUserId(req: { header(name: string): string | undefined }): string {
  return req.header('x-forwarded-email') || 'local-dev-user';
}

export function setupChatPersistenceRoutes(appkit: AppKitWithLakebase) {
  appkit.server.extend((app) => {
    // List all chat sessions for the current user
    app.get('/api/chats', async (req, res) => {
      try {
        const chats = await listChats(appkit, getUserId(req));
        res.json(chats);
      } catch (err) {
        console.error('[chats:list]', (err as Error).message);
        res.status(500).json({ error: 'Failed to list chats' });
      }
    });

    // Create a new chat session
    app.post('/api/chats', async (req, res) => {
      try {
        const { title } = req.body as { title?: string };
        const chat = await createChat(appkit, {
          userId: getUserId(req),
          title: title || 'New Chat',
        });
        res.status(201).json(chat);
      } catch (err) {
        console.error('[chats:create]', (err as Error).message);
        res.status(500).json({ error: 'Failed to create chat' });
      }
    });

    // Load messages for a chat session
    app.get('/api/chats/:id/messages', async (req, res) => {
      try {
        const messages = await getChatMessages(appkit, req.params.id);
        res.json(messages);
      } catch (err) {
        console.error('[chats:messages]', (err as Error).message);
        res.status(500).json({ error: 'Failed to load messages' });
      }
    });

    // Save a message to a chat session
    app.post('/api/chats/:id/messages', async (req, res) => {
      try {
        const { role, content } = req.body as { role: string; content: string };
        const message = await appendMessage(appkit, {
          chatId: req.params.id,
          role,
          content,
        });
        res.status(201).json(message);
      } catch (err) {
        console.error('[chats:save-message]', (err as Error).message);
        res.status(500).json({ error: 'Failed to save message' });
      }
    });
  });
}
