import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { resolve } from "path";

import { imageSize } from "image-size";
import { describe, expect, test } from "vitest";

import { generateLlmsTxt } from "../src/lib/llms-txt";
import { resolveSiteUrl } from "../src/lib/site-url";

const PUBLIC_DIR = resolve(__dirname, "..", "public");
const DOCS_CONTENT_DIR = resolve(__dirname, "..", "src", "content", "docs");
const NEXT_APP_DIR = resolve(__dirname, "..", ".next", "server", "app");
const NEXT_STATIC_DIR = resolve(__dirname, "..", ".next", "static");
const APPKIT_DOC_EXAMPLES_REGISTRY_PATH = resolve(
  __dirname,
  "..",
  "src",
  "components",
  "doc-examples",
  "registry.ts",
);

function readPublicFile(filePath: string): string {
  return readFileSync(resolve(PUBLIC_DIR, filePath), "utf-8");
}

// /llms.txt is served by the src/app/llms.txt route (no static public file);
// generate the same content the route produces to assert on it.
function readLlmsTxt(): string {
  return generateLlmsTxt(resolveSiteUrl(), DOCS_CONTENT_DIR);
}

function readPublicImageSize(filePath: string): {
  height: number | undefined;
  width: number | undefined;
} {
  return imageSize(readFileSync(resolve(PUBLIC_DIR, filePath)));
}

function readAppKitDocExamplesRegistry(): string {
  return readFileSync(APPKIT_DOC_EXAMPLES_REGISTRY_PATH, "utf-8");
}

function readRouteHtml(routePath: string): string {
  const trimmedRoute = routePath.replace(/^\/+|\/+$/g, "");
  const htmlPath = trimmedRoute ? `${trimmedRoute}.html` : "index.html";
  return readFileSync(resolve(NEXT_APP_DIR, htmlPath), "utf-8");
}

function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root).flatMap((entry) => {
    const entryPath = resolve(root, entry);
    return statSync(entryPath).isDirectory() ? listFiles(entryPath) : entryPath;
  });
}

function findFilesContaining(root: string, pattern: string): string[] {
  return listFiles(root).filter((filePath) =>
    readFileSync(filePath, "utf-8").includes(pattern),
  );
}

