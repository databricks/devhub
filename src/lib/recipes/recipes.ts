type RecipeStep = {
  id: string;
  title: string;
  details?: string;
  command?: string;
};

type Recipe = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  prerequisites?: string[];
  steps: RecipeStep[];
  references?: Array<{
    label: string;
    href: string;
  }>;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  tags: string[];
  steps: RecipeStep[];
};

type TemplatePreviewItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
};

export const recipes: Recipe[] = [
  {
    id: "databricks-local-bootstrap",
    name: "Databricks Local Bootstrap",
    description:
      "Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.",
    tags: ["Databricks CLI", "Setup", "Agent Skills"],
    steps: [
      {
        id: "check-cli",
        title: "Verify Databricks CLI version",
        command: "databricks --version",
        details:
          "Use Databricks CLI 0.292+ before running setup and app scaffolding commands.",
      },
      {
        id: "install-cli",
        title: "Install or upgrade Databricks CLI (if needed)",
        command: "brew tap databricks/tap && brew install databricks",
        details:
          "On Linux/Windows use the official installer alternatives from Databricks docs.",
      },
      {
        id: "auth-login",
        title: "Authenticate to your Databricks workspace",
        command: "databricks auth login --host <workspace-url>",
      },
      {
        id: "select-profile",
        title: "List and select profile",
        command: "databricks auth profiles",
        details: "Always run workspace commands with --profile <PROFILE>.",
      },
      {
        id: "scaffold-app",
        title: "Scaffold a new Databricks app folder",
        command:
          'databricks apps init --name <app-name> --description "<desc>" --run none --profile <PROFILE>',
        details:
          "This creates a new workspace folder for app development and skips auto-run so code can be reviewed first.",
      },
      {
        id: "install-skills",
        title: "Install Databricks agent skills",
        command: "npx skills add databricks/databricks-agent-skills --all",
        details:
          "--all installs all skills to all detected agents with confirmation skipped.",
      },
      {
        id: "verify-skills",
        title: "Verify installed skills",
        command: "npx skills list",
      },
    ],
    references: [
      {
        label: "Databricks CLI install",
        href: "https://docs.databricks.com/en/dev-tools/cli/install",
      },
      {
        label: "Databricks CLI authentication",
        href: "https://docs.databricks.com/en/dev-tools/cli/authentication.html",
      },
    ],
  },
  {
    id: "vercel-ai-chat-app",
    name: "AI Chat with Databricks Model Serving",
    description:
      "Build a streaming chat app powered by Databricks AI Gateway (model serving). Uses Vercel AI SDK with an OpenAI-compatible provider pointed at your Databricks serving endpoint, plus AI Elements for the chat UI.",
    tags: ["AI SDK", "AI Gateway", "Model Serving", "Chat"],
    prerequisites: ["databricks-local-bootstrap"],
    steps: [
      {
        id: "list-serving-endpoints",
        title: "Identify your model serving endpoint",
        command:
          "databricks serving-endpoints list --profile <PROFILE> -o json",
        details:
          "List available serving endpoints in your workspace. Pick the endpoint name you want to use for chat (e.g. a foundation model endpoint or a custom model endpoint). You can also check a specific endpoint with:\n\ndatabricks serving-endpoints get <endpoint-name> --profile <PROFILE>",
      },
      {
        id: "install-ai-sdk",
        title: "Install AI SDK and the OpenAI-compatible provider",
        command: "bun add ai @ai-sdk/react @ai-sdk/openai-compatible",
      },
      {
        id: "install-ai-elements",
        title: "Install AI Elements UI components",
        command: "bunx shadcn@latest add @ai-elements/all",
      },
      {
        id: "set-provider-env",
        title: "Configure Databricks environment variables",
        command:
          "echo 'DATABRICKS_HOST=https://<workspace>.cloud.databricks.com\\nDATABRICKS_TOKEN=<your-token>\\nDATABRICKS_SERVING_ENDPOINT=<endpoint-name>' >> .env",
        details:
          "DATABRICKS_HOST is your workspace URL. DATABRICKS_TOKEN is a personal access token or service principal token. DATABRICKS_SERVING_ENDPOINT is the name of the model serving endpoint you identified in step 1.",
      },
      {
        id: "create-provider",
        title: "Create the Databricks AI provider",
        details:
          'Create a provider module that connects AI SDK to your Databricks model serving endpoint using the OpenAI-compatible interface:\n\nimport { createOpenAICompatible } from "@ai-sdk/openai-compatible";\n\nconst databricks = createOpenAICompatible({\n  name: "databricks",\n  baseURL: `${process.env.DATABRICKS_HOST}/serving-endpoints`,\n  headers: {\n    Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,\n  },\n});\n\nexport const chatModel = databricks.chatModel(\n  process.env.DATABRICKS_SERVING_ENDPOINT!\n);',
      },
      {
        id: "create-chat-route",
        title: "Create a streaming chat API route",
        details:
          'Implement a /api/chat route that streams responses from your Databricks model serving endpoint:\n\nimport { streamText } from "ai";\nimport { chatModel } from "./provider";\n\napp.post("/api/chat", async (req, res) => {\n  const { messages } = req.body;\n  const result = streamText({\n    model: chatModel,\n    messages,\n  });\n  result.pipeDataStreamToResponse(res);\n});',
      },
      {
        id: "create-chat-ui",
        title: "Create the chat UI with useChat and AI Elements",
        details:
          'Use the useChat hook for streaming and AI Elements components for the chat interface:\n\nimport { useChat } from "@ai-sdk/react";\n\nexport function ChatPage() {\n  const { messages, input, handleInputChange, handleSubmit } = useChat();\n\n  return (\n    <div className="flex flex-col h-[600px]">\n      <div className="flex-1 overflow-y-auto space-y-4 p-4">\n        {messages.map((m) => (\n          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>\n            <span className="text-sm font-medium">\n              {m.role === "user" ? "You" : "Assistant"}\n            </span>\n            <p>{m.content}</p>\n          </div>\n        ))}\n      </div>\n      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">\n        <input\n          value={input}\n          onChange={handleInputChange}\n          placeholder="Ask a question..."\n          className="flex-1 border rounded px-3 py-2"\n        />\n        <button type="submit">Send</button>\n      </form>\n    </div>\n  );\n}',
      },
      {
        id: "run-and-test",
        title: "Run and test locally",
        command: "bun run dev",
        details:
          "Open the chat page in your browser and send a message. Responses stream from your Databricks model serving endpoint through the AI SDK.",
      },
    ],
    references: [
      {
        label: "AI Gateway docs",
        href: "https://docs.databricks.com/en/ai-gateway/",
      },
      {
        label: "Model Serving endpoints",
        href: "https://docs.databricks.com/en/machine-learning/model-serving/create-manage-serving-endpoints.html",
      },
      {
        label: "AI SDK OpenAI-compatible providers",
        href: "https://ai-sdk.dev/providers/openai-compatible-providers",
      },
      {
        label: "AI Elements docs",
        href: "https://ui.shadcn.com/docs/registry/ai-elements",
      },
    ],
  },
  {
    id: "lakebase-data-persistence",
    name: "Lakebase Data Persistence",
    description:
      "Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.",
    tags: ["Lakebase", "Postgres", "CRUD", "Data"],
    prerequisites: ["databricks-local-bootstrap"],
    steps: [
      {
        id: "enable-lakebase-plugin",
        title: "Enable the Lakebase plugin",
        details:
          'Add the lakebase plugin to your server entry point. Use autoStart: false on the server plugin so you can run database setup before accepting requests:\n\nimport { createApp, server, lakebase } from "@databricks/appkit";\n\ncreateApp({ plugins: [server({ autoStart: false }), lakebase()] })\n  .then(async (appkit) => {\n    // setup routes then start\n    await appkit.server.start();\n  })\n  .catch(console.error);',
      },
      {
        id: "define-schema",
        title: "Define your database schema",
        details:
          "Create a schema and table using raw SQL. Lakebase provides a Postgres-compatible interface through appkit.lakebase.query():\n\nconst SETUP_SCHEMA = `CREATE SCHEMA IF NOT EXISTS app`;\n\nconst CREATE_TABLE = `\n  CREATE TABLE IF NOT EXISTS app.items (\n    id SERIAL PRIMARY KEY,\n    title TEXT NOT NULL,\n    completed BOOLEAN NOT NULL DEFAULT false,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n  )\n`;\n\nawait appkit.lakebase.query(SETUP_SCHEMA);\nawait appkit.lakebase.query(CREATE_TABLE);",
      },
      {
        id: "create-crud-routes",
        title: "Create CRUD API routes",
        details:
          'Use appkit.server.extend() to register Express routes that call appkit.lakebase.query() with parameterized SQL:\n\nappkit.server.extend((app) => {\n  app.get("/api/items", async (_req, res) => {\n    const { rows } = await appkit.lakebase.query(\n      "SELECT * FROM app.items ORDER BY created_at DESC"\n    );\n    res.json(rows);\n  });\n\n  app.post("/api/items", async (req, res) => {\n    const { rows } = await appkit.lakebase.query(\n      "INSERT INTO app.items (title) VALUES ($1) RETURNING *",\n      [req.body.title]\n    );\n    res.status(201).json(rows[0]);\n  });\n\n  app.patch("/api/items/:id", async (req, res) => {\n    const { rows } = await appkit.lakebase.query(\n      "UPDATE app.items SET completed = NOT completed WHERE id = $1 RETURNING *",\n      [req.params.id]\n    );\n    res.json(rows[0]);\n  });\n\n  app.delete("/api/items/:id", async (req, res) => {\n    await appkit.lakebase.query("DELETE FROM app.items WHERE id = $1", [req.params.id]);\n    res.status(204).send();\n  });\n});',
      },
      {
        id: "wire-up-server",
        title: "Wire up schema setup and start the server",
        details:
          "Run the schema setup before registering routes and starting the server:\n\ncreateApp({ plugins: [server({ autoStart: false }), lakebase()] })\n  .then(async (appkit) => {\n    await appkit.lakebase.query(SETUP_SCHEMA);\n    await appkit.lakebase.query(CREATE_TABLE);\n    registerRoutes(appkit);\n    await appkit.server.start();\n  })\n  .catch(console.error);",
      },
      {
        id: "test-lakebase",
        title: "Run and test locally",
        command: "bun run dev",
        details:
          "Verify the endpoints with curl:\n\ncurl -X POST http://localhost:3000/api/items -H 'Content-Type: application/json' -d '{\"title\":\"My first item\"}'\ncurl http://localhost:3000/api/items",
      },
    ],
    references: [
      {
        label: "Lakebase plugin docs",
        href: "https://databricks.github.io/appkit/docs/plugins/lakebase",
      },
      {
        label: "Lakebase database permissions",
        href: "https://databricks.github.io/appkit/docs/plugins/lakebase#database-permissions",
      },
      {
        label: "What is a Lakebase?",
        href: "/solutions/what-is-a-lakebase",
      },
    ],
  },
  {
    id: "genie-conversational-analytics",
    name: "Genie Conversational Analytics",
    description:
      "Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the plugin, and render the chat component.",
    tags: ["Genie", "AI/BI", "Natural Language", "Data"],
    prerequisites: ["databricks-local-bootstrap"],
    steps: [
      {
        id: "create-genie-space",
        title: "Create a Genie space in your Databricks workspace",
        details:
          "Open your Databricks workspace, navigate to AI/BI Genie, and create a new Genie space connected to your data tables. Copy the space ID from the URL — you will need it for configuration.",
      },
      {
        id: "set-genie-env",
        title: "Set the Genie space environment variable",
        command: "echo 'DATABRICKS_GENIE_SPACE_ID=<your-space-id>' >> .env",
        details:
          "Add your Genie space ID to the environment. The Genie plugin reads this value to connect to the right space.",
      },
      {
        id: "enable-genie-plugin",
        title: "Enable the Genie plugin",
        details:
          'Add the genie plugin to your server entry point:\n\nimport { createApp, server, genie } from "@databricks/appkit";\n\ncreateApp({\n  plugins: [\n    server(),\n    genie({ spaces: { default: process.env.DATABRICKS_GENIE_SPACE_ID } }),\n  ],\n}).catch(console.error);',
      },
      {
        id: "add-genie-chat-ui",
        title: "Add the GenieChat component to a page",
        details:
          'Import GenieChat from @databricks/appkit-ui and render it in a container:\n\nimport { GenieChat } from "@databricks/appkit-ui/react";\n\nexport function GeniePage() {\n  return (\n    <div className="h-[600px] border rounded-lg overflow-hidden">\n      <GenieChat alias="default" />\n    </div>\n  );\n}',
      },
      {
        id: "test-genie",
        title: "Run and test locally",
        command: "bun run dev",
        details:
          "Open the Genie page in your browser and ask a natural-language question about your data to verify the integration.",
      },
    ],
    references: [
      {
        label: "Genie plugin docs",
        href: "https://databricks.github.io/appkit/docs/plugins/genie",
      },
      {
        label: "AI/BI Genie documentation",
        href: "https://docs.databricks.com/en/genie/index.html",
      },
    ],
  },
  {
    id: "sql-analytics-dashboard",
    name: "SQL Analytics Dashboard",
    description:
      "Build interactive dashboards with parameterized SQL queries and chart components. Uses the Analytics plugin for SQL Warehouse queries and AppKit UI for visualizations.",
    tags: ["Analytics", "SQL", "Charts", "Dashboard"],
    prerequisites: ["databricks-local-bootstrap"],
    steps: [
      {
        id: "enable-analytics-plugin",
        title: "Enable the Analytics plugin",
        details:
          'Add the analytics plugin to your server entry point:\n\nimport { createApp, server, analytics } from "@databricks/appkit";\n\ncreateApp({\n  plugins: [server(), analytics()],\n}).catch(console.error);',
      },
      {
        id: "create-sql-queries",
        title: "Create parameterized SQL query files",
        details:
          "Add .sql files under config/queries/. Use :param_name for parameters and @param annotations for type safety:\n\nconfig/queries/monthly_metrics.sql:\n-- @param max_month_num number\nSELECT month, revenue, users\nFROM app.monthly_metrics\nWHERE month_num <= :max_month_num\nORDER BY month_num;",
      },
      {
        id: "build-dashboard-ui",
        title: "Build the dashboard UI with charts",
        details:
          'Import useAnalyticsQuery for data fetching and chart components for visualization:\n\nimport {\n  useAnalyticsQuery, AreaChart, LineChart, BarChart,\n  Card, CardContent, CardHeader, CardTitle,\n} from "@databricks/appkit-ui/react";\nimport { sql } from "@databricks/appkit-ui/js";\nimport { useState } from "react";\n\nexport function DashboardPage() {\n  const [maxMonth, setMaxMonth] = useState(12);\n  const params = { max_month_num: sql.number(maxMonth) };\n\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\n      <Card>\n        <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>\n        <CardContent>\n          <AreaChart queryKey="monthly_metrics" parameters={params} />\n        </CardContent>\n      </Card>\n      <Card>\n        <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>\n        <CardContent>\n          <LineChart queryKey="monthly_metrics" parameters={params} />\n        </CardContent>\n      </Card>\n    </div>\n  );\n}',
      },
      {
        id: "add-filters",
        title: "Add interactive filters with typed parameters",
        details:
          'Use sql.string() and sql.number() helpers for type-safe query parameters. Bind them to UI controls like Select or Input to let users filter the dashboard interactively:\n\nconst params = {\n  region: sql.string(selectedRegion),\n  max_month_num: sql.number(maxMonth),\n};',
      },
      {
        id: "test-analytics",
        title: "Run and test locally",
        command: "bun run dev",
        details:
          "Open the dashboard page and verify that charts render with data from your SQL Warehouse. Adjust filters to see the queries update.",
      },
    ],
    references: [
      {
        label: "Analytics plugin docs",
        href: "https://databricks.github.io/appkit/docs/plugins/analytics",
      },
      {
        label: "AppKit chart components",
        href: "https://databricks.github.io/appkit/docs/category/charts",
      },
      {
        label: "SQL Warehouses",
        href: "https://docs.databricks.com/en/compute/sql-warehouse/index.html",
      },
    ],
  },
];

