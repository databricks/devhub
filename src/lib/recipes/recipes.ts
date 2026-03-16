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
    name: "Vercel AI SDK + AI Elements Chat",
    description:
      "Build a minimal streaming chat app using Vercel AI SDK and AI Elements patterns.",
    tags: ["AI SDK", "AI Elements", "Chat"],
    prerequisites: ["databricks-local-bootstrap"],
    steps: [
      {
        id: "install-ai-sdk",
        title: "Install AI SDK",
        command: "bun add ai @ai-sdk/react",
      },
      {
        id: "install-ai-elements",
        title: "Install AI Elements UI components",
        command: "bunx shadcn@latest add @ai-elements/all",
      },
      {
        id: "set-provider-env",
        title: "Configure AI provider environment variables",
        details:
          "Set either VERCEL_OIDC_TOKEN or AI_GATEWAY_API_KEY (or provider-specific keys such as OPENAI_API_KEY).",
      },
      {
        id: "create-chat-route",
        title: "Create a streaming chat API route",
        details:
          "Implement /api/chat with streamText and return toUIMessageStreamResponse().",
      },
      {
        id: "create-chat-ui",
        title: "Create a client chat UI with useChat",
        details:
          "Use useChat + DefaultChatTransport and render text parts with a submit form.",
      },
      {
        id: "run-and-test",
        title: "Run and test locally",
        command: "bun run dev",
      },
    ],
    references: [
      {
        label: "AI SDK docs",
        href: "https://ai-sdk.dev/docs/introduction",
      },
      {
        label: "AI Elements docs",
        href: "https://ui.shadcn.com/docs/registry/ai-elements",
      },
      {
        label: "Fullstackrecipes AI SDK setup",
        href: "recipe://fullstackrecipes.com/ai-sdk-setup",
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
      "Databricks local bootstrap plus a simple AI chat implementation using AI SDK and AI Elements.",
    recipeIds: ["databricks-local-bootstrap", "vercel-ai-chat-app"],
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