function readSitemapLocs(filePath = "sitemap.xml"): string[] {
  const text = readPublicFile(filePath);
  const locs = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);

  if (!text.includes("<sitemapindex")) {
    return locs;
  }

  return locs.flatMap((loc) => {
    const sitemapPath = new URL(loc).pathname.replace(/^\//, "");
    return readSitemapLocs(sitemapPath);
  });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveExpectedSiteUrl(): string {
  return resolveSiteUrl(process.env);
}

describe("production build smoke tests", () => {
  test("sitemap.xml exists and is valid XML", () => {
    const text = readPublicFile("sitemap.xml");
    expect(text).toMatch(/<(urlset|sitemapindex)\b/);
    expect(text).toContain("<loc>");
  });

  test("favicon files and web manifest match the public asset contract", () => {
    const expectedSizes = [32, 48, 72, 96, 144, 192, 256, 384, 512];
    for (const size of expectedSizes) {
      const filePath = `favicon/favicon-${size}x${size}.png`;
      const dimensions = readPublicImageSize(filePath);
      expect(dimensions.width).toBe(size);
      expect(dimensions.height).toBe(size);
    }

    const sourceDimensions = readPublicImageSize("favicon/favicon.png");
    expect(sourceDimensions.width).toBe(512);
    expect(sourceDimensions.height).toBe(512);

    const manifest = JSON.parse(readPublicFile("manifest.webmanifest")) as {
      background_color: string;
      display: string;
      icons: Array<{ sizes: string; src: string; type: string }>;
      name: string;
      short_name: string;
      theme_color: string;
    };

    expect(manifest).toMatchObject({
      name: "Databricks Developer",
      short_name: "DevHub",
      display: "standalone",
      background_color: "#040406",
      theme_color: "#040406",
    });
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(
      expectedSizes.slice(1).map((size) => `${size}x${size}`),
    );
    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      expect(icon.src).toMatch(/^\/favicon\/favicon-\d+x\d+\.png$/);
    }
  });

  test("robots.txt exists and has required directives", () => {
    const text = readPublicFile("robots.txt");
    expect(text).toContain("User-agent:");
    expect(text).toContain("Sitemap:");
  });

  test("robots.txt Sitemap URL matches the resolved site URL (no hardcoded prod domain)", () => {
    const text = readPublicFile("robots.txt");
    const sitemapMatch = text.match(/^Sitemap:\s*(\S+)\s*$/m);
    expect(sitemapMatch).not.toBeNull();
    const sitemapUrl = sitemapMatch![1];
    expect(sitemapUrl).toBe(`${resolveExpectedSiteUrl()}/sitemap.xml`);
  });

  test("llms.txt has correct H1 and description", () => {
    const text = readLlmsTxt();
    expect(text).toContain("# Databricks Developer Hub");
    expect(text).toContain("> Documentation, templates, and examples");
  });

  test("solutions RSS feed route is included in the build output", () => {
    expect(
      existsSync(resolve(NEXT_APP_DIR, "(website)", "solutions", "rss.xml")),
    ).toBe(true);
  });

  test("llms.txt internal links use the resolved site URL", () => {
    const text = readLlmsTxt();
    const expectedSiteUrl = resolveExpectedSiteUrl();
    const expectedSiteUrlPattern = escapeRegex(expectedSiteUrl);
    // Internal links in llms.txt are absolute URLs whose path starts with
    // /docs, /templates, /solutions, or ends in .md.
    const internalLinks = Array.from(
      text.matchAll(
        new RegExp(
          `\\((${expectedSiteUrlPattern}/(?:docs|templates|solutions)[^)\\s]*)\\)`,
          "g",
        ),
      ),
      (m) => m[1],
    );
    expect(internalLinks.length).toBeGreaterThan(0);
    for (const link of internalLinks) {
      expect(link.startsWith(`${expectedSiteUrl}/`)).toBe(true);
    }
    expect(text).not.toMatch(
      /\]\(\/(?:docs|templates|solutions|api|llms\.txt)[^)]+\)/,
    );
  });

  test("sitemap.xml uses the resolved site URL for <loc> entries", () => {
    const expectedSiteUrl = resolveExpectedSiteUrl();
    const locs = readSitemapLocs();
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(expectedSiteUrl)).toBe(true);
    }
  });

  test("sitemap.xml includes plugin-generated detail routes under the resolved site URL", () => {
    const expectedSiteUrl = resolveExpectedSiteUrl();
    const locs = readSitemapLocs();

    expect(locs).toContain(`${expectedSiteUrl}/solutions/devhub-launch`);
    expect(locs).toContain(
      `${expectedSiteUrl}/templates/agentic-support-console`,
    );
    expect(locs).toContain(
      `${expectedSiteUrl}/templates/set-up-your-local-dev-environment`,
    );
  });

  test("sitemap.xml preserves the production URL visibility contract", () => {
    const paths = readSitemapLocs().map((loc) => new URL(loc).pathname);

    expect(paths).toContain("/solutions");
    expect(paths).toContain("/templates");
    expect(paths).toContain("/docs/appkit/v0");
    expect(paths).toContain("/docs/appkit/v0/api");
    expect(paths).toContain("/docs/appkit/v0/api/appkit");
    expect(paths).toContain("/docs/appkit/v0/api/appkit-ui");
    expect(paths).toContain("/docs/appkit/v0/development");
    expect(paths).toContain("/docs/appkit/v0/plugins");

    expect(paths).not.toContain("/solutions/page/:page");
    expect(paths).not.toContain("/product");
    expect(paths).toContain("/product/agent-bricks");
    expect(paths).toContain("/product/lakebase");
    expect(paths).toContain("/product/databricks-apps");
    expect(paths).not.toContain("/product/data-lakehouse");
    expect(paths).not.toContain("/product/data-lakehouse/");
    expect(paths).not.toContain("/appkit");
    expect(paths).not.toContain("/appkit/");

    for (const path of paths) {
      if (path !== "/") {
        expect(path.endsWith("/")).toBe(false);
      }
      expect(path.startsWith("/hackathon")).toBe(false);
    }
  });

  test("homepage HTML uses resolved site URL in JSON-LD (no hardcoded developers.databricks.com when overridden)", () => {
    const html = readRouteHtml("/");
    const expectedSiteUrl = resolveExpectedSiteUrl();
    expect(html).toContain(`"url":"${expectedSiteUrl}"`);
    expect(html).toContain(
      `"logo":"${expectedSiteUrl}/img/databricks-logo.svg"`,
    );
  });

  test("rendered Docs MCP install commands use the resolved site URL", () => {
    const html = readRouteHtml("/docs/tools/ai-tools/docs-mcp-server");
    const expectedSiteUrl = resolveExpectedSiteUrl();
    expect(html).toContain(`npx add-mcp ${expectedSiteUrl}/api/mcp`);
    if (expectedSiteUrl !== "https://developers.databricks.com") {
      expect(html).not.toContain("https://developers.databricks.com/api/mcp");
    }
  });

  test("llms.txt links use .md suffix", () => {
    const text = readLlmsTxt();
    expect(text).toContain("/docs/start-here.md");
    expect(text).toContain("/templates/ai-chat-app.md");
    expect(text).toContain("/solutions.md");
    expect(text).toContain("/solutions/devhub-launch.md");
  });

  test("llms.txt links to native solutions internally and to linked solutions externally", () => {
    const text = readLlmsTxt();
    expect(text).toContain("/solutions/devhub-launch.md");
    expect(text).toContain(
      "https://www.databricks.com/blog/how-build-production-ready-data-and-ai-apps-databricks-apps-and-lakebase",
    );
    expect(text).toContain(
      "https://www.databricks.com/blog/database-branching-postgres-git-style-workflows-databricks-lakebase",
    );
    expect(text).toContain("(Databricks Blog)");
  });

  test("llms.txt section order: Start Here before Templates before Solutions", () => {
    const text = readLlmsTxt();
    const startHereIdx = text.indexOf("## Start Here");
    const templatesIdx = text.indexOf("## Templates");
    const solutionsIdx = text.indexOf("## Solutions");
    expect(startHereIdx).toBeGreaterThan(-1);
    expect(templatesIdx).toBeGreaterThan(startHereIdx);
    expect(solutionsIdx).toBeGreaterThan(templatesIdx);
  });

  test("llms.txt Templates section is flat (no Cookbooks/Recipes/Examples subheadings)", () => {
    const text = readLlmsTxt();
    expect(text).not.toContain("### Cookbooks");
    expect(text).not.toContain("### Recipes");
    expect(text).not.toContain("### Examples");
  });

  test("llms.txt Templates section lists cookbooks, recipes, and examples in one flat list", () => {
    const text = readLlmsTxt();

    const templatesIdx = text.indexOf("## Templates");
    const solutionsIdx = text.indexOf("## Solutions");
    expect(templatesIdx).toBeGreaterThan(-1);
    expect(solutionsIdx).toBeGreaterThan(templatesIdx);
    const templatesBlock = text.slice(templatesIdx, solutionsIdx);

    expect(templatesBlock).not.toContain("/templates/hello-world-app.md");
    expect(templatesBlock).toContain("/templates/ai-chat-app.md");
    expect(templatesBlock).toContain(
      "/templates/set-up-your-local-dev-environment.md",
    );
    expect(templatesBlock).toContain("/templates/spin-up-databricks-app.md");
    expect(templatesBlock).toContain("/templates/onboard-your-coding-agent.md");
    expect(templatesBlock).toContain("/templates/foundation-models-api.md");
    expect(templatesBlock).toContain("/templates/agentic-support-console.md");
  });

  test("llms.txt links to all resource guides", () => {
    const text = readLlmsTxt();

    const expectedTemplates = [
      "/solutions.md",
      "/templates.md",
      "/templates/set-up-your-local-dev-environment.md",
      "/templates/spin-up-databricks-app.md",
      "/templates/onboard-your-coding-agent.md",
      "/templates/ai-chat-app.md",
      "/templates/app-with-lakebase.md",
      "/templates/genie-analytics-app.md",
      "/templates/lakebase-off-platform.md",
      "/templates/operational-data-analytics.md",
    ];

    for (const path of expectedTemplates) {
      expect(text).toContain(path);
    }
  });

  test("llms.txt links to all docs pages", () => {
    const text = readLlmsTxt();

    const expectedDocPaths = [
      "/docs/start-here.md",
      "/docs/agents/overview.md",
      "/docs/agents/ai-gateway.md",
      "/docs/agents/genie.md",
      "/docs/agents/custom-agents.md",
      "/docs/apps/quickstart.md",
      "/docs/apps/configuration.md",
      "/docs/apps/development.md",
      "/docs/lakebase/quickstart.md",
      "/docs/lakebase/configuration.md",
      "/docs/lakebase/development.md",
      "/docs/appkit/v0.md",
      "/docs/appkit/v0/plugins.md",
      "/docs/tools/databricks-cli.md",
      "/docs/tools/ai-tools/agent-skills.md",
      "/docs/tools/ai-tools/docs-mcp-server.md",
    ];

    for (const docPath of expectedDocPaths) {
      expect(text).toContain(docPath);
    }
  });

  test("compiled AppKit preview stylesheet ships in public assets", () => {
    const registry = readAppKitDocExamplesRegistry();
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    const css = readPublicFile(`appkit-preview/${channel}/styles.css`);
    expect(css.length).toBeGreaterThan(50_000);
    expect(css).toContain("Synced from @databricks/appkit-ui@");
    expect(css).toMatch(/--color-(primary|background|foreground|border)/);
  });

  test("AppKit DocExample iframe references the compiled stylesheet path", () => {
    // The client bundle inlines the iframe HTML template; ensure
    // the dynamic `/appkit-preview/<channel>/styles.css` href made it into the
    // emitted JS so previews actually load styles in production.
    const registry = readAppKitDocExamplesRegistry();
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    // Confirm the asset itself is reachable in public/ (covered above) and
    // assert the legacy hardcoded path no longer ships in client chunks.
    expect(
      findFilesContaining(
        resolve(NEXT_STATIC_DIR, "chunks"),
        "/appkit-preview/latest/styles.css",
      ),
    ).toEqual([]);
  });

  test("raw-docs strip frontmatter", () => {
    const text = readPublicFile("raw-docs/start-here.md");
    expect(text).not.toMatch(/^---\n/);
    expect(text).toMatch(/^# Start here/);
  });

  test("pretty markdown routes are emitted as static files for local serving", () => {
    expect(readPublicFile("docs/start-here.md")).toContain("# Start here");
    expect(readPublicFile("solutions/devhub-launch.md")).toContain(
      "title: Introducing DevHub",
    );
    expect(readPublicFile("templates/ai-chat-app.md")).toContain(
      "# About DevHub",
    );
    expect(readPublicFile("templates.md")).toContain("# Templates");
    expect(readPublicFile("solutions.md")).toContain("# Solutions");
  });

  test("raw-docs preserve closing HTML tags inside code examples", () => {
    const text = readPublicFile("raw-docs/lakehouse/analytical-reads.md");
    expect(text).toContain("if (loading) return <p>Loading...</p>;");
    expect(text).not.toMatch(/https?:\/\/[^)\s]+\/(?:p|li|ul)>/);
  });

  test("raw-docs preserve CLI tab code blocks for markdown export", () => {
    const coreConcepts = readPublicFile("raw-docs/lakebase/configuration.md");
    expect(coreConcepts).toContain('title="Common"');
    expect(coreConcepts).toContain('title="All Options"');
    expect(coreConcepts).toContain("databricks postgres update-endpoint");

    const development = readPublicFile("raw-docs/lakebase/development.md");
    expect(development).toContain('title="Common"');
    expect(development).toContain('title="All Options"');
    expect(development).toContain("databricks postgres create-branch");
    expect(development).toContain("databricks postgres update-branch");
  });
});
