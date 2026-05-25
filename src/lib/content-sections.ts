/** Allowed file names inside each content/<recipes|examples>/<slug>/ folder. */
const CONTENT_SECTION_FILES = ["goal", "prerequisites"] as const;
export type ContentSectionFile = (typeof CONTENT_SECTION_FILES)[number];

export type ContentSections = {
  goal?: string;
  prerequisites?: string;
};

/** Returns goal-only content for agent prompts. */
export function goalOnly(sections: ContentSections): string {
  return sections.goal?.trim() ?? "";
}
