import { absolutizeMarkdown } from "@/lib/copy-preamble";

export function markdownResponse(
  body: string | null,
  init: ResponseInit,
  filename: string,
): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  headers.set("X-Robots-Tag", "noindex");
  headers.set("Content-Disposition", `inline; filename="${filename}"`);
  return new Response(body, { ...init, headers });
}

export function markdownNotFoundResponse({
  includeBody,
  requestedPath,
  siteUrl,
}: {
  includeBody: boolean;
  requestedPath: string;
  siteUrl: string;
}): Response {
  const body = [
    "# Page not found",
    "",
    `\`${requestedPath}\` does not exist.`,
    "",
    "- [Site index](/llms.txt): Table of contents for all documentation and templates",
    "- [All templates](/templates.md): Templates for building on Databricks",
    "- [Start here](/docs/start-here.md): Site orientation and getting started",
    "",
  ].join("\n");

  return markdownResponse(
    includeBody ? absolutizeMarkdown(body, siteUrl) : null,
    { status: 404 },
    "not-found.md",
  );
}
