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
    id: "ai-chat-model-serving",
    name: "Streaming AI Chat with Model Serving",
    description:
      "Build a streaming AI chat experience using AI SDK and Databricks Model Serving endpoints.",
    tags: ["AI", "Chat", "AI SDK", "Model Serving"],
    prerequisites: [
      "databricks-local-bootstrap",
      "lakebase-data-persistence",
      "foundation-models-api",
    ],
  },
  {
    id: "foundation-models-api",
    name: "Query AI Gateway Endpoints",
    description:
      "Query AI Gateway endpoints for production-ready access to foundation models with built-in governance.",
    tags: ["AI", "AI Gateway", "Foundation Models"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "model-serving-endpoint-creation",
    name: "Create a Databricks Model Serving endpoint",
    description:
      "Create and validate a Databricks Model Serving endpoint for AI chat inference in Databricks Apps.",
    tags: ["Model Serving", "AI Gateway", "Endpoints", "Inference"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-chat-persistence",
    name: "Lakebase Chat Persistence",
    description:
      "Persist chat sessions and messages in Lakebase so users can resume chat history across requests and deployments.",
    tags: ["Lakebase", "Postgres", "Chat", "Persistence"],
    prerequisites: ["lakebase-data-persistence", "ai-chat-model-serving"],
  },
  {
    id: "lakebase-create-instance",
    name: "Create a Lakebase Instance",
    description:
      "Provision a managed Lakebase Postgres project on Databricks and collect the connection values needed by downstream recipes.",
    tags: ["Lakebase", "Postgres", "Setup"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-data-persistence",
    name: "Lakebase Data Persistence",
    description:
      "Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.",
    tags: ["Lakebase", "Postgres", "CRUD", "Data"],
    prerequisites: ["databricks-local-bootstrap", "lakebase-create-instance"],
  },
  {
    id: "etl-lakehouse-sync-autoscaling",
    name: "ETL: Sync Lakebase to Unity Catalog (Autoscaling)",
    description:
      "Replicate Lakebase Autoscaling Postgres tables into Unity Catalog as managed Delta tables using Lakehouse Sync, with CDC and SCD Type 2 history.",
    tags: [
      "Lakebase",
      "Lakehouse Sync",
      "Unity Catalog",
      "ETL",
      "CDC",
      "Delta",
    ],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "reverse-etl-synced-tables-autoscaling",
    name: "Reverse ETL: Unity Catalog to Lakebase (Autoscaling)",
    description:
      "Sync Unity Catalog tables into Lakebase Autoscaling Postgres as synced tables for sub-10ms application queries, with snapshot, triggered, or continuous modes.",
    tags: ["Lakebase", "Reverse ETL", "Unity Catalog", "Synced Tables", "CDF"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "genie-conversational-analytics",
    name: "Genie Conversational Analytics",
    description:
      "Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up server and client plugins, declare app resources, and deploy.",
    tags: ["Genie", "AI/BI", "Natural Language", "Analytics"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-off-platform-env-management",
    name: "Lakebase Env Management for Off-Platform Apps",
    description:
      "Define and validate cross-platform environment variables for Lakebase-backed apps deployed outside Databricks App Platform.",
    tags: ["Lakebase", "Environment Variables", "AWS", "Vercel", "Netlify"],
  },
  {
    id: "lakebase-token-management",
    name: "Lakebase Token Management",
    description:
      "Implement cached workspace and Lakebase credential token flows for secure Postgres access in off-platform deployments.",
    tags: ["Lakebase", "OAuth", "Tokens", "Security"],
    prerequisites: ["lakebase-off-platform-env-management"],
  },
  {
    id: "lakebase-drizzle-off-platform",
    name: "Drizzle + Lakebase in an Off-Platform App",
    description:
      "Connect Drizzle ORM to Lakebase with pg password callbacks and migration-time temporary DATABASE_URL credentials.",
    tags: ["Lakebase", "Drizzle", "Postgres", "ORM"],
    prerequisites: ["lakebase-token-management"],
  },
];

const recipeIndex: Record<string, Recipe> = Object.fromEntries(
  recipes.map((recipe) => [recipe.id, recipe]),
);

export const recipesInOrder: Recipe[] = [
  "databricks-local-bootstrap",
  "lakebase-create-instance",
  "lakebase-data-persistence",
  "foundation-models-api",
  "model-serving-endpoint-creation",
  "ai-chat-model-serving",
  "lakebase-chat-persistence",
  "etl-lakehouse-sync-autoscaling",
  "reverse-etl-synced-tables-autoscaling",
  "genie-conversational-analytics",
  "lakebase-off-platform-env-management",
  "lakebase-token-management",
  "lakebase-drizzle-off-platform",
].map((recipeId) => {
  const recipe = recipeIndex[recipeId];
  if (!recipe) {
    throw new Error(`Unknown recipe id in recipesInOrder: ${recipeId}`);
  }
  return recipe;
});

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
      "Databricks local bootstrap, Model Serving integration, AI SDK streaming chat, and Lakebase-persisted chat history.",
    recipeIds: [
      "databricks-local-bootstrap",
      "foundation-models-api",
      "ai-chat-model-serving",
      "lakebase-create-instance",
      "lakebase-data-persistence",
      "lakebase-chat-persistence",
    ],
  }),
  createTemplate({
    id: "data-app-template",
    name: "Data App Template",
    description:
      "Bootstrap a Databricks app with Lakebase for persistent data storage. Includes schema setup and full CRUD API routes.",
    recipeIds: [
      "databricks-local-bootstrap",
      "lakebase-create-instance",
      "lakebase-data-persistence",
    ],
  }),
  createTemplate({
    id: "genie-analytics-app-template",
    name: "Genie Analytics App Template",
    description:
      "Bootstrap a Databricks app with AI/BI Genie for conversational analytics. Users ask natural-language questions and get instant answers from their data.",
    recipeIds: ["databricks-local-bootstrap", "genie-conversational-analytics"],
  }),
  createTemplate({
    id: "lakebase-off-platform-template",
    name: "Lakebase Outside Databricks App Platform",
    description:
      "Use Lakebase from apps hosted outside Databricks App Platform (for example on AWS, Vercel, or Netlify) with portable env, token, and Drizzle patterns.",
    recipeIds: [
      "lakebase-create-instance",
      "lakebase-off-platform-env-management",
      "lakebase-token-management",
      "lakebase-drizzle-off-platform",
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
