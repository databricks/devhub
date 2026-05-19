import type { ContentSections } from "@/lib/content-sections";
import type { Example } from "@/lib/recipes/recipes";

type ContentRef = { id: string; name: string; description: string };

export type ExampleMarkdownOptions = {
  example: Example;
  githubUrl: string;
  includedCookbooks: ContentRef[];
  includedRecipes: ContentRef[];
  baseUrl: string;
};

export type ExampleSections = ContentSections;

function isInitCommand(initCommand: string): boolean {
  return initCommand.trimStart().startsWith("databricks apps init");
}

/** Intro copy for the included templates list (Copy as Markdown and Copy prompt). */
export function buildIncludedTemplatesPreamble(): string {
  return [
    "These **templates** informed how this example was built; their patterns are reflected in the template code, bundles, and workflows.",
    "",
    "Review them on DevHub when you need more context on a technique than `template/README.md` alone provides.",
  ].join("\n");
}

function buildIncludedTemplateLinks(
  includedCookbooks: ContentRef[],
  includedRecipes: ContentRef[],
  baseUrl: string,
): string[] {
  const renderLink = (item: ContentRef) =>
    `- [${item.name}](${baseUrl}/templates/${item.id}.md) - ${item.description}`;
  return [
    ...includedCookbooks.map(renderLink),
    ...includedRecipes.map(renderLink),
  ];
}

/** Get started body for Copy as Markdown exports (includes init or clone command + README pointer). */
export function buildExportGetStartedSection(example: Example): string {
  if (isInitCommand(example.initCommand)) {
    return [
      "## Get started",
      "",
      "Run the command below to scaffold this example into a new directory using the [AppKit template system](/docs/appkit/v0/development/templates). The CLI will prompt you for required resources (e.g. Lakebase branch, database), auto-resolve connection details into your local `.env`, and drop you into a ready-to-run project.",
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
    includedCookbooks,
    includedRecipes,
    baseUrl,
  } = opts;
  const hasGoal = Boolean(sections.goal);
  const cliTemplateUrl = `https://github.com/databricks/devhub/tree/main/${example.githubPath}`;
  const lines: string[] = [`# ${example.name}`, "", example.description, ""];

  // When goal.md exists, use it as the body and skip prerequisites/content/deployment.
  // The agent gets the outcome description + scaffold entry point; skills handle implementation.
  if (hasGoal) {
    lines.push(sections.goal!.trim(), "");
  }

  lines.push("## Get started", "");

  if (isInitCommand(example.initCommand)) {
    if (!hasGoal && sections.prerequisites) {
      lines.push(sections.prerequisites, "");
    }

    lines.push(
      "### Scaffold the project",
      "",
      "Run the command below to scaffold this example into a new directory using the [AppKit template system](/docs/appkit/v0/development/templates). It creates the app in your workspace, binds required resources, and writes a local `.env` with connection details resolved by the AppKit plugins.",
      "",
      "```bash",
      example.initCommand,
      "```",
      "",
    );

    if (!hasGoal && sections.deployment) {
      lines.push(sections.deployment, "");
    } else {
      lines.push(
        "A **`README.md`** ships inside the scaffolded project. Follow it end to end to configure, run, and deploy the app.",
        "",
      );
    }
  } else {
    lines.push(
      "### Clone and follow `template/README.md`",
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

  if (!hasGoal && sections.content) {
    lines.push("", sections.content);
  }

  lines.push("", `## Source Code`, "", `GitHub: ${githubUrl}`);

  const includedTemplateLinks = buildIncludedTemplateLinks(
    includedCookbooks,
    includedRecipes,
    baseUrl,
  );
  if (includedTemplateLinks.length > 0) {
    lines.push(
      "",
      "## Included templates",
      "",
      buildIncludedTemplatesPreamble(),
      "",
      ...includedTemplateLinks,
    );
  }

  return lines.join("\n");
}

export function buildAdditionalMarkdown(opts: ExampleMarkdownOptions): string {
  const { example, githubUrl, includedCookbooks, includedRecipes, baseUrl } =
    opts;
  const sections: string[] = [];

  sections.push(buildExportGetStartedSection(example));
  sections.push(`## Source Code\n\nGitHub: ${githubUrl}`);

  const links = buildIncludedTemplateLinks(
    includedCookbooks,
    includedRecipes,
    baseUrl,
  );
  if (links.length > 0) {
    sections.push(
      "## Included templates",
      "",
      buildIncludedTemplatesPreamble(),
      "",
      links.join("\n"),
    );
  }

  return sections.join("\n\n");
}
