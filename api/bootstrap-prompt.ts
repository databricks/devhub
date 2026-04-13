import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDetailMarkdown, readAboutDevhubBody } from "./content-markdown";
import { substituteAboutDevhubLlmsUrl } from "../src/lib/copy-preamble";
import {
  BOOTSTRAP_PROMPT_SECTION,
  BOOTSTRAP_PROMPT_SLUG,
} from "../src/lib/bootstrap-prompt";

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const rootDir = process.cwd();
    const host = req.headers.host ?? "dev.databricks.com";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const llmsUrl = `${protocol}://${host}/llms.txt`;
    const about = substituteAboutDevhubLlmsUrl(
      readAboutDevhubBody(rootDir),
      llmsUrl,
    );
    const recipe = getDetailMarkdown(
      BOOTSTRAP_PROMPT_SECTION,
      BOOTSTRAP_PROMPT_SLUG,
    );
    const combined = `${about.trimEnd()}\n\n---\n\n${recipe.trimEnd()}`;

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    res.setHeader("Vary", "Accept");
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="bootstrap-prompt.md"',
    );
    res.status(200).send(combined);
  } catch {
    res.status(500).json({ error: "Failed to build bootstrap prompt" });
  }
}
