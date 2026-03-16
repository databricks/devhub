import { describe, test, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const BUILD_DIR = resolve(__dirname, "..", "build");
const DOCS_DIR = resolve(__dirname, "..", "docs");

function rpc(method: string, params?: unknown) {
  return { jsonrpc: "2.0", id: 1, method, params };
}

describe("MCP server handler", () => {
  let handler: (
    req: { method: string; body: unknown; headers: Record<string, string> },
    res: {
      statusCode: number;
      headers: Record<string, string>;
      body: unknown;
      setHeader: (k: string, v: string) => void;
      status: (code: number) => {
        json: (body: unknown) => void;
        end: () => void;
      };
    },
  ) => Promise<void>;

  beforeAll(async () => {
    process.env.SITE_URL = "http://localhost:4173";

    const mod = await import("../api/mcp");
    handler = mod.default;
  });

  async function callMcp(body: unknown): Promise<unknown> {
    let result: unknown;
    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      body: null as unknown,
      setHeader(k: string, v: string) {
        this.headers[k] = v;
      },
      status(code: number) {
        this.statusCode = code;
        return {
          json(data: unknown) {
            result = data;
          },
          end() {},
        };
      },
    };
    await handler(
      {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      } as never,
      res as never,
    );
    return result;
  }

  test("GET returns server metadata", async () => {
    let result: unknown;
    const res = {
      statusCode: 0,
      headers: {} as Record<string, string>,
      body: null as unknown,
      setHeader(k: string, v: string) {
        this.headers[k] = v;
      },
      status(code: number) {
        this.statusCode = code;
        return {
          json(data: unknown) {
            result = data;
          },
          end() {},
        };
      },
    };
    await handler(
      { method: "GET", body: null, headers: {} } as never,
      res as never,
    );
    const data = result as { name: string; tools: Array<{ name: string }> };
    expect(data.name).toBe("devhub-docs");
    expect(data.tools).toHaveLength(2);
    expect(data.tools.map((t) => t.name)).toEqual([
      "list_docs_resources",
      "get_doc_resource",
    ]);
  });

  test("initialize returns server info", async () => {
    const result = (await callMcp(rpc("initialize"))) as {
      result: { serverInfo: { name: string } };
    };
    expect(result.result.serverInfo.name).toBe("devhub-docs");
    expect(result.result.protocolVersion).toBe("2024-11-05");
  });

  test("tools/list returns both tools", async () => {
    const result = (await callMcp(rpc("tools/list"))) as {
      result: { tools: Array<{ name: string }> };
    };
    expect(result.result.tools).toHaveLength(2);
    expect(result.result.tools[0].name).toBe("list_docs_resources");
    expect(result.result.tools[1].name).toBe("get_doc_resource");
  });

  test("get_doc_resource returns markdown for valid slug", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "get-started/getting-started" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBe(false);
    expect(result.result.content[0].text).toContain("---");
    expect(result.result.content[0].text.length).toBeGreaterThan(100);
  });

  test("get_doc_resource returns error for missing slug", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "nonexistent/page" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBe(true);
    expect(result.result.content[0].text).toContain("not found");
  });

  test("get_doc_resource rejects path traversal", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "../package.json" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBe(true);
    expect(result.result.content[0].text).toContain("path traversal");
  });

  test("get_doc_resource rejects absolute URLs", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "https://evil.com/hack" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBe(true);
    expect(result.result.content[0].text).toContain("absolute URLs");
  });

  test("get_doc_resource rejects leading slash", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "/etc/passwd" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBe(true);
    expect(result.result.content[0].text).toContain('must not start with "/"');
  });

  test("unknown method returns error", async () => {
    const result = (await callMcp(rpc("unknown/method"))) as {
      error: { message: string };
    };
    expect(result.error.message).toContain("Method not found");
  });
});
