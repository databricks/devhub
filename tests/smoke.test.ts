import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const PORT = 4_173;
const BASE_URL = `http://localhost:${PORT}`;

let serveProc: Bun.Subprocess;

beforeAll(async () => {
  const projectRoot = new URL("..", import.meta.url).pathname;

  const clean = Bun.spawn(["bun", "run", "clear"], {
    cwd: projectRoot,
    stdout: "ignore",
    stderr: "ignore",
  });
  await clean.exited;

  const build = Bun.spawn(["bun", "run", "build"], {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
  if ((await build.exited) !== 0) {
    throw new Error("Build failed");
  }

  serveProc = Bun.spawn(
    ["bunx", "docusaurus", "serve", "--port", String(PORT), "--no-open"],
    { cwd: projectRoot, stdout: "ignore", stderr: "ignore" },
  );

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
    } catch {
      /* not ready */
    }
    await Bun.sleep(500);
  }
  throw new Error("Server failed to start within 30 s");
}, 180_000);

afterAll(() => {
  serveProc?.kill();
});

describe("production build smoke tests", () => {
  test("sitemap.xml exists and is valid XML", async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<urlset");
    expect(text).toContain("<url>");
  });

  test("robots.txt exists and has required directives", async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("User-agent:");
    expect(text).toContain("Sitemap:");
  });

  test("llms.txt exists", async () => {
    const res = await fetch(`${BASE_URL}/llms.txt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("# Databricks Developer");
  });

  test("llms.txt links to all resource templates", async () => {
    const text = await fetch(`${BASE_URL}/llms.txt`).then((r) => r.text());

    const expectedTemplates = [
      "/solutions",
      "/resources",
      "/resources/base-app-template",
      "/resources/ai-chat-app-template",
    ];

    for (const path of expectedTemplates) {
      expect(text).toContain(path);
    }
  });

  test("llms.txt links to all docs pages", async () => {
    const text = await fetch(`${BASE_URL}/llms.txt`).then((r) => r.text());

    const expectedDocPaths = [
      "/docs/get-started/getting-started",
      "/docs/get-started/your-first-app",
      "/docs/get-started/core-concepts",
      "/docs/agents/getting-started",
      "/docs/agents/core-concepts",
      "/docs/agents/development",
      "/docs/agents/ai-gateway",
      "/docs/agents/observability",
      "/docs/apps/getting-started",
      "/docs/apps/core-concepts",
      "/docs/apps/plugins",
      "/docs/apps/development",
      "/docs/lakebase",
      "/docs/lakebase/getting-started",
      "/docs/lakebase/core-concepts",
      "/docs/lakebase/development",
      "/docs/appkit",
      "/docs/tools/databricks-cli",
      "/docs/tools/appkit",
      "/docs/tools/ai-tools/agent-skills",
      "/docs/tools/ai-tools/docs-mcp-server",
      "/docs/references/appkit",
    ];

    for (const docPath of expectedDocPaths) {
      expect(text).toContain(docPath);
    }
  });
});
