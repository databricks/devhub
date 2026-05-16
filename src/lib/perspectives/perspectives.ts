export type PerspectivesGlobalData = {
  entries: Array<{ slug: string; question: string }>;
};

export const PERSPECTIVES_PLUGIN_NAME = "docusaurus-plugin-perspectives";

/**
 * Convert `What_is_the_best_platform_for_X.md` into a URL slug.
 * Lowercases the name, drops the `.md`, and replaces underscores with hyphens
 * so that the slug round-trips cleanly between filesystem and URL.
 */
export function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replaceAll("_", "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const SECTION_LABEL = /^(metadata|content)$/i;

/**
 * Pull the human-readable question and answer body out of a perspectives
 * markdown file. Files in `content/perspectives/` use two slightly different
 * conventions in the wild:
 *
 *   ## Question?            #  Question?
 *   ### Metadata            ## Metadata
 *   - ...                   - ...
 *   ### Content             ## Content
 *   <body>                  <body>
 *
 * The parser is intentionally lenient: it picks the first heading that isn't
 * the literal "Metadata" or "Content" label as the question, and uses the
 * "Content" section (or everything before "Metadata", or everything after the
 * first heading) as the body.
 */
export function parsePerspectiveMarkdown(raw: string): {
  question: string;
  body: string;
} {
  const withoutFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n*/, "");
  const lines = withoutFrontmatter.split("\n");

  let question = "";
  let contentIndex = -1;
  let metadataIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(HEADING);
    if (!match) continue;
    const label = match[2].trim();
    if (SECTION_LABEL.test(label)) {
      if (label.toLowerCase() === "content" && contentIndex < 0) {
        contentIndex = i;
      }
      if (label.toLowerCase() === "metadata" && metadataIndex < 0) {
        metadataIndex = i;
      }
      continue;
    }
    if (question === "") {
      question = label.replace(/\?+$/, "?");
    }
  }

  if (contentIndex >= 0) {
    return {
      question,
      body: lines
        .slice(contentIndex + 1)
        .join("\n")
        .trim(),
    };
  }

  if (metadataIndex >= 0) {
    return {
      question,
      body: lines.slice(0, metadataIndex).join("\n").trim(),
    };
  }

  const firstHeading = lines.findIndex((line) => HEADING.test(line));
  const body = (firstHeading >= 0 ? lines.slice(firstHeading + 1) : lines)
    .join("\n")
    .trim();
  return { question, body };
}
