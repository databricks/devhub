export const SERVICES = [
  "Agent Bricks",
  "AI Gateway",
  "Databricks Apps",
  "Genie",
  "Lakebase",
  "Lakeflow Pipelines",
  "Model Serving",
  "Unity Catalog",
] as const;

export type Service = (typeof SERVICES)[number];

/**
 * Theme-aware preview image pair shared by Recipe, Cookbook, and Example.
 *
 * Rendered on: landing carousel card, /templates list card, and the example
 * detail hero when no galleryImages are set. When both URLs are omitted the UI
 * falls back to the generic template card art (FallbackCardArt).
 *
 * Image contract (enforced by `npm run verify:images`):
 *   - 16:9 aspect ratio, minimum 1600x900 px
 *   - PNG / JPG / WEBP (rasters). SVGs are not valid preview images.
 *   - Provide both light and dark variants (or neither, to fall back).
 */
export type PreviewImages = {
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
};

/** One slide in an Example detail-page carousel. Same 16:9 / ≥1600x900 contract. */
export type GalleryImage = {
  lightUrl: string;
  darkUrl: string;
};

export type Recipe = PreviewImages & {
  id: string;
  name: string;
  description: string;
  tags: string[];
  services: Service[];
  prerequisites?: string[];
  isDraft?: boolean;
  /** When true, the recipe is still usable by cookbooks and examples but hidden from the /templates listing page. */
  unlisted?: boolean;
};

export type Cookbook = PreviewImages & {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  tags: string[];
  services: Service[];
  isDraft?: boolean;
};

type CookbookPreviewItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
  services?: Service[];
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
};

