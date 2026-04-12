import type { Example } from "@/lib/recipes/recipes";

type ResourceRef = { id: string; name: string; description: string };

export type ExampleMarkdownOptions = {
  example: Example;
  githubUrl: string;
  includedTemplates: ResourceRef[];
  includedRecipes: ResourceRef[];
  baseUrl: string;
};

/** Outcome bullets shown in the Get started card (agent-first copy). */
export const EXAMPLE_AGENT_OUTCOME_BULLETS = [
  "Prompt the agent to clone the DevHub repo and open this example's template/README.md",
  "Prompt the agent to follow that README for provisioning, seeding, pipelines, and deploy",
] as const;

/** Intro copy for the included guides / recipes list (Copy as Markdown and Copy prompt). */
export function buildIncludedGuidesPreamble(): string {
  return [
    "These **guides** (multi-step cookbooks) and **recipes** informed how this example was built; their patterns are reflected in the template code, bundles, and workflows.",
    "",
    "Review them on DevHub when you need more context on a technique than `template/README.md` alone provides.",
  ].join("\n");
}

/** Get started body for Copy as Markdown exports (includes clone command + README pointer). */
export function buildExportGetStartedSection(example: Example): string {
  return [
    "## Get started",
    "",
    "Run the command below to clone the DevHub repository locally and `cd` into this example's **`template/`** folder. That directory is the runnable template (AppKit app, Databricks Asset Bundles, and any `pipelines/`, `seed/`, or `provisioning/sql/` shipped with the example).",
    "",
    "```bash",
    example.initCommand,
    "```",
    "",
    "**`template/README.md`** is included in that folder when you clone. Open it for step-by-step instructions: provision the right infrastructure (catalogs, Lakehouse Sync, Lakebase, warehouses, AI endpoints, and so on), run seeds and pipeline bundles as needed, and deploy the app. Follow that README end to end; it is the source of truth for this example.",
  ].join("\n");
}

export function buildFullPrompt(
  opts: ExampleMarkdownOptions & { rawMarkdown: string },
): string {
  const {
    example,
    githubUrl,
    rawMarkdown,
    includedTemplates,
    includedRecipes,
    baseUrl,
  } = opts;
  const cliTemplateUrl = `https://github.com/databricks/devhub/tree/main/${example.githubPath}`;
  const lines: string[] = [
    `# ${example.name}`,
    "",
    example.description,
    "",
    "## Get started",
    "",
    "### 1. Clone locally and follow `template/README.md`",
    "",
    "Run the command below to clone the DevHub repository locally and enter this example's **`template/`** directory.",
    "",
    "```bash",
    example.initCommand,
    "```",
    "",
    "**`template/README.md`** ships with that template when you clone. Use it as the runbook: follow the instructions there to provision the right infrastructure pieces, seed data, run pipelines if applicable, and deploy the app.",
    "",
    "**Optional:** scaffold a standalone project with the CLI instead of cloning the full DevHub repo:",
    "",
    "```bash",
    `databricks apps init --template ${cliTemplateUrl} --name <app-name>`,
    "```",
    "",
  ];

  if (rawMarkdown) {
    lines.push("", rawMarkdown);
  }

  lines.push("", `## Source Code`, "", `GitHub: ${githubUrl}`);

  const guides = [
    ...includedTemplates.map(
      (t) =>
        `- [${t.name}](${baseUrl}/resources/${t.id}.md) - ${t.description}`,
    ),
    ...includedRecipes.map(
      (r) =>
        `- [${r.name}](${baseUrl}/resources/${r.id}.md) - ${r.description}`,
    ),
  ];
  if (guides.length > 0) {
    lines.push(
      "",
      "## Included guides",
      "",
      buildIncludedGuidesPreamble(),
      "",
      ...guides,
    );
  }

  return lines.join("\n");
}

export function buildAdditionalMarkdown(opts: ExampleMarkdownOptions): string {
  const { example, githubUrl, includedTemplates, includedRecipes, baseUrl } =
    opts;
  const sections: string[] = [];

  sections.push(buildExportGetStartedSection(example));
  sections.push(`## Source Code\n\nGitHub: ${githubUrl}`);

  const links = [
    ...includedTemplates.map(
      (t) =>
        `- [${t.name}](${baseUrl}/resources/${t.id}.md) - ${t.description}`,
    ),
    ...includedRecipes.map(
      (r) =>
        `- [${r.name}](${baseUrl}/resources/${r.id}.md) - ${r.description}`,
    ),
  ];
  if (links.length > 0) {
    sections.push(
      "## Included guides",
      "",
      buildIncludedGuidesPreamble(),
      "",
      links.join("\n"),
    );
  }

  return sections.join("\n\n");
}
