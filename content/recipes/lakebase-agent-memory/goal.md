## Lakebase Agent Memory

Persist AI agent chat conversations to Lakebase so users can resume sessions, view full message history, and let the agent reason over previous turns across requests and deploys.

When done, you will have:

- A relational schema (chats and messages tables) in Lakebase for storing conversations
- Durable persistence of every chat turn: user input, assistant replies, and tool calls
- An app where users can return to previous chat sessions and continue where they left off
- Agent memory that survives restarts, deploys, and machine changes
