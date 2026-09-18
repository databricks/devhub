import { describe, expect, test } from "vitest";

import { normalizeSyncedDocLinks } from "../scripts/normalize-appkit-doc-links.mjs";
import { getUniqueMarkdownHeadingId } from "../src/lib/markdown-heading-ids";

const appKitErrorSource = [
  "## Properties",
  "### \\_clientMessage?",
  "## Accessors",
  "### clientMessage",
].join("\n");

const inheritedMembers = [
  "[`_clientMessage`](Class.AppKitError.md#_clientmessage)",
  "[`clientMessage`](Class.AppKitError.md#clientmessage)",
].join("\n");

describe("AppKit link normalization", () => {
  test("inherited property and accessor links reach their distinct rendered headings", () => {
    const headingIds = new Map<string, number>();
    const propertyId = getUniqueMarkdownHeadingId(
      "_clientMessage?",
      headingIds,
    );
    const accessorId = getUniqueMarkdownHeadingId("clientMessage", headingIds);

    expect(propertyId).not.toBe(accessorId);
    expect(
      normalizeSyncedDocLinks(inheritedMembers, {
        channel: "v0",
        appKitErrorSource,
      }),
    ).toBe(
      [
        "[`_clientMessage`](Class.AppKitError.md#" + propertyId + ")",
        "[`clientMessage`](Class.AppKitError.md#" + accessorId + ")",
      ].join("\n"),
    );
  });

  test("cached syncs are idempotent, including the two colliding member names", () => {
    const source = [
      inheritedMembers,
      "[Lakebase](./lakebase.md#on-behalf-of-obo--per-user-connections)",
      "[API Reference](/docs/api/appkit-ui)",
    ].join("\n");
    const options = { channel: "v0", appKitErrorSource };
    const normalized = normalizeSyncedDocLinks(source, options);

    expect(normalized).not.toBe(source);
    expect(normalizeSyncedDocLinks(normalized, options)).toBe(normalized);
  });

  test("older channels without the protected field retain the accessor anchor", () => {
    const source = "[`clientMessage`](Class.AppKitError.md#clientmessage)";
    expect(
      normalizeSyncedDocLinks(source, {
        channel: "version-0.1",
        appKitErrorSource: "## Accessors\n### clientMessage",
      }),
    ).toBe(source);
  });

  test("the Lakebase link matches DevHub's rendered punctuation and whitespace slug", () => {
    const headingId = getUniqueMarkdownHeadingId(
      "On-Behalf-Of (OBO) — per-user connections",
      new Map(),
    );
    expect(
      normalizeSyncedDocLinks(
        "[Lakebase](./lakebase.md#on-behalf-of-obo--per-user-connections)",
        { channel: "v0" },
      ),
    ).toBe(`[Lakebase](./lakebase.md#${headingId})`);
  });

  test.each(["v0", "v1", "version-1.2"])(
    "legacy API links stay in their source documentation channel %s",
    (channel) => {
      expect(
        normalizeSyncedDocLinks(
          "[API Reference](/docs/api/appkit-ui)\n[Styling](/docs/api/appkit-ui/styling#color-system)",
          { channel },
        ),
      ).toBe(
        `[API Reference](/docs/appkit/${channel}/api/appkit-ui)\n[Styling](/docs/appkit/${channel}/api/appkit-ui/styling#color-system)`,
      );
    },
  );

  test("unrelated links and already versioned paths are unchanged", () => {
    const source = [
      "[API Reference](/docs/appkit/v0/api/appkit-ui)",
      "[External API](https://example.com/docs/api/appkit-ui)",
      "[`clientMessage`](Class.OtherError.md#clientmessage)",
      "[Other section](./lakebase.md#configuration)",
    ].join("\n");
    expect(
      normalizeSyncedDocLinks(source, { channel: "v0", appKitErrorSource }),
    ).toBe(source);
  });
});
