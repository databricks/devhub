import { readFileSync } from "fs";
import { resolve } from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prependLlmsReference, getDetailMarkdown } from "./content-markdown";
import {
  BOOTSTRAP_PROMPT_SECTION,
  BOOTSTRAP_PROMPT_SLUG,
  ABOUT_DEVHUB_SLUG,
} from "../src/lib/bootstrap-prompt";

function readAboutDevhub(rootDir: string): string {
  const filePath = resolve(rootDir, "content", `${ABOUT_DEVHUB_SLUG}.md`);
  return readFileSync(filePath, "utf-8");
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const rootDir = process.cwd();
    const about = readAboutDevhub(rootDir);
    const recipe = getDetailMarkdown(
      BOOTSTRAP_PROMPT_SECTION,
      BOOTSTRAP_PROMPT_SLUG,
    );
    const combined = `${about.trimEnd()}\n\n---\n\n${recipe.trimEnd()}`;
    const host = req.headers.host ?? "dev.databricks.com";
    const withRef = prependLlmsReference(combined, host);

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    res.setHeader("Vary", "Accept");
    res.setHeader("X-Robots-Tag", "noindex");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="bootstrap-prompt.md"',
    );
    res.status(200).send(withRef);
  } catch {
    res.status(500).json({ error: "Failed to build bootstrap prompt" });
  }
}
