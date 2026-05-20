import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, test } from "vitest";
import { AGENT_PROMPT_STATIC_CONTENT_FILES } from "../api/content-markdown";

type VercelConfig = {
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
  functions: Record<
    string,
    { includeFiles?: string; maxDuration?: number } | undefined
  >;
};

const config = JSON.parse(
  readFileSync(resolve(__dirname, "..", "vercel.json"), "utf-8"),
) as VercelConfig;

function includeFilesFor(functionPath: string): string {
  const entry = config.functions[functionPath];
  if (!entry?.includeFiles) {
    throw new Error(
      `vercel.json is missing functions["${functionPath}"].includeFiles`,
    );
  }
  return entry.includeFiles;
}

/**
 * Minimal matcher for the glob dialect Vercel accepts in `includeFiles`:
 * top-level brace expansion (`{a,b,c}`) + `**` + `*`. Vercel itself uses
 * micromatch under the hood, but pulling in a runtime dep just for this test
 * isn't worth it — the patterns we ship are intentionally simple.
 */
function expandBraces(glob: string): string[] {
  const match = glob.match(/^\{([^{}]+)\}$/);
  return match ? match[1].split(",").map((part) => part.trim()) : [glob];
}

function globToRegex(glob: string): RegExp {
  const escaped = glob.replace(/[.+^$()|[\]\\]/g, "\\$&");
  const body = escaped
    .replace(/\*\*\/?/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, "(?:.*/)?");
  return new RegExp(`^${body}$`);
}

function isIncluded(file: string, includeFiles: string): boolean {
  return expandBraces(includeFiles).some((pattern) =>
    globToRegex(pattern).test(file),
  );
}

function unmatchedAgentPromptFiles(includeFiles: string): string[] {
  return AGENT_PROMPT_STATIC_CONTENT_FILES.filter(
    (file) => !isIncluded(file, includeFiles),
  );
}

function expectRewrite(source: string, destination: string): void {
  expect(config.rewrites).toContainEqual({ source, destination });
}

describe("vercel rewrites", () => {
  test("serves DevHub from /devhub while preserving Docusaurus baseUrl links", () => {
    expectRewrite("/devhub", "/");
    expectRewrite("/devhub/", "/");
    expectRewrite("/devhub/docs/(.*)", "/docs/$1");
    expectRewrite("/devhub/templates/(.*)", "/templates/$1");
    expectRewrite("/devhub/solutions/(.*)", "/solutions/$1");
  });

  test("serves DevHub API functions under /devhub/api", () => {
    expectRewrite("/devhub/api/(.*)", "/api/$1");
  });

  test("serves production static assets under /devhub without stripping dev-server assets", () => {
    expectRewrite("/devhub/assets/(.*)", "/assets/$1");
    expectRewrite("/devhub/img/(.*)", "/img/$1");
    expectRewrite("/devhub/appkit-preview/(.*)", "/appkit-preview/$1");
    expectRewrite("/devhub/raw-docs/(.*)", "/raw-docs/$1");
    expectRewrite("/devhub/sitemap.xml", "/sitemap.xml");
    expectRewrite("/devhub/robots.txt", "/robots.txt");
    expectRewrite("/devhub/search-doc(.*).json", "/search-doc$1.json");
    expectRewrite("/devhub/lunr-index(.*).json", "/lunr-index$1.json");
    expect(config.rewrites).not.toContainEqual({
      source: "/devhub/(.*)",
      destination: "/$1",
    });
  });

  test("keeps markdown export routes working under /devhub", () => {
    expectRewrite("/devhub/docs/llms.txt", "/api/llms");
    expectRewrite("/devhub/llms.txt", "/api/llms");
    expectRewrite(
      "/devhub/docs/(.+)\\.md",
      "/api/markdown?section=docs&slug=$1",
    );
    expectRewrite(
      "/devhub/templates/(.+)\\.md",
      "/api/markdown?section=templates&slug=$1",
    );
    expectRewrite(
      "/devhub/solutions/(.+)\\.md",
      "/api/markdown?section=solutions&slug=$1",
    );
    expectRewrite(
      "/devhub/templates.md",
      "/api/markdown?section=templates&slug=",
    );
    expectRewrite(
      "/devhub/solutions.md",
      "/api/markdown?section=solutions&slug=",
    );
  });
});

describe("vercel function includeFiles", () => {
  // Regression guard for the May 2026 outage where `loadAgentPromptParts`
  // grew new top-level content files (`dev-guidelines.md`, `intent-*.md`)
  // but `vercel.json`'s `includeFiles` glob wasn't updated. The deployed
  // function crashed with FUNCTION_INVOCATION_FAILED on the first
  // readFileSync, breaking the hero "Copy prompt for your agent" button
  // and every `/templates/<slug>.md` URL.

  test("every agent-prompt static content file is shipped (and actually exists on disk)", () => {
    for (const file of AGENT_PROMPT_STATIC_CONTENT_FILES) {
      const absolutePath = resolve(__dirname, "..", file);
      expect(
        existsSync(absolutePath),
        `${file} is declared as a static prompt part but missing on disk`,
      ).toBe(true);
    }
  });

  test("api/bootstrap-prompt.ts ships every file loadAgentPromptParts reads", () => {
    const missing = unmatchedAgentPromptFiles(
      includeFilesFor("api/bootstrap-prompt.ts"),
    );
    expect(
      missing,
      "Missing from api/bootstrap-prompt.ts includeFiles",
    ).toEqual([]);
  });

  test("api/markdown.ts ships every file loadAgentPromptParts reads", () => {
    const missing = unmatchedAgentPromptFiles(
      includeFilesFor("api/markdown.ts"),
    );
    expect(missing, "Missing from api/markdown.ts includeFiles").toEqual([]);
  });

  test("api/markdown.ts ships cookbook content used by readCookbookGoal/readCookbookIntro", () => {
    const include = includeFilesFor("api/markdown.ts");
    for (const path of [
      "content/cookbooks/ai-chat-app/intro.md",
      "content/cookbooks/ai-chat-app/goal.md",
    ]) {
      expect(
        isIncluded(path, include),
        `${path} is not matched by api/markdown.ts includeFiles ("${include}")`,
      ).toBe(true);
    }
  });

  test("the inline glob matcher correctly models Vercel includeFiles semantics", () => {
    // Sanity-check the helper so the assertions above can't silently pass
    // because of a buggy matcher.
    expect(
      isIncluded(
        "content/about-devhub.md",
        "{content/*.md,content/recipes/**/*.md}",
      ),
    ).toBe(true);
    expect(
      isIncluded(
        "content/recipes/foo/goal.md",
        "{content/*.md,content/recipes/**/*.md}",
      ),
    ).toBe(true);
    expect(
      isIncluded(
        "content/dev-guidelines.md",
        "{content/about-devhub.md,content/recipes/**/*.md}",
      ),
    ).toBe(false);
    expect(isIncluded("content/recipes/foo/goal.md", "content/*.md")).toBe(
      false,
    );
  });
});

describe("vercel headers", () => {
  test("applies API hardening headers to both root and /devhub API paths", () => {
    expect(config.headers).toContainEqual({
      source: "/api/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    });
    expect(config.headers).toContainEqual({
      source: "/devhub/api/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    });
  });
});
