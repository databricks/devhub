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

export type Recipe = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  services: Service[];
  prerequisites?: string[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  tags: string[];
  services: Service[];
};

type TemplatePreviewItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
  services?: Service[];
};

export const recipes: Recipe[] = [
  {
    id: "databricks-local-bootstrap",
    name: "Databricks Local Bootstrap",
    description:
      "Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.",
    tags: ["Databricks CLI", "Setup", "Agent Skills"],
    services: ["Databricks Apps"],
  },
  {
    id: "ai-chat-model-serving",
    name: "Streaming AI Chat with Model Serving",
    description:
      "Build a streaming AI chat experience using AI SDK and Databricks Model Serving endpoints.",
    tags: ["AI", "Chat", "AI SDK", "Model Serving"],
    services: ["Databricks Apps", "Model Serving"],
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
  },
  {
    id: "model-serving-endpoint-creation",
    name: "Create a Databricks Model Serving endpoint",
    description:
      "Create and validate a Databricks Model Serving endpoint for AI chat inference in Databricks Apps.",
    tags: ["Model Serving", "AI Gateway", "Endpoints", "Inference"],
    services: ["Model Serving", "AI Gateway"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-chat-persistence",
    name: "Lakebase Chat Persistence",
    description:
      "Persist chat sessions and messages in Lakebase so users can resume chat history across requests and deployments.",
    tags: ["Lakebase", "Postgres", "Chat", "Persistence"],
    services: ["Lakebase", "Databricks Apps"],
    prerequisites: ["lakebase-data-persistence", "ai-chat-model-serving"],
  },
  {
    id: "lakebase-create-instance",
    name: "Create a Lakebase Instance",
    description:
      "Provision a managed Lakebase Postgres project on Databricks and collect the connection values needed by downstream recipes.",
    tags: ["Lakebase", "Postgres", "Setup"],
    services: ["Lakebase"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "lakebase-data-persistence",
    name: "Lakebase Data Persistence",
    description:
      "Add a managed Postgres database to your Databricks app using the Lakebase plugin. Covers schema setup, table creation, and full CRUD REST API routes.",
    tags: ["Lakebase", "Postgres", "CRUD", "Data"],
    services: ["Lakebase", "Databricks Apps"],
    prerequisites: ["databricks-local-bootstrap", "lakebase-create-instance"],
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
  },
  {
    id: "sync-tables-autoscaling",
    name: "Sync Tables: Unity Catalog to Lakebase (Autoscaling)",
    description:
      "Sync Unity Catalog tables into Lakebase Autoscaling Postgres as synced tables for sub-10ms application queries, with snapshot, triggered, or continuous modes.",
    tags: ["Lakebase", "Sync Tables", "Unity Catalog", "Synced Tables", "CDF"],
    services: ["Lakebase", "Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "genie-conversational-analytics",
    name: "Genie Conversational Analytics",
    description:
      "Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up server and client plugins, declare app resources, and deploy.",
    tags: ["Genie", "AI/BI", "Natural Language", "Analytics"],
    services: ["Genie", "Databricks Apps"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "unity-catalog-setup",
    name: "Set Up Unity Catalog with External Storage",
    description:
      "Create a Unity Catalog catalog backed by an external S3 bucket with storage credentials, external location, and a schema ready for lakehouse tables.",
    tags: ["Unity Catalog", "S3", "External Storage", "Setup"],
    services: ["Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
  },
  {
    id: "genie-multi-space",
    name: "Genie Multi-Space Selector",
    description:
      "Add a space selector so users can switch between multiple AI/BI Genie spaces from a single page. Covers multi-alias server config, per-space bundle resources, and automatic conversation cleanup on space switch and redeployment.",
    tags: ["Genie", "AI/BI", "Natural Language", "Data"],
    services: ["Genie"],
    prerequisites: ["genie-conversational-analytics"],
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
  },
  {
    id: "lakebase-off-platform-env-management",
    name: "Lakebase Env Management for Off-Platform Apps",
    description:
      "Define and validate cross-platform environment variables for Lakebase-backed apps deployed outside Databricks App Platform.",
    tags: ["Lakebase", "Environment Variables", "AWS", "Vercel", "Netlify"],
    services: ["Lakebase"],
  },
  {
    id: "lakebase-token-management",
    name: "Lakebase Token Management",
    description:
      "Implement cached workspace and Lakebase credential token flows for secure Postgres access in off-platform deployments.",
    tags: ["Lakebase", "OAuth", "Tokens", "Security"],
    services: ["Lakebase"],
    prerequisites: ["lakebase-off-platform-env-management"],
  },
  {
    id: "lakebase-drizzle-off-platform",
    name: "Drizzle + Lakebase in an Off-Platform App",
    description:
      "Connect Drizzle ORM to Lakebase with pg password callbacks and migration-time temporary DATABASE_URL credentials.",
    tags: ["Lakebase", "Drizzle", "Postgres", "ORM"],
    services: ["Lakebase"],
    prerequisites: ["lakebase-token-management"],
  },
  {
    id: "volume-file-upload",
    name: "Volume File Manager",
    description:
      "Add file upload, browsing, download, delete, file type validation, and CSV row preview to your Databricks app using Unity Catalog Volumes.",
    tags: ["Volumes", "Unity Catalog", "Files", "Upload", "CSV"],
    services: ["Unity Catalog"],
    prerequisites: ["databricks-local-bootstrap"],
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
  };
}

export const templates: Template[] = [
  createTemplate({
    id: "hello-world-app",
    name: "Hello World App",
    description:
      "Databricks local bootstrap for CLI, auth, app scaffolding, and agent skill setup.",
    recipeIds: ["databricks-local-bootstrap"],
  }),
  createTemplate({
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
  }),
  createTemplate({
    id: "app-with-lakebase",
    name: "App with Lakebase",
    description:
      "Bootstrap a Databricks app with Lakebase for persistent data storage. Includes schema setup and full CRUD API routes.",
    recipeIds: [
      "databricks-local-bootstrap",
      "lakebase-create-instance",
      "lakebase-data-persistence",
    ],
  }),
  createTemplate({
    id: "genie-analytics-app",
    name: "Genie Analytics App",
    description:
      "Build a minimal Databricks App with AI/BI Genie conversational analytics. Covers CLI setup, Genie space configuration, plugin wiring, and deploy.",
    recipeIds: ["databricks-local-bootstrap", "genie-conversational-analytics"],
  }),
  createTemplate({
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
  }),
  createTemplate({
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
  }),
];

export const templatePreviewItems: TemplatePreviewItem[] = templates.map(
  (template) => ({
    id: template.id,
    path: `/resources/${template.id}`,
    title: template.name,
    description: template.description,
    tags: template.tags,
    services: template.services,
  }),
);

export type Example = {
  id: string;
  name: string;
  description: string;
  image: string;
  githubPath: string;
  initCommand: string;
  /**
   * Optional markdown block injected into the agent prompt BEFORE the init command,
   * describing any provisioning the agent must do first (e.g. creating a Lakebase
   * Postgres project). Leave unset for examples with no external prerequisites.
   */
  agentPrereqSteps?: string;
  /**
   * Optional markdown block injected into the agent prompt AFTER the init command,
   * describing local setup and deploy. Use for init-style examples where "cd in,
   * fill in env, npm install, npm run deploy" is the expected flow. When unset, the
   * agent is told to follow the generated README.
   */
  agentDeploySteps?: string;
  templateIds: string[];
  recipeIds: string[];
  tags: string[];
  services: Service[];
};

const templateIndex: Record<string, Template> = Object.fromEntries(
  templates.map((t) => [t.id, t]),
);

type ExampleConfig = {
  id: string;
  name: string;
  description: string;
  image: string;
  githubPath: string;
  initCommand: string;
  agentPrereqSteps?: string;
  agentDeploySteps?: string;
  templateIds: string[];
  recipeIds: string[];
};

function createExample(config: ExampleConfig): Example {
  const referencedTemplates = config.templateIds.map((id) => {
    const t = templateIndex[id];
    if (!t) throw new Error(`Unknown template id in example: ${id}`);
    return t;
  });
  const referencedRecipes = config.recipeIds.map((id) => {
    const r = recipeIndex[id];
    if (!r) throw new Error(`Unknown recipe id in example: ${id}`);
    return r;
  });

  const tags = [
    ...new Set([
      ...referencedTemplates.flatMap((t) => t.tags),
      ...referencedRecipes.flatMap((r) => r.tags),
    ]),
  ];
  const services = [
    ...new Set([
      ...referencedTemplates.flatMap((t) => t.services),
      ...referencedRecipes.flatMap((r) => r.services),
    ]),
  ] as Service[];

  return { ...config, tags, services };
}

export const examples: Example[] = [
  createExample({
    id: "agentic-support-console",
    name: "Agentic Support Console",
    description:
      "End-to-end AI-powered support console combining Lakebase, Lakehouse Sync, a medallion pipeline, an LLM agent job, reverse sync, and a Databricks App with Genie analytics.",
    image: "/img/examples/agentic-support-console.svg",
    githubPath: "examples/agentic-support-console",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/agentic-support-console/template",
    templateIds: ["operational-data-analytics", "app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics", "foundation-models-api"],
  }),
  createExample({
    id: "saas-tracker",
    name: "SaaS Subscription Tracker",
    description:
      "Internal tool for tracking team SaaS subscriptions, owners, costs, and renewals with Lakebase persistence and Genie spend analytics.",
    image: "/img/examples/saas-tracker.svg",
    githubPath: "examples/saas-tracker",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/saas-tracker/template",
    templateIds: ["app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics"],
  }),
  createExample({
    id: "content-moderator",
    name: "Content Moderator",
    description:
      "Internal content moderation tool with per-channel guidelines, AI-powered compliance scoring via Model Serving, and a moderator review workflow backed by Lakebase and Genie analytics.",
    image: "/img/examples/content-moderator.svg",
    githubPath: "examples/content-moderator",
    initCommand:
      "git clone --depth 1 https://github.com/databricks/devhub.git\ncd devhub/examples/content-moderator/template",
    templateIds: ["app-with-lakebase"],
    recipeIds: ["genie-conversational-analytics", "foundation-models-api"],
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
    image: "/img/examples/rag-chat.svg",
    githubPath: "examples/rag-chat",
    initCommand:
      'databricks apps init \\\n  --template https://github.com/databricks/devhub/tree/main/examples/rag-chat/template \\\n  --name rag-chat-app \\\n  --set lakebase.postgres.branch="$BRANCH_NAME" \\\n  --set lakebase.postgres.database="$DATABASE_NAME"',
    agentPrereqSteps: [
      "### 2. Create the Lakebase Postgres prerequisites",
      "",
      "The template's AppKit Lakebase plugin requires an existing Postgres **branch** and **database**. `databricks postgres create-project` automatically provisions a default branch named `production` and a default database on it, so one command is all you need. Pick a short lowercase project id and export the resolved resource names — the next step's `databricks apps init` command reads them as shell variables.",
      "",
      "```bash",
      "PROJECT_ID=rag-chat",
      "",
      'databricks postgres create-project "$PROJECT_ID"',
      "",
      'export BRANCH_NAME="projects/$PROJECT_ID/branches/production"',
      'export DATABASE_NAME=$(databricks api get "/api/2.0/postgres/$BRANCH_NAME/databases" -o json | \\',
      "  python3 -c \"import json,sys; print(json.load(sys.stdin)['databases'][0]['name'])\")",
      "",
      'echo "Branch:   $BRANCH_NAME"',
      'echo "Database: $DATABASE_NAME"',
      "```",
      "",
      "`create-project` is long-running; by default the CLI waits for it to finish. If a project with that id already exists, delete it first with `databricks postgres delete-project projects/$PROJECT_ID` and re-run, or pick a different id.",
    ].join("\n"),
    agentDeploySteps: [
      "### 4. Fill in the remaining env, install, and deploy",
      "",
      "`databricks apps init` writes `.env` with the resolved Lakebase connection details. Two values still need to be set manually because they don't come from an AppKit plugin:",
      "",
      "- `DATABRICKS_WORKSPACE_ID` — the **numeric** workspace id used to build the AI Gateway URL.",
      "- (Optional) Override `DATABRICKS_ENDPOINT` / `DATABRICKS_EMBEDDING_ENDPOINT` if you want different chat / embeddings endpoints.",
      "",
      "Fetch the numeric id from the Unity Catalog metastore-assignment endpoint and patch `.env`:",
      "",
      "```bash",
      "cd rag-chat-app",
      "",
      "WORKSPACE_ID=$(databricks api get /api/2.1/unity-catalog/current-metastore-assignment \\",
      "  | python3 -c \"import json,sys;print(json.load(sys.stdin)['workspace_id'])\")",
      'sed -i.bak "s/^DATABRICKS_WORKSPACE_ID=.*/DATABRICKS_WORKSPACE_ID=$WORKSPACE_ID/" .env && rm .env.bak',
      "```",
      "",
      "Then install and deploy. `npm run deploy` wraps three steps: hydrate the bundle variable overrides from `.env` + the Lakebase Postgres API (`scripts/sync-bundle-vars.mjs`), `databricks bundle deploy` (creates the Databricks app on first run), and `databricks bundle run app` (starts it and prints the URL).",
      "",
      "```bash",
      "npm install",
      "npm run deploy",
      "```",
    ].join("\n"),
    templateIds: ["ai-chat-app"],
    recipeIds: ["ai-chat-model-serving", "lakebase-chat-persistence"],
  }),
];
