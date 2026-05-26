/** Allowed file names inside each content/<recipes|examples>/<slug>/ folder. */
export type ContentSectionFile = "goal" | "prerequisites";

export type ContentSections = {
  goal?: string;
  prerequisites?: string;
};

/** Returns goal-only content for agent prompts. */
export function goalOnly(sections: ContentSections): string {
  return sections.goal?.trim() ?? "";
}
