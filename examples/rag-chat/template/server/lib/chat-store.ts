import type { Application } from 'express';

interface AppKitWithLakebase {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

export async function setupChatTables(appkit: AppKitWithLakebase) {
  await appkit.lakebase.query('CREATE SCHEMA IF NOT EXISTS chat');
  await appkit.lakebase.query(`
    CREATE TABLE IF NOT EXISTS chat.chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await appkit.lakebase.query(`
    CREATE TABLE IF NOT EXISTS chat.messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_id UUID NOT NULL REFERENCES chat.chats(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Index creation requires table ownership — skip if we don't own the table
  // (e.g. tables created by the app service principal during deploy)
  try {
    await appkit.lakebase.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at
        ON chat.messages(chat_id, created_at)
    `);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === '42501') {
      console.log('[chat] Skipping index creation — table owned by another identity');
    } else {
      throw err;
    }
  }
}

export async function listChats(appkit: AppKitWithLakebase, userId: string) {
  const result = await appkit.lakebase.query(
    `SELECT id, user_id, title, created_at, updated_at
     FROM chat.chats
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function createChat(appkit: AppKitWithLakebase, input: { userId: string; title: string }) {
  const result = await appkit.lakebase.query(
    `INSERT INTO chat.chats (user_id, title)
     VALUES ($1, $2)
     RETURNING id, user_id, title, created_at, updated_at`,
    [input.userId, input.title]
  );
  return result.rows[0];
}

export async function getChatMessages(appkit: AppKitWithLakebase, chatId: string) {
  const result = await appkit.lakebase.query(
    `SELECT id, chat_id, role, content, created_at
     FROM chat.messages
     WHERE chat_id = $1
     ORDER BY created_at ASC`,
    [chatId]
  );
  return result.rows;
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
  await appkit.lakebase.query(`UPDATE chat.chats SET updated_at = NOW() WHERE id = $1`, [input.chatId]);
  return result.rows[0];
}
