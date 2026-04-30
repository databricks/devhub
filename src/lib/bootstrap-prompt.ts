export const BOOTSTRAP_PROMPT_SECTION = "recipes" as const;
export const BOOTSTRAP_PROMPT_SLUG = "databricks-local-bootstrap" as const;
export const ABOUT_DEVHUB_SLUG = "about-devhub" as const;

export function getBootstrapPromptApiPath(): string {
  return `/api/bootstrap-prompt`;
}
