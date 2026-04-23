import type { ContentSections } from "@/lib/content-sections";
import type { Example } from "@/lib/recipes/recipes";

type ResourceRef = { id: string; name: string; description: string };

export type ExampleMarkdownOptions = {
  example: Example;
  githubUrl: string;
  includedTemplates: ResourceRef[];
  includedRecipes: ResourceRef[];
  baseUrl: string;
};

export type ExampleSections = ContentSections;

/** Outcome bullets shown in the Get started card (agent-first copy). */
export const EXAMPLE_AGENT_OUTCOME_BULLETS = [
  "Prompt the agent to clone the DevHub repo and open this example's template/README.md",
  "Prompt the agent to follow that README for provisioning, seeding, pipelines, and deploy",
] as const;

/** Outcome bullets for init-style examples consumed via `databricks apps init`. */
export const EXAMPLE_AGENT_OUTCOME_BULLETS_INIT = [
  "Prompt the agent to verify Databricks CLI auth and provision any required resources (e.g. a Lakebase Postgres project)",
  "Prompt the agent to scaffold the project with `databricks apps init` and `cd` into the generated directory",
  "Prompt the agent to fill in any remaining `.env` values, then run `npm install && npm run deploy`",
] as const;

function isInitCommand(initCommand: string): boolean {
  return initCommand.trimStart().startsWith("databricks apps init");
}

/** Intro copy for the included guides / recipes list (Copy as Markdown and Copy prompt). */
export function buildIncludedGuidesPreamble(): string {
  return [
    "These **guides** (multi-step cookbooks) and **recipes** informed how this example was built; their patterns are reflected in the template code, bundles, and workflows.",
    "",
    "Review them on DevHub when you need more context on a technique than `template/README.md` alone provides.",
  ].join("\n");
}

/** Get started body for Copy as Markdown exports (includes init or clone command + README pointer). */
export function buildExportGetStartedSection(example: Example): string {
  if (isInitCommand(example.initCommand)) {
    return [
      "## Get started",
      "",
      "Run the command below to scaffold this example into a new directory using the [AppKit template system](https://databricks.github.io/appkit/docs/development/templates). The CLI will prompt you for required resources (e.g. Lakebase branch, database), auto-resolve connection details into your local `.env`, and drop you into a ready-to-run project.",
      "",
      "**Before running, make sure you have a valid Databricks CLI profile.** The init flow calls the workspace API to resolve connection details, so it fails immediately without auth. Run `databricks auth profiles` — if no profile shows `Valid: YES`, authenticate one with `databricks auth login --profile <name> --host <workspace-url>`. If `DEFAULT` is not valid, pass the profile you want to use via `--profile <name>` appended to the init command below.",
      "",
      "```bash",
      example.initCommand,
      "```",
      "",
      "A **`README.md`** ships inside the scaffolded project. Open it for step-by-step instructions: fill in any remaining configuration, install dependencies, run locally, and deploy. Follow that README end to end; it is the source of truth for this example.",
    ].join("\n");
  }
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
  opts: ExampleMarkdownOptions & { sections: ExampleSections },
): string {
  const {
    example,
    githubUrl,
    sections,
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
  ];

  if (isInitCommand(example.initCommand)) {
    const hasPrereqs = Boolean(sections.prerequisites);
    const hasDeployBlock = Boolean(sections.deployment);
    const initStepNumber = hasPrereqs ? 3 : 2;

    lines.push(
      "### 1. Verify Databricks CLI auth",
      "",
      "The init flow calls the workspace API to resolve connection details, so it fails immediately without a valid Databricks CLI profile. Before running init, check auth:",
      "",
      "```bash",
      "databricks auth profiles",
      "```",
      "",
      "If no profile shows `Valid: YES`, authenticate one first:",
      "",
      "```bash",
      "databricks auth login --profile <name> --host <workspace-url>",
      "```",
      "",
      "If `DEFAULT` is not the profile you want to use, export the one you want so subsequent commands pick it up:",
      "",
      "```bash",
      "export DATABRICKS_CONFIG_PROFILE=<profile>",
      "```",
      "",
    );

    if (hasPrereqs) {
      lines.push(sections.prerequisites!, "");
    }

    lines.push(
      `### ${initStepNumber}. Scaffold the project with \`databricks apps init\``,
      "",
      "Run the command below to scaffold this example into a new directory using the [AppKit template system](https://databricks.github.io/appkit/docs/development/templates). It creates the app in your workspace, binds required resources, and writes a local `.env` with connection details resolved by the AppKit plugins.",
      "",
      "```bash",
      example.initCommand,
      "```",
      "",
    );

    if (hasDeployBlock) {
      lines.push(sections.deployment!, "");
    } else {
      lines.push(
        "A **`README.md`** ships inside the scaffolded project. Follow it end to end to configure, run, and deploy the app.",
        "",
      );
    }
  } else {
    lines.push(
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
    );
  }

  if (sections.content) {
    lines.push("", sections.content);
  }

  lines.push("", `## Source Code`, "", `GitHub: ${githubUrl}`);

  const guides = [
    ...includedTemplates.map(
      (t) =>
        `- [${t.name}](${baseUrl}/templates/${t.id}.md) - ${t.description}`,
    ),
    ...includedRecipes.map(
      (r) =>
        `- [${r.name}](${baseUrl}/templates/${r.id}.md) - ${r.description}`,
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
        `- [${t.name}](${baseUrl}/templates/${t.id}.md) - ${t.description}`,
    ),
    ...includedRecipes.map(
      (r) =>
        `- [${r.name}](${baseUrl}/templates/${r.id}.md) - ${r.description}`,
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