export const recipes: Recipe[] = [
  {
    id: "databricks-local-bootstrap",
    name: "Databricks Local Bootstrap",
    description:
      "Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.",
    tags: ["Databricks CLI", "Setup", "Agent Skills"],
    services: ["Databricks Apps"],
    previewImageLightUrl:
      "/img/guides/databricks-local-bootstrap-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/databricks-local-bootstrap-preview-dark.png",
  },
  {
    id: "ai-chat-model-serving",
    name: "Streaming AI Chat with Model Serving",
    description:
      "Build a streaming AI chat experience using AI SDK and Databricks Model Serving endpoints.",
    tags: ["AI", "Chat", "AI SDK", "Model Serving"],
    services: ["Databricks Apps", "Model Serving"],
    previewImageLightUrl: "/img/guides/ai-chat-model-serving-preview-light.png",
    previewImageDarkUrl: "/img/guides/ai-chat-model-serving-preview-dark.png",
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
    services: ["AI Gateway"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl: "/img/guides/foundation-models-api-preview-light.png",
    previewImageDarkUrl: "/img/guides/foundation-models-api-preview-dark.png",
  },
  {
    id: "embeddings-generation",
    name: "Generate Embeddings with AI Gateway",
    description:
      "Generate text embeddings from a Databricks AI Gateway endpoint using the Databricks SDK.",
    tags: ["AI", "AI Gateway", "Embeddings"],
    services: ["AI Gateway"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl: "/img/guides/embeddings-generation-preview-light.png",
    previewImageDarkUrl: "/img/guides/embeddings-generation-preview-dark.png",
  },
  {
    id: "model-serving-endpoint-creation",
    name: "Create a Databricks Model Serving endpoint",
    description:
      "Create and validate a Databricks Model Serving endpoint for AI chat inference in Databricks Apps.",
    tags: ["Model Serving", "AI Gateway", "Endpoints", "Inference"],
    services: ["Model Serving", "AI Gateway"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/model-serving-endpoint-creation-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/model-serving-endpoint-creation-preview-dark.png",
  },
  {
    id: "lakebase-chat-persistence",
    name: "Lakebase Chat Persistence",
    description:
      "Persist chat sessions and messages in Lakebase so users can resume chat history across requests and deployments.",
    tags: ["Lakebase", "Postgres", "Chat", "Persistence"],
    services: ["Lakebase", "Databricks Apps"],
    prerequisites: ["lakebase-data-persistence", "ai-chat-model-serving"],
    previewImageLightUrl:
      "/img/guides/lakebase-chat-persistence-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-chat-persistence-preview-dark.png",
  },
  {
    id: "lakebase-create-instance",
    name: "Create a Lakebase Instance",
    description:
      "Provision a managed Lakebase Postgres project on Databricks and collect the connection values needed by downstream templates.",
    tags: ["Lakebase", "Postgres", "Setup"],
    services: ["Lakebase"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/lakebase-create-instance-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-create-instance-preview-dark.png",
  },
  {
    id: "lakebase-data-persistence",
    name: "Lakebase Data Persistence",
    description:
      "Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.",
    tags: ["Lakebase", "Postgres", "CRUD", "Data"],
    services: ["Lakebase", "Databricks Apps"],
    prerequisites: ["databricks-local-bootstrap", "lakebase-create-instance"],
    previewImageLightUrl:
      "/img/guides/lakebase-data-persistence-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-data-persistence-preview-dark.png",
  },
  {
    id: "lakebase-pgvector",
    name: "Lakebase pgvector",
    description:
      "Enable vector similarity search in Lakebase using the pgvector extension. Covers extension setup, vector table design, insert and cosine retrieval helpers, and IVFFlat/HNSW index options.",
    tags: ["Lakebase", "Postgres", "pgvector", "Vector Search", "Embeddings"],
    services: ["Lakebase"],
    prerequisites: ["databricks-local-bootstrap", "lakebase-create-instance"],
    previewImageLightUrl: "/img/guides/lakebase-pgvector-preview-light.png",
    previewImageDarkUrl: "/img/guides/lakebase-pgvector-preview-dark.png",
  },
  {
    id: "lakebase-change-data-feed-autoscaling",
    name: "Lakebase Change Data Feed: Sync Lakebase to Unity Catalog (Autoscaling)",
    description:
      "Replicate Lakebase Autoscaling Postgres tables into Unity Catalog as managed Delta tables using Lakehouse Sync, with CDC and SCD Type 2 history.",
    tags: [
      "Lakebase",
      "Lakehouse Sync",
      "Unity Catalog",
      "Lakebase Change Data Feed",
      "CDC",
      "Delta",
    ],
    services: ["Lakebase", "Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/lakebase-change-data-feed-autoscaling-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-change-data-feed-autoscaling-preview-dark.png",
  },
  {
    id: "sync-tables-autoscaling",
    name: "Sync Tables: Unity Catalog to Lakebase (Autoscaling)",
    description:
      "Sync Unity Catalog tables into Lakebase Autoscaling Postgres as synced tables for sub-10ms application queries, with snapshot, triggered, or continuous modes.",
    tags: ["Lakebase", "Sync Tables", "Unity Catalog", "Synced Tables", "CDF"],
    services: ["Lakebase", "Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/sync-tables-autoscaling-preview-light.png",
    previewImageDarkUrl: "/img/guides/sync-tables-autoscaling-preview-dark.png",
  },
  {
    id: "genie-conversational-analytics",
    name: "Genie Conversational Analytics",
    description:
      "Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up server and client plugins, declare app resources, and deploy.",
    tags: ["Genie", "AI/BI", "Natural Language", "Analytics"],
    services: ["Genie", "Databricks Apps"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/genie-conversational-analytics-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/genie-conversational-analytics-preview-dark.png",
  },
  {
    id: "unity-catalog-setup",
    name: "Set Up Unity Catalog with External Storage",
    description:
      "Create a Unity Catalog catalog backed by an external S3 bucket with storage credentials, external location, and a schema ready for lakehouse tables.",
    tags: ["Unity Catalog", "S3", "External Storage", "Setup"],
    services: ["Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl: "/img/guides/unity-catalog-setup-preview-light.png",
    previewImageDarkUrl: "/img/guides/unity-catalog-setup-preview-dark.png",
  },
  {
    id: "genie-multi-space",
    name: "Genie Multi-Space Selector",
    description:
      "Add a space selector so users can switch between multiple AI/BI Genie spaces from a single page. Covers multi-alias server config, per-space bundle resources, and automatic conversation cleanup on space switch and redeployment.",
    tags: ["Genie", "AI/BI", "Natural Language", "Data"],
    services: ["Genie"],
    prerequisites: ["genie-conversational-analytics"],
    previewImageLightUrl: "/img/guides/genie-multi-space-preview-light.png",
    previewImageDarkUrl: "/img/guides/genie-multi-space-preview-dark.png",
  },
  {
    id: "medallion-architecture-from-cdc",
    name: "Medallion Architecture from CDC History Tables",
    description:
      "Transform Lakehouse Sync CDC history tables into a medallion architecture with silver (current state) and gold (aggregations) layers using Lakeflow Declarative Pipelines.",
    tags: [
      "Medallion Architecture",
      "CDC",
      "Lakeflow Pipelines",
      "Silver",
      "Gold",
      "Analytics",
    ],
    services: ["Lakeflow Pipelines"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl:
      "/img/guides/medallion-architecture-from-cdc-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/medallion-architecture-from-cdc-preview-dark.png",
  },
  {
    id: "lakebase-off-platform-env-management",
    name: "Lakebase Env Management for Off-Platform Apps",
    description:
      "Define and validate cross-platform environment variables for Lakebase-backed apps deployed outside Databricks App Platform.",
    tags: ["Lakebase", "Environment Variables", "AWS", "Vercel", "Netlify"],
    services: ["Lakebase"],
    previewImageLightUrl:
      "/img/guides/lakebase-off-platform-env-management-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-off-platform-env-management-preview-dark.png",
  },
  {
    id: "lakebase-token-management",
    name: "Lakebase Token Management",
    description:
      "Implement cached workspace and Lakebase credential token flows for secure Postgres access in off-platform deployments.",
    tags: ["Lakebase", "OAuth", "Tokens", "Security"],
    services: ["Lakebase"],
    prerequisites: ["lakebase-off-platform-env-management"],
    previewImageLightUrl:
      "/img/guides/lakebase-token-management-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-token-management-preview-dark.png",
  },
  {
    id: "lakebase-drizzle-off-platform",
    name: "Drizzle + Lakebase in an Off-Platform App",
    description:
      "Connect Drizzle ORM to Lakebase with pg password callbacks and migration-time temporary DATABASE_URL credentials.",
    tags: ["Lakebase", "Drizzle", "Postgres", "ORM"],
    services: ["Lakebase"],
    prerequisites: ["lakebase-token-management"],
    previewImageLightUrl:
      "/img/guides/lakebase-drizzle-off-platform-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/lakebase-drizzle-off-platform-preview-dark.png",
  },
  {
    id: "volume-file-upload",
    name: "Volume File Manager",
    description:
      "Add file upload, browsing, download, delete, file type validation, and CSV row preview to your Databricks app using Unity Catalog Volumes.",
    tags: ["Volumes", "Unity Catalog", "Files", "Upload", "CSV"],
    services: ["Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
    previewImageLightUrl: "/img/guides/volume-file-upload-preview-light.png",
    previewImageDarkUrl: "/img/guides/volume-file-upload-preview-dark.png",
  },
];

const recipeIndex: Record<string, Recipe> = Object.fromEntries(
  recipes.map((recipe) => [recipe.id, recipe]),
);

export const recipesInOrder: Recipe[] = [
  "databricks-local-bootstrap",
  "lakebase-create-instance",
  "lakebase-data-persistence",
  "lakebase-pgvector",
  "foundation-models-api",
  "embeddings-generation",
  "model-serving-endpoint-creation",
  "ai-chat-model-serving",
  "lakebase-chat-persistence",
  "lakebase-change-data-feed-autoscaling",
  "sync-tables-autoscaling",
  "unity-catalog-setup",
  "genie-conversational-analytics",
  "genie-multi-space",
  "medallion-architecture-from-cdc",
  "lakebase-off-platform-env-management",
  "lakebase-token-management",
  "lakebase-drizzle-off-platform",
  "volume-file-upload",
].map((recipeId) => {
  const recipe = recipeIndex[recipeId];
  if (!recipe) {
    throw new Error(`Unknown recipe id in recipesInOrder: ${recipeId}`);
  }
  return recipe;
});

type CookbookConfig = {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
  isDraft?: boolean;
};

function createCookbook(config: CookbookConfig): Cookbook {
  const selectedRecipes = config.recipeIds.map((recipeId) => {
    const recipe = recipeIndex[recipeId];
    if (!recipe) {
      throw new Error(`Unknown recipe id: ${recipeId}`);
    }
    return recipe;
  });

  const tags = [...new Set(selectedRecipes.flatMap((recipe) => recipe.tags))];
  const services = [
    ...new Set(selectedRecipes.flatMap((recipe) => recipe.services)),
  ] as Service[];

  return {
    id: config.id,
    name: config.name,
    description: config.description,
    recipeIds: config.recipeIds,
    tags,
    services,
    ...(config.previewImageLightUrl
      ? { previewImageLightUrl: config.previewImageLightUrl }
      : {}),
    ...(config.previewImageDarkUrl
      ? { previewImageDarkUrl: config.previewImageDarkUrl }
      : {}),
    ...(config.isDraft ? { isDraft: true } : {}),
  };
}

export const cookbooks: Cookbook[] = [
  createCookbook({
    id: "hello-world-app",
    name: "Hello World App",
    description:
      "Databricks local bootstrap for CLI, auth, app scaffolding, and agent skill setup.",
    recipeIds: ["databricks-local-bootstrap"],
    previewImageLightUrl: "/img/guides/hello-world-app-preview-light.png",
    previewImageDarkUrl: "/img/guides/hello-world-app-preview-dark.png",
  }),
  createCookbook({
    id: "ai-chat-app",
    name: "AI Chat App",
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
    previewImageLightUrl: "/img/guides/ai-chat-app-preview-light.png",
    previewImageDarkUrl: "/img/guides/ai-chat-app-preview-dark.png",
  }),
  createCookbook({
    id: "app-with-lakebase",
    name: "App with Lakebase",
    description:
      "Bootstrap a Databricks app with Lakebase for persistent data storage. Includes schema setup and full CRUD API routes.",
    recipeIds: [
      "databricks-local-bootstrap",
      "lakebase-create-instance",
      "lakebase-data-persistence",
    ],
    previewImageLightUrl: "/img/guides/app-with-lakebase-preview-light.png",
    previewImageDarkUrl: "/img/guides/app-with-lakebase-preview-dark.png",
  }),
  createCookbook({
    id: "genie-analytics-app",
    name: "Genie Analytics App",
    description:
      "Build a minimal Databricks App with AI/BI Genie conversational analytics. Covers CLI setup, Genie space configuration, plugin wiring, and deploy.",
    recipeIds: ["databricks-local-bootstrap", "genie-conversational-analytics"],
    previewImageLightUrl: "/img/guides/genie-analytics-app-preview-light.png",
    previewImageDarkUrl: "/img/guides/genie-analytics-app-preview-dark.png",
  }),
  createCookbook({
    id: "lakebase-off-platform",
    name: "Lakebase Off-Platform",
    description:
      "Use Lakebase from apps hosted outside Databricks App Platform (for example on AWS, Vercel, or Netlify) with portable env, token, and Drizzle patterns.",
    recipeIds: [
      "lakebase-create-instance",
      "lakebase-off-platform-env-management",
      "lakebase-token-management",
      "lakebase-drizzle-off-platform",
    ],
    previewImageLightUrl: "/img/guides/lakebase-off-platform-preview-light.png",
    previewImageDarkUrl: "/img/guides/lakebase-off-platform-preview-dark.png",
  }),
  createCookbook({
    id: "operational-data-analytics",
    name: "Operational Data Analytics",
    description:
      "End-to-end setup for analyzing operational database data in the lakehouse: Unity Catalog with external storage, Lakebase provisioning, Lakehouse Sync CDC replication, and a medallion architecture pipeline with silver and gold layers.",
    recipeIds: [
      "databricks-local-bootstrap",
      "unity-catalog-setup",
      "lakebase-create-instance",
      "lakebase-change-data-feed-autoscaling",
      "sync-tables-autoscaling",
      "medallion-architecture-from-cdc",
    ],
    previewImageLightUrl:
      "/img/guides/operational-data-analytics-preview-light.png",
    previewImageDarkUrl:
      "/img/guides/operational-data-analytics-preview-dark.png",
  }),
];

export const cookbookPreviewItems: CookbookPreviewItem[] = cookbooks.map(
  (cookbook) => ({
    id: cookbook.id,
    path: `/templates/${cookbook.id}`,
    title: cookbook.name,
    description: cookbook.description,
    tags: cookbook.tags,
    services: cookbook.services,
    ...(cookbook.previewImageLightUrl
      ? { previewImageLightUrl: cookbook.previewImageLightUrl }
      : {}),
    ...(cookbook.previewImageDarkUrl
      ? { previewImageDarkUrl: cookbook.previewImageDarkUrl }
      : {}),
  }),
);

export type Example = PreviewImages & {
  id: string;
  name: string;
  description: string;
  githubPath: string;
  initCommand: string;
  cookbookIds: string[];
  recipeIds: string[];
  tags: string[];
  services: Service[];
  /**
   * Optional array of themed screenshots for the detail-page carousel. Each slide
   * must provide both a light and dark URL. When empty/undefined, the detail page
   * shows the single previewImage*Url (or falls back to the generic card art).
   */
  galleryImages?: GalleryImage[];
  isDraft?: boolean;
};

const cookbookIndex: Record<string, Cookbook> = Object.fromEntries(
  cookbooks.map((t) => [t.id, t]),
);

type ExampleConfig = {
  id: string;
  name: string;
  description: string;
  githubPath: string;
  initCommand: string;
  cookbookIds: string[];
  recipeIds: string[];
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
  galleryImages?: GalleryImage[];
  isDraft?: boolean;
};

function createExample(config: ExampleConfig): Example {
  const referencedCookbooks = config.cookbookIds.map((id) => {
    const t = cookbookIndex[id];
    if (!t) throw new Error(`Unknown cookbook id in example: ${id}`);
    return t;
  });
  const referencedRecipes = config.recipeIds.map((id) => {
    const r = recipeIndex[id];
    if (!r) throw new Error(`Unknown recipe id in example: ${id}`);
    return r;
  });

  const tags = [
    ...new Set([
      ...referencedCookbooks.flatMap((t) => t.tags),
      ...referencedRecipes.flatMap((r) => r.tags),
    ]),
  ];
  const services = [
    ...new Set([
      ...referencedCookbooks.flatMap((t) => t.services),
      ...referencedRecipes.flatMap((r) => r.services),
    ]),
  ] as Service[];

  return {
    ...config,
    tags,
    services,
    ...(config.isDraft ? { isDraft: true } : {}),
  };
}

export const examples: Example[] = [
  createExample({
    id: "agentic-support-console",
    name: "Agentic Support Console",
    description:
      "End-to-end AI-powered support console combining Lakebase, Lakehouse Sync, a medallion pipeline, an LLM agent job, reverse sync, and a Databricks App with Genie analytics.",
    githubPath: "examples/agentic-support-console",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/agentic-support-console/template",
    cookbookIds: ["operational-data-analytics", "app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics", "foundation-models-api"],
    previewImageLightUrl:
      "/img/examples/agentic-support-console-preview-light.png",
    previewImageDarkUrl:
      "/img/examples/agentic-support-console-preview-dark.png",
  }),
  createExample({
    id: "saas-tracker",
    name: "SaaS Subscription Tracker",
    description:
      "Internal tool for tracking team SaaS subscriptions, owners, costs, and renewals with Lakebase persistence and Genie spend analytics.",
    githubPath: "examples/saas-tracker",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/saas-tracker/template",
    cookbookIds: ["app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics"],
    previewImageLightUrl: "/img/examples/saas-tracker-preview-light.png",
    previewImageDarkUrl: "/img/examples/saas-tracker-preview-dark.png",
  }),
  createExample({
    id: "content-moderator",
    name: "Content Moderator",
    description:
      "Internal content moderation tool with per-channel guidelines, AI-powered compliance scoring via Model Serving, and a moderator review workflow backed by Lakebase and Genie analytics.",
    githubPath: "examples/content-moderator",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/content-moderator/template",
    cookbookIds: ["app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics", "foundation-models-api"],
    previewImageLightUrl: "/img/examples/content-moderator-preview-light.png",
    previewImageDarkUrl: "/img/examples/content-moderator-preview-dark.png",
  }),
  createExample({
    id: "inventory-intelligence",
    name: "Inventory Intelligence",
    description:
      "Retail inventory management with AI-powered demand forecasting, replenishment recommendations, and optional Genie analytics. Built on a live medallion pipeline synced to Lakebase.",
    githubPath: "examples/inventory-intelligence",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/inventory-intelligence/template",
    cookbookIds: ["operational-data-analytics", "app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics"],
    previewImageLightUrl:
      "/img/examples/inventory-intelligence-preview-light.png",
    previewImageDarkUrl:
      "/img/examples/inventory-intelligence-preview-dark.png",
  }),
  // Unlike the other examples, rag-chat is consumed via `databricks apps init`
  // rather than `git clone`. The initCommand points at the AppKit CLI.
  // See examples/rag-chat/template/appkit.plugins.json for the plugin manifest.
  // TODO: once PR #49 merges, add "lakebase-pgvector" and "embeddings-generation"
  // to recipeIds below.
  createExample({
    id: "rag-chat",
    name: "RAG Chat App",
    description:
      "Streaming Retrieval-Augmented Generation chat app with pgvector retrieval from Lakebase, Wikipedia seed corpus, Model Serving generation, and Lakebase-backed chat history. Consumed via `databricks apps init`.",
    githubPath: "examples/rag-chat",
    initCommand:
      'databricks apps init \\\n  --template https://github.com/databricks/devhub/tree/main/examples/rag-chat/template \\\n  --name rag-chat-app \\\n  --set lakebase.postgres.branch="$BRANCH_NAME" \\\n  --set lakebase.postgres.database="$DATABASE_NAME"',
    cookbookIds: ["ai-chat-app"],
    recipeIds: ["ai-chat-model-serving", "lakebase-chat-persistence"],
    previewImageLightUrl: "/img/examples/rag-chat-preview-light.png",
    previewImageDarkUrl: "/img/examples/rag-chat-preview-dark.png",
  }),
];

type Draftable = { isDraft?: boolean };

export function filterPublished<T extends Draftable>(
  items: T[],
  includeDrafts: boolean,
): T[] {
  if (includeDrafts) return items;
  return items.filter((item) => !item.isDraft);
}
