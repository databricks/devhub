/** Allowed file names inside each content/<recipes|examples>/<slug>/ folder. */
export const CONTENT_SECTION_FILES = [
  "content",
  "prerequisites",
  "deployment",
] as const;
export type ContentSectionFile = (typeof CONTENT_SECTION_FILES)[number];

/** Required file in every content folder — without it the slug is not published. */
export const REQUIRED_CONTENT_SECTION_FILE: ContentSectionFile = "content";

export type ContentSections = {
  content: string;
  prerequisites?: string;
  deployment?: string;
};

/** Joins present sections in display order (prerequisites → content → deployment). */
export function joinContentSections(sections: ContentSections): string {
  const parts = [
    sections.prerequisites,
    sections.content,
    sections.deployment,
  ].filter((part): part is string => Boolean(part && part.trim()));
  return parts.map((part) => part.trim()).join("\n\n");
}