const recipeIndex: Record<string, Recipe> = Object.fromEntries(
  recipes.map((recipe) => [recipe.id, recipe]),
);

type TemplateConfig = {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
};

function createTemplate(config: TemplateConfig): Template {
  const selectedRecipes = config.recipeIds.map((recipeId) => {
    const recipe = recipeIndex[recipeId];
    if (!recipe) {
      throw new Error(`Unknown recipe id: ${recipeId}`);
    }
    return recipe;
  });

  const tags = [...new Set(selectedRecipes.flatMap((recipe) => recipe.tags))];
  const steps = selectedRecipes.flatMap((recipe) => recipe.steps);

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    recipeIds: config.recipeIds,
    tags,
    steps,
  };
}

export const templates: Template[] = [
  createTemplate({
    id: "base-app-template",
    name: "Base App Template",
    description:
      "Databricks local bootstrap template for CLI, auth, app scaffolding, and agent skill setup.",
    recipeIds: ["databricks-local-bootstrap"],
  }),
  createTemplate({
    id: "ai-chat-app-template",
    name: "AI Chat App Template",
    description:
      "Databricks local bootstrap plus a streaming AI chat powered by Databricks Model Serving (AI Gateway) with AI SDK and AI Elements.",
    recipeIds: ["databricks-local-bootstrap", "vercel-ai-chat-app"],
  }),
  createTemplate({
    id: "data-app-template",
    name: "Data App Template",
    description:
      "Bootstrap a Databricks app with Lakebase for persistent data storage. Includes schema setup and full CRUD API routes.",
    recipeIds: ["databricks-local-bootstrap", "lakebase-data-persistence"],
  }),
  createTemplate({
    id: "analytics-dashboard-app-template",
    name: "Analytics Dashboard App Template",
    description:
      "Build an interactive analytics dashboard backed by Lakebase and powered by parameterized SQL queries and chart components.",
    recipeIds: [
      "databricks-local-bootstrap",
      "lakebase-data-persistence",
      "sql-analytics-dashboard",
    ],
  }),
  createTemplate({
    id: "ai-data-explorer-template",
    name: "AI Data Explorer Template",
    description:
      "A full-stack data application with Lakebase persistence, AI chat powered by Databricks Model Serving, and Genie natural-language data exploration.",
    recipeIds: [
      "databricks-local-bootstrap",
      "lakebase-data-persistence",
      "vercel-ai-chat-app",
      "genie-conversational-analytics",
    ],
  }),
];

export const templatePreviewItems: TemplatePreviewItem[] = templates.map(
  (template) => ({
    id: template.id,
    path: `/resources/${template.id}`,
    title: template.name,
    description: template.description,
    tags: template.tags,
  }),
);
