import { resolve } from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateLlmsTxt } from "../plugins/llms-txt";
import { resolveSiteUrlForRequest } from "../src/lib/site-url";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const siteUrl = resolveSiteUrlForRequest(req.headers.host);
  const docsDir = resolve(process.cwd(), "docs");
  const body = generateLlmsTxt(siteUrl, docsDir);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
  res.status(200).send(body);
}
