import type { Example } from "@/lib/recipes/recipes";

type ResourceRef = { id: string; name: string; description: string };

/** Outcome bullets shown in the Get started card (agent-first copy). */
export const EXAMPLE_AGENT_OUTCOME_BULLETS = [
  "Prompt the agent to clone the DevHub repo and open this example's template/README.md",
  "Prompt the agent to follow that README for provisioning, seeding, pipelines, and deploy",
] as const;

/** Compact outline for Copy as Markdown and other exports (user-first summary). */
export function buildExportGetStartedOutline(): string {
  return [
    "1) Clone the repository locally and open examples/<example-id>/template/README.md",
    "2) Follow that README for all manual steps, SQL, seeding, and deployment",
  ].join("\n");
}

export function buildFullPrompt(
  example: Example,
  githubUrl: string,
  rawMarkdown: string,
  includedTemplates: ResourceRef[],
  includedRecipes: ResourceRef[],
): string {
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
    "```bash",
    example.initCommand,
    "```",
    "",
    "Use **`README.md`** in that `template/` folder as the single guide: manual provisioning, SQL (where applicable), seed data, pipeline bundles, and `databricks bundle deploy` for the app.",
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
        `- [${t.name}](https://dev.databricks.com/resources/${t.id}) - ${t.description}`,
    ),
    ...includedRecipes.map(
      (r) =>
        `- [${r.name}](https://dev.databricks.com/resources/${r.id}) - ${r.description}`,
    ),
  ];
  if (guides.length > 0) {
    lines.push("", "## Included Guides", "", ...guides);
  }

  return lines.join("\n");
}

export function buildAdditionalMarkdown(
  example: Example,
  githubUrl: string,
  includedTemplates: ResourceRef[],
  includedRecipes: ResourceRef[],
): string {
  const sections: string[] = [];

  sections.push(`## Get started\n\n${buildExportGetStartedOutline()}`);
  sections.push(`## Source Code\n\nGitHub: ${githubUrl}`);

  const links = [
    ...includedTemplates.map(
      (t) => `- [${t.name}](https://dev.databricks.com/resources/${t.id})`,
    ),
    ...includedRecipes.map(
      (r) => `- [${r.name}](https://dev.databricks.com/resources/${r.id})`,
    ),
  ];
  if (links.length > 0) {
    sections.push(`## Included Resources\n\n${links.join("\n")}`);
  }

  return sections.join("\n\n");
}
