import type { Template } from "./recipes/recipes";

export type TemplateContentBlock =
  | { type: "markdown"; content: string }
  | { type: "recipe"; recipeId: string }
  | { type: "code"; language: string; content: string };

type RawRecipeMarkdownById = Record<string, string | undefined>;

const templateContentById: Record<string, TemplateContentBlock[]> = {};

export function getTemplateContentBlocks(
  templateId: string,
): TemplateContentBlock[] | undefined {
  return templateContentById[templateId];
}

export function collectTemplateRecipeIds(template: Template): string[] {
  const blocks = getTemplateContentBlocks(template.id);
  if (!blocks) {
    return template.recipeIds;
  }

  return [
    ...new Set(
      blocks.flatMap((block) =>
        block.type === "recipe" ? [block.recipeId] : [],
      ),
    ),
  ];
}

function getRecipeMarkdown(
  recipeId: string,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const markdown = rawBySlug[recipeId];
  if (!markdown) {
    throw new Error(`Recipe markdown not found: ${recipeId}`);
  }
  return markdown.trim();
}

export function buildLegacyTemplateRawMarkdown(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  return template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export function serializeTemplateContentBlocks(
  blocks: TemplateContentBlock[],
  rawBySlug: RawRecipeMarkdownById,
): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "markdown":
          return block.content.trim();
        case "recipe":
          return getRecipeMarkdown(block.recipeId, rawBySlug);
        case "code":
          return `\`\`\`${block.language}\n${block.content.trimEnd()}\n\`\`\``;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function buildTemplateRawMarkdown(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const blocks = getTemplateContentBlocks(template.id);
  if (!blocks) {
    return buildLegacyTemplateRawMarkdown(template, rawBySlug);
  }

  return serializeTemplateContentBlocks(blocks, rawBySlug);
}

function escapeFrontmatter(value: string): string {
  return value.replace(/"/g, '\\"');
}

export function buildTemplateMarkdownDocument(
  template: Template,
  rawBySlug: RawRecipeMarkdownById,
): string {
  const body = buildTemplateRawMarkdown(template, rawBySlug);

  return [
    "---",
    `title: "${escapeFrontmatter(template.name)}"`,
    `url: /resources/${template.id}`,
    `summary: "${escapeFrontmatter(template.description)}"`,
    "---",
    "",
    `# ${template.name}`,
    "",
    template.description,
    "",
    body,
  ].join("\n");
}
