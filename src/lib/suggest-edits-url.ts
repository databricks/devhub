// Builds the GitHub "Suggest edits" link for a doc page. Most DevHub docs point
// back at their file on databricks/devhub main.
//
// AppKit is the exception: scripts/sync-appkit-docs.mjs vendors databricks/appkit
// docs/docs/** into the gitignored src/content/docs/appkit/<channel>/** (channel
// = v0, v1, ... = the installed @databricks/appkit-ui major), so an edit here
// would be lost on the next sync. We reverse that mapping to the upstream file,
// dropping the DevHub-only channel dir.
//
// This assumes every appkit/<channel>/ file comes from upstream docs/docs/. The
// sync script has a TODO to also vendor docs/versioned_docs/version-<n>/, which
// would break that assumption; tests/suggest-edits-url.test.ts guards it.
//
// The returned URL is derived purely from the path; existence upstream is not
// verified, so a repo restructure could yield a link that 404s.

const DEVHUB_EDIT_BASE = "https://github.com/databricks/devhub/edit/main";
const APPKIT_EDIT_BASE = "https://github.com/databricks/appkit/edit/main";

// `relativeDocsPath` is a doc's posix path relative to src/content/docs, e.g.
// "start-here.md" or "appkit/v0/plugins/ai-search.md".
export function getSuggestEditsUrl(relativeDocsPath: string): string {
  const appkitMatch = relativeDocsPath.match(/^appkit\/[^/]+\/(.+)$/);
  if (appkitMatch) {
    return `${APPKIT_EDIT_BASE}/docs/docs/${appkitMatch[1]}`;
  }
  return `${DEVHUB_EDIT_BASE}/src/content/docs/${relativeDocsPath}`;
}
