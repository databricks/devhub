const MARKDOWN_SECTIONS = ["docs", "recipes", "examples", "templates"] as const;

export type MarkdownSection = (typeof MARKDOWN_SECTIONS)[number];

const MARKDOWN_SECTION_SET = new Set<string>(MARKDOWN_SECTIONS);

const MARKDOWN_HTML_PREFIXES: ReadonlyArray<{
  prefix: string;
  section: MarkdownSection;
}> = [
  { prefix: "/docs/", section: "docs" },
  { prefix: "/templates/", section: "templates" },
];

const MARKDOWN_INDEX_PATHS: Readonly<Record<string, MarkdownSection>> = {
  "/templates": "templates",
};

function isMarkdownSection(value: string | null): value is MarkdownSection {
  return value !== null && MARKDOWN_SECTION_SET.has(value);
}

export function parseMarkdownSection(value: string | null): MarkdownSection {
  if (isMarkdownSection(value)) {
    return value;
  }

  throw new Error(
    `Invalid section. Expected one of: ${MARKDOWN_SECTIONS.map((section) => `"${section}"`).join(", ")}.`,
  );
}

function getMarkdownArtifactPath(
  section: MarkdownSection,
  slug: string,
): string {
  return slug ? `/${section}/${slug}.md` : `/${section}.md`;
}

export function resolveMarkdownNegotiationPath(
  path: string,
): { artifactPath: string; section: MarkdownSection; slug: string } | null {
  const normalizedPath = path.replace(/\/$/, "");
  if (normalizedPath.endsWith(".md") || normalizedPath.endsWith(".txt")) {
    return null;
  }

  for (const { prefix, section } of MARKDOWN_HTML_PREFIXES) {
    if (path.startsWith(prefix)) {
      const slug = path.slice(prefix.length).replace(/\/$/, "");
      return {
        artifactPath: getMarkdownArtifactPath(section, slug),
        section,
        slug,
      };
    }
  }

  const indexSection = MARKDOWN_INDEX_PATHS[normalizedPath];
  if (!indexSection) {
    return null;
  }

  return {
    artifactPath: getMarkdownArtifactPath(indexSection, ""),
    section: indexSection,
    slug: "",
  };
}
