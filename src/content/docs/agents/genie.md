---
title: Genie Agents
sidebar_label: Genie
description: Embed a chat interface over Unity Catalog tables with the AppKit Genie plugin and GenieChat component. No text-to-SQL code, no prompts, no custom LLM.
sourceOfTruth:
  skills:
    - databricks-genie-agents
  docs:
    - /docs/appkit/v0/plugins/genie
    - https://docs.databricks.com/aws/en/genie-agents/
---

# Genie Agents

Give your users a chat box that queries your data. No text-to-SQL, no schema mapping, no custom LLM. A **Genie Agent** (formerly Genie space) is a Databricks natural-language interface over Unity Catalog tables: curated datasets plus a knowledge store (synonyms, example SQL, column descriptions) plus a compound AI system that turns questions into SQL. Your AppKit app wires it in with one plugin on the server and one component on the page.

To try a Genie Agent in the workspace before you embed it, see [Use a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/talk-to-genie). To build or manage one from your coding agent, use the [`databricks-genie-agents`](/docs/tools/ai-tools/agent-skills) agent skill.

:::note[Genie Agents in the Genie family]

Genie is a family of Databricks products: Genie One, Genie Agents, and Genie Code. This page covers Genie Agents, the natural-language interface over your Unity Catalog tables, and how to embed one in an AppKit app. For the other products, see the [Genie overview](https://docs.databricks.com/aws/en/genie/).

:::

## Prerequisites

- Databricks CLI `v1.0.0+` with an [authenticated profile](/docs/tools/databricks-cli#authenticate).
- A running AppKit app. See [Apps quickstart](/docs/apps/quickstart).
- A Genie Agent configured on Unity Catalog tables. See [Create and manage a Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) for setup.

  Attach the agent as a resource in the app's configuration (UI or CLI) with **Can run** selected, and Databricks grants your app's service principal that permission. `app.yaml` then binds the resource to an env var. End-user permissions are covered [below](#permissions-and-data-access).

## Why Genie

From question to result, Genie:

- **Understands your schema** from Unity Catalog tables, synonyms, example SQL, and column descriptions.
- **Generates SQL** from natural-language questions, with follow-up clarifications when the prompt is ambiguous.
- **Runs the query** against your warehouse and returns tabular results ready to render.

The [`genie` plugin](/docs/appkit/v0/plugins/genie) wires all of that to your chat UI with SSE streaming, auth, and conversation replay handled.

## Wire the plugin

Register the plugin with one or more space aliases. Alias keys become the `alias` prop on the frontend component.

```typescript title="server/server.ts"
import { createApp, genie, server } from "@databricks/appkit";

await createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.SALES_GENIE_SPACE_ID!,
      },
    }),
  ],
});
```

Bind each alias to a Genie Agent resource in `app.yaml`:

```yaml title="app.yaml"
env:
  - name: SALES_GENIE_SPACE_ID
    valueFrom: genie-space
```

The Databricks Apps runtime injects the space ID from the resource into the env var. Find your space ID in the **Settings** tab of the Genie Agent page in your workspace.

For a single-agent app, skip the `spaces` config entirely and bind the plugin's default env var:

```yaml title="app.yaml"
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

With no `spaces` passed, the plugin reads `DATABRICKS_GENIE_SPACE_ID` and registers it under the `default` alias.

## Render the chat component

```tsx title="client/src/pages/ChatPage.tsx"
import { GenieChat } from "@databricks/appkit-ui/react";

export function ChatPage() {
  return (
    <div style={{ height: 600 }}>
      <GenieChat alias="sales" />
    </div>
  );
}
```

The `alias` prop must match a key in the server's `spaces` config. `<GenieChat>` fills its parent, so give it a fixed-height container or it collapses to zero. The component renders messages, handles streaming, persists the conversation ID in the URL, and replays history on reload. See the [GenieChat reference](/docs/appkit/v0/api/appkit-ui/genie/GenieChat) for the full prop list.

## Custom UI with `useGenieChat`

For a custom chat UI, use the hook directly. It returns the same message stream plus state for the request lifecycle.

```tsx title="client/src/pages/CustomChat.tsx"
import { useGenieChat } from "@databricks/appkit-ui/react";

export function CustomChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "sales",
  });

  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} data-role={msg.role}>
          {msg.content}
        </div>
      ))}
      <button
        onClick={() => sendMessage("What were total sales last quarter?")}
        disabled={status === "streaming"}
      >
        Ask
      </button>
      <button onClick={reset}>New conversation</button>
    </>
  );
}
```

`status` cycles through `idle`, `streaming`, `loading-history`, `loading-older`, and `error`. Use it to drive loading states in your UI. The hook also returns `error`, `conversationId`, and pagination helpers (`hasPreviousPage`, `isFetchingPreviousPage`, `fetchPreviousPage`). See the [AppKit Genie plugin reference](/docs/appkit/v0/plugins/genie) for the full return type and the [Genie conversation API](https://docs.databricks.com/aws/en/genie-agents/conversation-api) for the underlying REST API.

## Multiple spaces

Register more than one space to let your users switch between domains, for example a sales space and a support space in the same app.

```typescript title="server/server.ts"
genie({
  spaces: {
    sales: process.env.SALES_GENIE_SPACE_ID!,
    support: process.env.SUPPORT_GENIE_SPACE_ID!,
  },
}),
```

Bind each ID to a separate resource in `app.yaml`. See the [Genie Multi-Agent Selector](/templates/genie-multi-space) template for a working UI with agent switching, conversation cleanup, and URL sync.

## Permissions and data access

The `genie` plugin calls the Genie API on behalf of the signed-in user. Both the app's service principal and each end user need access for a request to succeed:

- **App service principal**: `CAN RUN` on the Genie Agent, granted when you attach the agent as an app resource (UI or CLI) with **Can run** selected. Permissions on the underlying data are not auto-provisioned: grant the service principal `USE CATALOG`, `USE SCHEMA`, and `SELECT` on the Unity Catalog tables separately. See [Add a Genie Agent resource to an app](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/genie).
- **End users**: access to the Genie Agent (shared with them or via a group) and `SELECT` on the same tables. If the user doesn't have access, the call returns a 403. You don't write the permission check.

## Where to next

Try the [Genie Analytics App](/templates/genie-analytics-app) for a complete wired setup, or explore [Custom agent endpoints](/docs/agents/custom-agents) for Knowledge Assistants and Supervisor Agents.
