import { createServer, type IncomingMessage } from "http";
import { POST } from "../api/mcp";

const PORT = Number(process.env.PORT) || 3001;

function toWebRequest(req: IncomingMessage, body: string): Request {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  return new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

const server = createServer(async (req, raw) => {
  raw.setHeader("Access-Control-Allow-Origin", "*");
  raw.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  raw.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    raw.writeHead(204);
    raw.end();
    return;
  }

  const body = await readBody(req);
  const webRequest = toWebRequest(req, body);
  const response = await POST(webRequest);

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  raw.writeHead(response.status, headers);
  const responseBody = await response.text();
  raw.end(responseBody);
});

server.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}/api/mcp`);
});
