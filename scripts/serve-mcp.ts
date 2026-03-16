import { createServer, type IncomingMessage, type ServerResponse } from "http";
import handler from "../api/mcp";

const PORT = 3001;

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(
  async (req: IncomingMessage, raw: ServerResponse) => {
    const body = req.method === "POST" ? await parseBody(req) : null;

    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body,
      url: req.url,
    };

    const vercelRes = {
      statusCode: 200,
      _headers: {} as Record<string, string>,
      setHeader(key: string, value: string) {
        this._headers[key] = value;
        raw.setHeader(key, value);
      },
      status(code: number) {
        this.statusCode = code;
        return {
          json(data: unknown) {
            raw.writeHead(code, { "Content-Type": "application/json" });
            raw.end(JSON.stringify(data));
          },
          end() {
            raw.writeHead(code);
            raw.end();
          },
        };
      },
    };

    await handler(vercelReq as never, vercelRes as never);
  },
);

server.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}/api/mcp`);
});
