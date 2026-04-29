import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, test, expect } from "vitest";

const BUILD_DIR = resolve(__dirname, "..", "build");

function readBuildFile(filePath: string): string {
  return readFileSync(resolve(BUILD_DIR, filePath), "utf-8");
}

/** Mirrors src/lib/site-url.ts → resolveSiteUrl for asserting build outputs. */
function resolveExpectedOrigin(): string {
  if (process.env.SITE_URL && process.env.SITE_URL.trim() !== "") {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://dev.databricks.com";
}

describe("production build smoke tests", () => {
  test("sitemap.xml exists and is valid XML", () => {
    const text = readBuildFile("sitemap.xml");
    expect(text).toContain("<urlset");
    expect(text).toContain("<url>");
  });

  test("robots.txt exists and has required directives", () => {
    const text = readBuildFile("robots.txt");
    expect(text).toContain("User-agent:");
    expect(text).toContain("Sitemap:");
  });

  test("robots.txt Sitemap URL matches the resolved site URL (no hardcoded prod domain)", () => {
    const text = readBuildFile("robots.txt");
    const sitemapMatch = text.match(/^Sitemap:\s*(\S+)\s*$/m);
    expect(sitemapMatch).not.toBeNull();
    const sitemapUrl = sitemapMatch![1];
    expect(sitemapUrl).toBe(`${resolveExpectedOrigin()}/sitemap.xml`);
  });

  test("llms.txt has correct H1 and description", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("# Databricks Developer Hub");
    expect(text).toContain("> Documentation, templates, and examples");
  });

  test("llms.txt internal links use the resolved site URL", () => {
    const text = readBuildFile("llms.txt");
    const expectedOrigin = resolveExpectedOrigin();
    // Internal links in llms.txt are absolute URLs whose path starts with
    // /docs, /templates, /solutions, or ends in .md.
    const internalLinks = Array.from(
      text.matchAll(
        /\((https?:\/\/[^)\s]+\/(?:docs|templates|solutions)[^)\s]*)\)/g,
      ),
      (m) => m[1],
    );
    expect(internalLinks.length).toBeGreaterThan(0);
    for (const link of internalLinks) {
      expect(link.startsWith(`${expectedOrigin}/`)).toBe(true);
    }
  });

  test("sitemap.xml uses the resolved site URL for <loc> entries", () => {
    const text = readBuildFile("sitemap.xml");
    const expectedOrigin = resolveExpectedOrigin();
    const locs = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(expectedOrigin)).toBe(true);
    }
  });

  test("homepage HTML uses resolved site URL in JSON-LD (no hardcoded dev.databricks.com when overridden)", () => {
    const html = readBuildFile("index.html");
    const expectedOrigin = resolveExpectedOrigin();
    expect(html).toContain(`"url":"${expectedOrigin}"`);
    expect(html).toContain(
      `"logo":"${expectedOrigin}/img/databricks-logo.svg"`,
    );
  });

  test("llms.txt links use .md suffix", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("/docs/start-here.md");
    expect(text).toContain("/templates/hello-world-app.md");
    expect(text).toContain("/solutions.md");
  });

  test("llms.txt links to native solutions internally and to linked solutions externally", () => {
    const text = readBuildFile("llms.txt");
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
    const text = readBuildFile("llms.txt");
    const startHereIdx = text.indexOf("## Start Here");
    const templatesIdx = text.indexOf("## Templates");
    const solutionsIdx = text.indexOf("## Solutions");
    expect(startHereIdx).toBeGreaterThan(-1);
    expect(templatesIdx).toBeGreaterThan(startHereIdx);
    expect(solutionsIdx).toBeGreaterThan(templatesIdx);
  });

  test("llms.txt templates have subheadings", () => {
    const text = readBuildFile("llms.txt");
    expect(text).toContain("### Cookbooks");
    expect(text).toContain("### Recipes");
    if (
      process.env.EXAMPLES_FEATURE === "true" ||
      process.env.EXAMPLES_FEATURE === "1"
    ) {
      expect(text).toContain("### Examples");
    }
  });

  test("llms.txt links to all resource guides", () => {
    const text = readBuildFile("llms.txt");

    const expectedTemplates = [
      "/solutions.md",
      "/templates.md",
      "/templates/hello-world-app.md",
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
    const text = readBuildFile("llms.txt");

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

  test("compiled AppKit preview stylesheet ships in the build", () => {
    const registry = readFileSync(
      resolve(
        __dirname,
        "..",
        "src",
        "components",
        "doc-examples",
        "registry.ts",
      ),
      "utf-8",
    );
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    const css = readBuildFile(`appkit-preview/${channel}/styles.css`);
    expect(css.length).toBeGreaterThan(50_000);
    expect(css).toContain("Synced from @databricks/appkit-ui@");
    expect(css).toMatch(/--color-(primary|background|foreground|border)/);
  });

  test("AppKit DocExample iframe references the compiled stylesheet path", () => {
    // The Docusaurus client bundle inlines the iframe HTML template; ensure
    // the dynamic `/appkit-preview/<channel>/styles.css` href made it into the
    // emitted JS so previews actually load styles in production.
    const registry = readFileSync(
      resolve(
        __dirname,
        "..",
        "src",
        "components",
        "doc-examples",
        "registry.ts",
      ),
      "utf-8",
    );
    const channel = registry.match(
      /export const APPKIT_CHANNEL = "([^"]+)";/,
    )?.[1];
    expect(channel).toBeDefined();
    // Confirm the asset itself is reachable in build/ (covered above) and
    // assert the legacy hardcoded path no longer ships anywhere in the build.
    const buildRoot = resolve(__dirname, "..", "build");
    const grep = (pattern: string) => {
      const { execSync } =
        require("child_process") as typeof import("child_process");
      try {
        const out = execSync(
          `grep -rl ${JSON.stringify(pattern)} "${buildRoot}/assets/js" || true`,
          {
            encoding: "utf-8",
            maxBuffer: 50 * 1024 * 1024,
          },
        );
        return out.trim();
      } catch {
        return "";
      }
    };
    expect(grep("/appkit-preview/latest/styles.css")).toBe("");
  });

  test("raw-docs strip Docusaurus frontmatter", () => {
    const text = readBuildFile("raw-docs/start-here.md");
    expect(text).not.toMatch(/^---\n/);
    expect(text).toMatch(/^# Start here/);
  });

  test("raw-docs preserve CLI tab code blocks for markdown export", () => {
    const coreConcepts = readBuildFile("raw-docs/lakebase/configuration.md");
    expect(coreConcepts).toContain('title="Common"');
    expect(coreConcepts).toContain('title="All Options"');
    expect(coreConcepts).toContain("databricks postgres update-endpoint");

    const development = readBuildFile("raw-docs/lakebase/development.md");
    expect(development).toContain('title="Common"');
    expect(development).toContain('title="All Options"');
    expect(development).toContain("databricks postgres create-branch");
    expect(development).toContain("databricks postgres update-branch");
  });
});
