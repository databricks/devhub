export const BOOTSTRAP_PROMPT_SECTION = "recipes" as const;
export const BOOTSTRAP_PROMPT_SLUG = "databricks-local-bootstrap" as const;

export function getBootstrapPromptApiPath(): string {
  return `/api/markdown?section=${BOOTSTRAP_PROMPT_SECTION}&slug=${BOOTSTRAP_PROMPT_SLUG}`;
}
