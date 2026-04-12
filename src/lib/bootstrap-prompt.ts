export const BOOTSTRAP_PROMPT_SECTION = "recipes" as const;
export const BOOTSTRAP_PROMPT_SLUG = "databricks-local-bootstrap" as const;
export const ABOUT_DEVHUB_SLUG = "about-devhub" as const;

export function getBootstrapPromptApiPath(): string {
  return `/api/bootstrap-prompt`;
}

export function getRecipeMarkdownApiPath(): string {
  return `/api/markdown?section=${BOOTSTRAP_PROMPT_SECTION}&slug=${BOOTSTRAP_PROMPT_SLUG}`;
}
