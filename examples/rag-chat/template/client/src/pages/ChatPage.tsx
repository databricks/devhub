import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquarePlus, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input, ScrollArea, Separator } from '@databricks/appkit-ui/react';

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
    api: '/api/chat',
    body: () => (chatIdRef.current ? { chatId: chatIdRef.current } : {}),
    headers: { 'Content-Type': 'application/json' },
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
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-medium">
          Retrieved context ({sources.length} source{sources.length !== 1 ? 's' : ''})
        </span>
      </button>
      {expanded && (
        <div className="space-y-2 border-t px-3 py-2">
          {sources.map((source) => (
            <div key={source.index} className="rounded border bg-background p-2">
              <div className="mb-1 flex items-center justify-between text-muted-foreground">
                <span className="font-medium">Source {source.index}</span>
                <span>similarity: {(Number(source.similarity) * 100).toFixed(1)}%</span>
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap text-foreground">{source.content}</p>
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
  // Map from assistant message index to its RAG sources
  const [sourcesMap, setSourcesMap] = useState<Record<string, RagSource[]>>({});

  const [input, setInput] = useState('');
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: transportRef.current,
  });

  // Fetch chat list
  const loadChats = useCallback(async () => {
    const res = await fetch('/api/chats');
    if (res.ok) setChats(await res.json());
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  // Keep chatIdRef in sync with chatId state
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Load messages for selected chat
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
        role: m.role as 'user' | 'assistant',
        content: m.content,
        parts: [{ type: 'text' as const, text: m.content }],
        createdAt: new Date(m.created_at),
      }));
      setMessages(restored);
    },
    [setMessages]
  );

  // Start new chat
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

      // If this is a new conversation, create the chat session first
      if (!activeChatId) {
        const title = text.slice(0, 80);
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) return;
        const chat: ChatSession = await res.json();
        activeChatId = chat.id;
        setChatId(activeChatId);
        // Update ref immediately so the transport reads the correct chatId
        chatIdRef.current = activeChatId;
      }

      // Fetch RAG sources for this query in parallel with sending the message
      const sourcesPromise = fetch(`/api/chat/sources?q=${encodeURIComponent(text)}`)
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => [] as RagSource[]);

      await sendMessage({ text });
      setInput('');

      // Store sources keyed by the current message count (the assistant response index)
      const sources: RagSource[] = await sourcesPromise;
      if (sources.length > 0) {
        // The assistant message will be at the current messages length + 1
        // (user message was just added at length, assistant at length+1)
        // We key by the user message text as a stable identifier
        setSourcesMap((prev) => ({ ...prev, [text]: sources }));
      }

      // Refresh the sidebar chat list
      void loadChats();
    },
    [input, chatId, sendMessage, setInput, loadChats]
  );

  // Build a lookup: for each assistant message, find the preceding user message's sources
  function getSourcesForAssistantMessage(index: number): RagSource[] {
    if (index === 0) return [];
    const prevMessage = messages[index - 1];
    if (!prevMessage || prevMessage.role !== 'user') return [];
    const userText =
      prevMessage.parts
        ?.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';
    return sourcesMap[userText] || [];
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="flex w-72 flex-col border-r bg-muted/30">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-foreground">Lakehouse Knowledge Assistant</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask questions about Databricks, Spark, Delta Lake, and the lakehouse.
            </p>
          </div>
          <div className="px-4 pb-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={startNewChat}>
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
                      ? 'bg-primary/10 font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
              {chats.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">No previous chats</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground"
          >
            {sidebarOpen ? '\u2190' : '\u2192'}
          </Button>
          <h1 className="text-sm font-semibold text-foreground">RAG Chat</h1>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-medium text-foreground">Lakehouse Knowledge Assistant</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask questions about Databricks, Apache Spark, Delta Lake, and the data lakehouse. Answers are grounded
                  in a curated knowledge base.
                </p>
              </div>
            )}
            {messages.map((message, msgIndex) => (
              <div key={message.id} className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </p>
                {message.role === 'assistant' && <SourcesDisplay sources={getSourcesForAssistantMessage(msgIndex)} />}
                {message.parts.map((part, index) =>
                  part.type === 'text' ? (
                    <p key={`${message.id}-${index}`} className="whitespace-pre-wrap text-sm">
                      {part.text}
                    </p>
                  ) : null
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form className="mx-auto flex max-w-3xl gap-2" onSubmit={handleSubmit}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={status !== 'ready'}
            />
            <Button type="submit" disabled={status !== 'ready' || !input.trim()}>
              {status === 'submitted' || status === 'streaming' ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
