import { describe, expect, test } from "vitest";

import { getSuggestEditsUrl } from "../src/lib/suggest-edits-url";

describe("getSuggestEditsUrl", () => {
  test("points DevHub docs at their real src/content/docs path on main", () => {
    expect(getSuggestEditsUrl("start-here.md")).toBe(
      "https://github.com/databricks/devhub/edit/main/src/content/docs/start-here.md",
    );
  });

  test("preserves nested paths and .mdx extensions for DevHub docs", () => {
    expect(getSuggestEditsUrl("apps/overview.mdx")).toBe(
      "https://github.com/databricks/devhub/edit/main/src/content/docs/apps/overview.mdx",
    );
  });

  test("maps AppKit docs back to the upstream appkit repo, dropping the channel dir", () => {
    expect(getSuggestEditsUrl("appkit/v0/plugins/ai-search.md")).toBe(
      "https://github.com/databricks/appkit/edit/main/docs/docs/plugins/ai-search.md",
    );
  });

  test("maps the AppKit channel index page", () => {
    expect(getSuggestEditsUrl("appkit/v0/index.md")).toBe(
      "https://github.com/databricks/appkit/edit/main/docs/docs/index.md",
    );
  });

  test("is channel-agnostic so future AppKit majors keep resolving", () => {
    expect(getSuggestEditsUrl("appkit/v1/api/appkit/Interface.Foo.md")).toBe(
      "https://github.com/databricks/appkit/edit/main/docs/docs/api/appkit/Interface.Foo.md",
    );
  });

  // Guards the coupling documented in src/lib/suggest-edits-url.ts: today every
  // appkit/<channel>/ file is vendored from upstream docs/docs/. If the sync
  // script's versioned-docs TODO lands, version-channel files will instead come
  // from docs/versioned_docs/version-<n>/ and this expectation must change in
  // lockstep with the mapping.
  test("assumes AppKit channels are vendored from upstream docs/docs", () => {
    expect(getSuggestEditsUrl("appkit/v0/configuration.mdx")).toBe(
      "https://github.com/databricks/appkit/edit/main/docs/docs/configuration.mdx",
    );
  });
});
