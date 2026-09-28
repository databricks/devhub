import { readFileSync } from "fs";
import { resolve } from "path";

import { describe, expect, test } from "vitest";

type VercelConfig = {
  devCommand: string;
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
};

const config = JSON.parse(
  readFileSync(resolve(__dirname, "..", "vercel.json"), "utf-8"),
) as VercelConfig;
const legacyBasePathSegment = "devhub";

describe("vercel development command", () => {
  test("passes the port flag through pnpm to Next.js", () => {
    expect(config.devCommand).toBe("pnpm dev --port $PORT");
  });
});

function expectRewrite(source: string, destination: string): void {
  expect(config.rewrites).toContainEqual({ source, destination });
}

describe("vercel rewrites", () => {
  test("keeps markdown export routes working at the site root", () => {
    expectRewrite("/docs/llms.txt", "/llms.txt");
    expectRewrite("/docs/(.+)\\.md", "/api/markdown?section=docs&slug=$1");
    expectRewrite(
      "/templates/(.+)\\.md",
      "/api/markdown?section=templates&slug=$1",
    );
    expectRewrite("/templates.md", "/api/markdown?section=templates&slug=");
    expectRewrite("/raw-docs/(.*)", "/api/markdown?section=docs&slug=$1");
  });

  test("does not keep legacy base-path rewrites", () => {
    expect(
      config.rewrites.some(
        (rewrite) => rewrite.source.split("/")[1] === legacyBasePathSegment,
      ),
    ).toBe(false);
  });
});

describe("vercel headers", () => {
  test("caches the versioned home hero player asset", () => {
    const cacheHeader = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };

    expect(config.headers).toContainEqual({
      source: "/js/home-hero-player.js",
      headers: [cacheHeader],
    });
  });

  test("applies API hardening headers at the site root", () => {
    expect(config.headers).toContainEqual({
      source: "/api/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    });
  });

  test("serves the generated agent index inline", () => {
    const llmsHeaders = [
      { key: "Cache-Control", value: "public, max-age=0, s-maxage=600" },
      { key: "Content-Disposition", value: 'inline; filename="llms.txt"' },
    ];
    expect(config.headers).toContainEqual({
      source: "/llms.txt",
      headers: llmsHeaders,
    });
  });

  test("does not keep legacy base-path headers", () => {
    expect(
      config.headers.some(
        (header) => header.source.split("/")[1] === legacyBasePathSegment,
      ),
    ).toBe(false);
  });
});

const generatedFilesHeading = "# Generated files";

function readGitignoreGeneratedPaths(): string[] {
  const block = readFileSync(resolve(__dirname, "..", ".gitignore"), "utf-8")
    .split(/\n\s*\n/)
    .find((section) => section.startsWith(generatedFilesHeading));

  if (!block) {
    throw new Error(`Missing "${generatedFilesHeading}" block in .gitignore`);
  }

  return block.trim().split("\n").slice(1);
}

describe("vercel upload ignores", () => {
  // The Vercel CLI builds its upload ignore set from .vercelignore and never
  // reads .gitignore, so a generated path listed only in .gitignore gets
  // uploaded stale. The build then regenerates the tree without that file and
  // "Deploying outputs" fails with ENOENT on the now-missing path.
  test("excludes every generated path that .gitignore excludes", () => {
    const vercelignore = readFileSync(
      resolve(__dirname, "..", ".vercelignore"),
      "utf-8",
    ).split("\n");

    for (const generatedPath of readGitignoreGeneratedPaths()) {
      expect(vercelignore).toContain(generatedPath);
    }
  });
});
