export function showDrafts(): boolean {
  const value = process.env.SHOW_DRAFTS;
  return value === "true" || value === "1";
}

export function examplesEnabled(): boolean {
  const value = process.env.EXAMPLES_FEATURE;
  return value === "true" || value === "1";
}
