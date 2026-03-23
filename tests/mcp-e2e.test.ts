import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { spawn, execFile, type ChildProcess } from "child_process";
import { promisify } from "util";
import { resolve } from "path";
import { createServer } from "net";

const execFileAsync = promisify(execFile);
const ROOT = resolve(__dirname, "..");
let SITE_PORT = 4174;
let MCP_PORT = 3002;
let MCP_URL = `http://localhost:${MCP_PORT}/api/mcp`;

async function getFreePort(): Promise<number> {
  return await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Failed to allocate free port")));
        return;
      }
      const port = address.port;
      server.close((closeErr) => {
        if (closeErr) {
          reject(closeErr);
          return;
        }
        resolvePort(port);
      });
    });
  });
}

async function waitForServer(
  url: string,
  timeoutMs: number,
  requireOkResponse = false,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (!requireOkResponse || response.ok) {
        return;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} not ready within ${timeoutMs}ms`);
}

async function mcporter(...args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(
    "npx",
    [
      "--yes",
      "mcporter",
      ...args,
      "--http-url",
      MCP_URL,
      "--allow-http",
      "--name",
      "devhub",
    ],
    { cwd: ROOT, encoding: "utf-8", timeout: 30_000 },
  );
  return stdout.trim();
}

describe("MCP server e2e (mcporter)", () => {
  let siteServer: ChildProcess;
  let mcpServer: ChildProcess;

  beforeAll(async () => {
    SITE_PORT = await getFreePort();
    MCP_PORT = await getFreePort();
    MCP_URL = `http://127.0.0.1:${MCP_PORT}/api/mcp`;

    siteServer = spawn(
      "npx",
      [
        "docusaurus",
        "serve",
        "--host",
        "127.0.0.1",
        "--port",
        String(SITE_PORT),
        "--no-open",
      ],
      { cwd: ROOT, stdio: "pipe" },
    );

    mcpServer = spawn("npx", ["tsx", "scripts/serve-mcp.ts"], {
      cwd: ROOT,
      stdio: "pipe",
      env: {
        ...process.env,
        SITE_URL: `http://127.0.0.1:${SITE_PORT}`,
        PORT: String(MCP_PORT),
      },
    });

    await waitForServer(`http://127.0.0.1:${SITE_PORT}/llms.txt`, 20_000, true);
    await waitForServer(MCP_URL, 15_000);
  }, 45_000);

  afterAll(() => {
    mcpServer?.kill();
    siteServer?.kill();
  });

  test("list discovers both tools", async () => {
    const output = await mcporter("list");
    expect(output).toContain("list_docs_resources");
    expect(output).toContain("get_doc_resource");
    expect(output).toContain("2 tools");
  }, 30_000);

  test("list_docs_resources returns the docs index", async () => {
    const output = await mcporter("call", "list_docs_resources");
    expect(output).toContain("# Databricks Developer");
    expect(output).toContain("/docs/get-started/getting-started");
  }, 30_000);

  test("get_doc_resource returns markdown for a valid slug", async () => {
    const output = await mcporter(
      "call",
      "get_doc_resource",
      "slug:get-started/getting-started",
    );
    expect(output).toContain("# Getting Started");
    expect(output).toContain("Databricks");
  }, 30_000);

  test("get_doc_resource returns error for unknown slug", async () => {
    const output = await mcporter(
      "call",
      "get_doc_resource",
      "slug:nonexistent/page",
    );
    expect(output).toContain("not found");
  }, 30_000);

  test("get_doc_resource rejects path traversal", async () => {
    const output = await mcporter(
      "call",
      "get_doc_resource",
      "slug:../package.json",
    );
    expect(output).toContain("path traversal");
  }, 30_000);
});
