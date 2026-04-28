import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Locks the contract between scripts/sync-appkit-docs.mjs and
 * src/components/DocExample.tsx:
 *
 *   1. The sync writes a channel directory like static/appkit-preview/<channel>/
 *      keyed by the installed @databricks/appkit-ui major version.
 *   2. The generated registry.ts exports APPKIT_CHANNEL = "<channel>".
 *   3. DocExample.tsx loads `/appkit-preview/<channel>/styles.css` using
 *      that exported channel — never a hardcoded "latest" or "v0".
 *
 * If any of these drift, AppKit component previews fall back to browser
 * defaults (the bug fixed in this commit), so we want a fast unit-level
 * regression guard.
 */

const REPO_ROOT = resolve(__dirname, "..");

function readPkgMajor(): string {
  const pkgJson = resolve(
    REPO_ROOT,
    "node_modules",
    "@databricks",
    "appkit-ui",
    "package.json",
  );
  const { version } = JSON.parse(readFileSync(pkgJson, "utf-8")) as {
    version: string;
  };
  return version.split(".")[0];
}

describe("AppKit sync channel wiring", () => {
  test("sync output writes APPKIT_CHANNEL into the generated registry", () => {
    const registryPath = resolve(
      REPO_ROOT,
      "src",
      "components",
      "doc-examples",
      "registry.ts",
    );
    expect(
      existsSync(registryPath),
      `Expected ${registryPath} to exist; run \`npm run sync:appkit-docs\` first.`,
    ).toBe(true);
    const text = readFileSync(registryPath, "utf-8");
    const match = text.match(
      /export const APPKIT_CHANNEL = "(?<channel>[^"]+)";/,
    );
    expect(match?.groups?.channel).toBeDefined();
    const channel = match!.groups!.channel;
    expect(channel).toMatch(/^v\d+$/);
    const expectedMajor = readPkgMajor();
    expect(channel).toBe(`v${expectedMajor}`);
  });

  test("compiled styles are written to the channel directory the registry advertises", () => {
    const registry = readFileSync(
      resolve(REPO_ROOT, "src", "components", "doc-examples", "registry.ts"),
      "utf-8",
    );
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    const stylesPath = resolve(
      REPO_ROOT,
      "static",
      "appkit-preview",
      channel!,
      "styles.css",
    );
    expect(
      existsSync(stylesPath),
      `Expected compiled stylesheet at ${stylesPath}`,
    ).toBe(true);
    const css = readFileSync(stylesPath, "utf-8");
    // The synced bundle should be a real Tailwind v4 build (not an empty
    // placeholder) — sanity-check on size and on a couple of expected design
    // tokens that AppKit ships.
    expect(css.length).toBeGreaterThan(50_000);
    expect(css).toContain("Synced from @databricks/appkit-ui@");
    expect(css).toMatch(/--color-(primary|background|foreground|border)/);
  });

  test("DocExample.tsx loads the styles via APPKIT_CHANNEL — never hardcodes a channel", () => {
    const docExamplePath = resolve(
      REPO_ROOT,
      "src",
      "components",
      "DocExample.tsx",
    );
    const text = readFileSync(docExamplePath, "utf-8");
    expect(text).toContain("APPKIT_CHANNEL");
    expect(text).toContain("`/appkit-preview/${APPKIT_CHANNEL}/styles.css`");
    // Guard: regressions back to the original bug.
    expect(text).not.toContain('"/appkit-preview/latest/styles.css"');
    expect(text).not.toMatch(/['"`]\/appkit-preview\/v\d+\/styles\.css['"`]/);
  });

  test("synced AppKit docs channel directory matches the registry channel", () => {
    const registry = readFileSync(
      resolve(REPO_ROOT, "src", "components", "doc-examples", "registry.ts"),
      "utf-8",
    );
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    const channelDocsDir = resolve(REPO_ROOT, "docs", "appkit", channel!);
    expect(existsSync(channelDocsDir)).toBe(true);
    expect(
      existsSync(resolve(channelDocsDir, ".source-ref")),
      "missing .source-ref — sync did not complete",
    ).toBe(true);
  });
});
