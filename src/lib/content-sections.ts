/** Allowed file names inside each content/<recipes|examples>/<slug>/ folder. */
const CONTENT_SECTION_FILES = [
  "goal",
  "content",
  "prerequisites",
  "deployment",
] as const;
export type ContentSectionFile = (typeof CONTENT_SECTION_FILES)[number];

/**
 * Legacy constant for backward compat. Slug detection in content-markdown.ts
 * now accepts either goal.md or content.md as the required file.
 */
export const REQUIRED_CONTENT_SECTION_FILE: ContentSectionFile = "content";

export type ContentSections = {
  goal?: string;
  /** Present when content.md exists. Optional because examples may only have goal.md. */
  content?: string;
  prerequisites?: string;
  deployment?: string;
};

/**
 * Returns goal-only content for agent prompts. Falls back to
 * joinContentSections() when no goal.md exists (backward compat
 * during incremental migration).
 */
export function goalOnly(sections: ContentSections): string {
  if (sections.goal) return sections.goal.trim();
  return joinContentSections(sections);
}

/** Joins present sections in display order (prerequisites → content → deployment). */
export function joinContentSections(sections: ContentSections): string {
  const parts = [
    sections.prerequisites,
    sections.content,
    sections.deployment,
  ].filter((part): part is string => Boolean(part && part.trim()));
  return parts.map((part) => part.trim()).join("\n\n");
}
