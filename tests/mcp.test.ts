import { describe, test, expect, beforeAll } from "vitest";

function rpc(method: string, params?: unknown) {
  return { jsonrpc: "2.0", id: 1, method, params };
}

function parseSseResponse(body: string): unknown {
  const dataLine = body.split("\n").find((line) => line.startsWith("data: "));
  if (!dataLine) throw new Error(`No SSE data line in response: ${body}`);
  return JSON.parse(dataLine.slice("data: ".length));
}

describe("MCP server handler", () => {
  let handler: (req: Request) => Promise<Response>;

  beforeAll(async () => {
    process.env.SITE_URL = "http://localhost:4173";
    const mod = await import("../api/mcp");
    handler = mod.POST;
  });

  async function callMcp(body: unknown): Promise<unknown> {
    const request = new Request("http://localhost:3001/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(body),
    });
    const response = await handler(request);
    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      return parseSseResponse(text);
    }
    return JSON.parse(text);
  }

  test("initialize returns server info", async () => {
    const result = (await callMcp(
      rpc("initialize", {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      }),
    )) as { result: { serverInfo: { name: string }; protocolVersion: string } };
    expect(result.result.serverInfo.name).toBe("devhub-docs");
  });

  test("tools/list returns both tools", async () => {
    const result = (await callMcp(rpc("tools/list"))) as {
      result: { tools: Array<{ name: string }> };
    };
    expect(result.result.tools).toHaveLength(2);
    const names = result.result.tools.map((t) => t.name);
    expect(names).toContain("list_docs_resources");
    expect(names).toContain("get_doc_resource");
  });

  test("get_doc_resource returns markdown for valid slug", async () => {
    const result = (await callMcp(
      rpc("tools/call", {
        name: "get_doc_resource",
        arguments: { slug: "start-here" },
      }),
    )) as { result: { content: Array<{ text: string }>; isError: boolean } };
    expect(result.result.isError).toBeFalsy();
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
    expect(result.error).toBeDefined();
  });
});
