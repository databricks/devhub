import type { Example } from "@/lib/recipes/recipes";

type ResourceRef = { id: string; name: string; description: string };

/** Outcome bullets shown in the Get started card (agent-first copy). */
export const EXAMPLE_AGENT_OUTCOME_BULLETS = [
  "Prompt the agent to clone the template",
  "Prompt the agent to provision or link Databricks resources",
  "Prompt the agent to deploy the application",
] as const;

/** Compact outline for Copy as Markdown and other exports (user-first summary). */
export function buildExportGetStartedOutline(): string {
  return [
    "1) Clone the template",
    "2) Provision or link existing Databricks resources",
    "3) Deploy the application",
  ].join("\n");
}

export function buildFullPrompt(
  example: Example,
  githubUrl: string,
  rawMarkdown: string,
  includedTemplates: ResourceRef[],
  includedRecipes: ResourceRef[],
): string {
  const lines: string[] = [
    `# ${example.name}`,
    "",
    example.description,
    "",
    "## Get started",
    "",
    "### 1. Clone the template",
    "",
    "```bash",
    example.initCommand,
    "```",
    "",
    "### 2. Provision or link existing Databricks resources",
    "",
    "Update your app's `databricks.yml` file with your Databricks resource IDs (Lakebase project, warehouses, Genie spaces, etc.).",
    "",
    "### 3. Deploy the application",
    "",
    "```bash",
    "databricks bundle deploy",
    "```",
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
