export type Recipe = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  prerequisites?: string[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  tags: string[];
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
  },
  {
    id: "vercel-ai-chat-app",
    name: "AI Chat with Databricks Model Serving",
    description:
      "Build a streaming chat app powered by Databricks AI Gateway (model serving). Uses Vercel AI SDK with an OpenAI-compatible provider pointed at your Databricks serving endpoint, plus AI Elements for the chat UI.",
    tags: ["AI SDK", "AI Gateway", "Model Serving", "Chat"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-data-persistence",
    name: "Lakebase Data Persistence",
    description:
      "Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.",
    tags: ["Lakebase", "Postgres", "CRUD", "Data"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "genie-conversational-analytics",
    name: "Genie Conversational Analytics",
    description:
      "Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the plugin, and render the chat component.",
    tags: ["Genie", "AI/BI", "Natural Language", "Data"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "sql-analytics-dashboard",
    name: "SQL Analytics Dashboard",
    description:
      "Build interactive dashboards with parameterized SQL queries and chart components. Uses the Analytics plugin for SQL Warehouse queries and AppKit UI for visualizations.",
    tags: ["Analytics", "SQL", "Charts", "Dashboard"],
    prerequisites: ["databricks-local-bootstrap"],
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

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    recipeIds: config.recipeIds,
    tags,
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
