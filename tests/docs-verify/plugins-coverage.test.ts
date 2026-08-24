import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

// The Apps overview lists the AppKit plugins in a hand-curated table (each row
// has a description and cross-links we want a human to write). The plugin *set*,
// though, is synced from upstream into src/content/docs/appkit/v0/plugins/, so it
// grows without anyone touching the overview. This test pins the invariant: every
// synced plugin page must be linked from the overview, so the table can't
// silently fall behind. Add the missing row (or, if a new page documents a
// concept rather than a plugin, add it to NON_PLUGIN_PAGES).

const docsDir = resolve(process.cwd(), "src", "content", "docs");
const pluginsDir = resolve(docsDir, "appkit", "v0", "plugins");
const OVERVIEW = "apps/overview.md";

// Pages under appkit/v0/plugins/ that document concepts, not a single plugin.
const NON_PLUGIN_PAGES = new Set([
  "index",
  "custom-plugins",
  "execution-context",
  "manifest",
  "plugin-management",
  "stability",
  "testing",
]);

function pluginPages(): string[] {
  return readdirSync(pluginsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
    .filter((name) => !NON_PLUGIN_PAGES.has(name))
    .sort();
}

describe("Apps overview references every AppKit plugin", () => {
  const overview = readFileSync(resolve(docsDir, OVERVIEW), "utf-8");

  for (const plugin of pluginPages()) {
    test(`${OVERVIEW} links to the ${plugin} plugin`, () => {
      expect(
        overview.includes(`/docs/appkit/v0/plugins/${plugin}`),
        `${OVERVIEW} has no link to /docs/appkit/v0/plugins/${plugin}. Add a row for ` +
          `the ${plugin} plugin to its table, or add "${plugin}" to NON_PLUGIN_PAGES if ` +
          `it documents a concept rather than a plugin.`,
      ).toBe(true);
    });
  }
});
