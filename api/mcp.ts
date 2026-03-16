import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SITE_URL =
  process.env.SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:4173");

const DOCS_DIR = resolve(__dirname, "..", "docs");

const TOOLS = [
  {
    name: "list_docs_resources",
    description:
      "Lists all available Databricks developer documentation pages. Returns the documentation index as markdown with page URLs and titles. Use get_doc_resource to fetch specific pages.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_doc_resource",
    description:
      "Fetches a single Databricks developer documentation page as markdown. Use list_docs_resources first to discover available slugs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description:
            "The docs page slug (path) to fetch, e.g. 'get-started/getting-started'. Use list_docs_resources first to discover available slugs.",
        },
      },
      required: ["slug"],
    },
  },
];

function validateDocSlug(slug: string): void {
  if (slug.includes("..")) {
    throw new Error('Invalid doc slug: path traversal ("..") is not allowed');
  }
  if (slug.includes("://")) {
    throw new Error("Invalid doc slug: absolute URLs are not allowed");
  }
  if (slug.startsWith("/")) {
    throw new Error('Invalid doc slug: slug must not start with "/"');
  }
}

function readDocFile(slug: string): string | undefined {
  const extensions = [".md", ".mdx"];
  for (const ext of extensions) {
    const filePath = resolve(DOCS_DIR, slug + ext);
    if (existsSync(filePath)) {
      return readFileSync(filePath, "utf-8");
    }
    const indexPath = resolve(DOCS_DIR, slug, "index" + ext);
    if (existsSync(indexPath)) {
      return readFileSync(indexPath, "utf-8");
    }
  }
  return undefined;
}

async function handleListDocsResources(): Promise<string> {
  const response = await fetch(`${SITE_URL}/llms.txt`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Docs index not found");
    }
    throw new Error(
      `Failed to fetch docs index: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

function handleGetDocResource(slug: string): string {
  validateDocSlug(slug);
  const content = readDocFile(slug);
  if (!content) {
    throw new Error(`Doc page not found: "${slug}"`);
  }
  return content;
}

async function handleTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "list_docs_resources":
      return handleListDocsResources();
    case "get_doc_resource":
      return handleGetDocResource(String(args.slug || ""));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function jsonrpc(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonrpcError(id: unknown, message: string) {
  return { jsonrpc: "2.0", id, error: { code: -32603, message } };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      name: "devhub-docs",
      version: "1.0.0",
      protocol: "MCP",
      tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const item of body) {
      const { id, method, params } = item || {};

      if (method === "initialize") {
        results.push(
          jsonrpc(id, {
            protocolVersion: "2024-11-05",
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: "devhub-docs", version: "1.0.0" },
          }),
        );
      } else if (method === "notifications/initialized") {
        // Client acknowledgment — no response needed
        continue;
      } else if (method === "tools/list") {
        results.push(jsonrpc(id, { tools: TOOLS }));
      } else if (method === "tools/call") {
        const toolName = params?.name as string;
        const args = (params?.arguments || {}) as Record<string, unknown>;
        try {
          const text = await handleTool(toolName, args);
          results.push(
            jsonrpc(id, {
              content: [{ type: "text", text }],
              isError: false,
            }),
          );
        } catch (toolError) {
          results.push(
            jsonrpc(id, {
              content: [
                {
                  type: "text",
                  text:
                    toolError instanceof Error
                      ? toolError.message
                      : String(toolError),
                },
              ],
              isError: true,
            }),
          );
        }
      } else {
        results.push(jsonrpcError(id, `Method not found: ${method}`));
      }
    }

    return res.status(200).json(Array.isArray(req.body) ? results : results[0]);
  } catch (e) {
    return res.status(500).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32603, message: String(e) },
    });
  }
}
