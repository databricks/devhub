/**
 * Pure composer for the "Copy prompt for your agent" markdown payload that
 * powers both the landing-page hero and every template/recipe/cookbook/example
 * detail page. The composer is shared between the server (Vercel functions)
 * and the browser (Docusaurus React components) so they always emit the same
 * structure for the same `kind`.
 *
 * Output shape (in order):
 *   1. About DevHub (origin info)
 *   2. Dev guidelines (workflow, asking-questions rules, design defaults)
 *   3. Intent block — explains what the user just copied + the questions to ask
 *   4. Local-bootstrap recipe — "Verify your local Databricks dev environment"
 *   5. Template body (omitted for kind="hero" — the wizard is the entire job)
 */

/** As written in the canonical content/*.md files; substituted to caller's origin. */
export const ABOUT_DEVHUB_CANONICAL_SITE_URL = "https://dev.databricks.com";

export type AgentPromptKind = "hero" | "recipe" | "cookbook" | "example";

/** Static markdown blocks loaded from content/*.md (server-side: fs; browser: Docusaurus global data). */
export type AgentPromptParts = {
  about: string;
  guidelines: string;
  intentHero: string;
  intentRecipe: string;
  intentCookbook: string;
  intentExample: string;
  localBootstrap: string;
};

type ComposeAgentPromptInput = {
  parts: AgentPromptParts;
  kind: AgentPromptKind;
  /** Site origin (e.g. `http://localhost:3001`, `https://dev.databricks.com`). */
  siteOrigin: string;
  /** Required for kind != "hero": the template's display name. */
  templateName?: string;
  /**
   * Required for kind != "hero": the template's permalink (with origin), e.g.
   * `https://dev.databricks.com/templates/app-with-lakebase`.
   */
  templateUrl?: string;
  /** Required for kind != "hero": the full template markdown body to attach last. */
  templateBody?: string;
};

/** Builds the final agent-ready markdown for one copy. */
export function composeAgentPrompt(input: ComposeAgentPromptInput): string {
  const blocks: string[] = [];

  blocks.push(absolutizeMarkdown(input.parts.about, input.siteOrigin));
  blocks.push(absolutizeMarkdown(input.parts.guidelines, input.siteOrigin));
  blocks.push(buildIntentBlock(input));
  blocks.push(buildLocalBootstrapBlock(input.parts.localBootstrap));

  if (input.kind !== "hero") {
    if (!input.templateBody || !input.templateBody.trim()) {
      throw new Error(
        `composeAgentPrompt: kind="${input.kind}" requires a non-empty templateBody.`,
      );
    }
    blocks.push(
      buildTemplateBlock(
        input.kind,
        absolutizeMarkdown(input.templateBody, input.siteOrigin),
      ),
    );
  }

  return blocks.map((block) => block.trim()).join("\n\n---\n\n") + "\n";
}

function buildIntentBlock(input: ComposeAgentPromptInput): string {
  const intentRaw = pickIntentBody(input.parts, input.kind);
  const withOrigin = absolutizeMarkdown(intentRaw, input.siteOrigin);
  if (input.kind === "hero") return withOrigin;

  if (!input.templateName || !input.templateUrl) {
    throw new Error(
      `composeAgentPrompt: kind="${input.kind}" requires templateName and templateUrl.`,
    );
  }
  return withOrigin
    .replaceAll("{{name}}", input.templateName)
    .replaceAll("{{url}}", input.templateUrl);
}

function pickIntentBody(
  parts: AgentPromptParts,
  kind: AgentPromptKind,
): string {
  switch (kind) {
    case "hero":
      return parts.intentHero;
    case "recipe":
      return parts.intentRecipe;
    case "cookbook":
      return parts.intentCookbook;
    case "example":
      return parts.intentExample;
  }
}

function buildLocalBootstrapBlock(localBootstrap: string): string {
  return [
    "# Verify your local Databricks dev environment",
    "",
    "A working Databricks CLI profile is the prerequisite for every step that follows. Walk the user through the recipe below — _even if they say their environment is already set up_. The verification steps are quick and prevent confusing failures further down.",
    "",
    localBootstrap.trim(),
  ].join("\n");
}

function buildTemplateBlock(kind: AgentPromptKind, body: string): string {
  const labels: Record<Exclude<AgentPromptKind, "hero">, string> = {
    recipe: "recipe",
    cookbook: "cookbook",
    example: "example",
  };
  const label = labels[kind];
  return [
    `# The ${label} the user copied`,
    "",
    `The full ${label} prompt is below. This is what the user wants to focus on today. Once the local-bootstrap above passes and the intent questions are answered, work through this content step by step.`,
    "",
    body.trim(),
  ].join("\n");
}

/**
 * Rewrites every occurrence of the canonical DevHub origin
 * (`https://dev.databricks.com`) to the caller's origin. This covers the
 * `Website:` line in about-devhub.md, the `llms.txt` URL, and any
 * `/templates/<slug>.md` links inside the intent files. We do a literal
 * `replaceAll` rather than a regex so other `dev.databricks.com` mentions
 * (e.g. inline mentions without the `https://` prefix, or `github.com`
 * links) are deliberately untouched.
 */
function rewriteOrigin(markdown: string, siteOrigin: string): string {
  const normalized = siteOrigin.replace(/\/$/, "");
  if (normalized === ABOUT_DEVHUB_CANONICAL_SITE_URL) return markdown;
  return markdown.replaceAll(ABOUT_DEVHUB_CANONICAL_SITE_URL, normalized);
}

/**
 * Rewrites root-relative markdown links (`](/foo)`) to absolute URLs using the
 * caller's site origin. Without this, copied markdown payloads contain
 * unresolvable links once pasted into an agent: the agent has no way to know
 * which host they belong to. Protocol-relative (`//cdn`), absolute
 * (`http://`), anchor-only (`#section`), and email/tel links are deliberately
 * left untouched.
 *
 * Covers the three markdown link forms that show up in DevHub content:
 *   - inline:           `[text](/path)` and `[text](/path "title")`
 *   - bare autolinks:   `</path>`
 *   - reference defs:   `[id]: /path` (optionally with a title)
 */
export function rewriteRelativeLinks(
  markdown: string,
  siteOrigin: string,
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  if (!origin) return markdown;

  return markdown
    .replace(
      /(\]\()(\/(?!\/)[^)\s]*)((?:\s+"[^"]*")?\))/g,
      (_match, open: string, path: string, close: string) =>
        `${open}${origin}${path}${close}`,
    )
    .replace(
      /(<)(\/(?!\/)[^>\s]*)(>)/g,
      (_match, open: string, path: string, close: string) =>
        `${open}${origin}${path}${close}`,
    )
    .replace(
      /(^\[[^\]]+\]:\s+)(\/(?!\/)\S+)/gm,
      (_match, prefix: string, path: string) => `${prefix}${origin}${path}`,
    );
}

/**
 * Combined origin + relative-link rewrite applied to every markdown block we
 * emit for "Copy as Markdown" / agent-prompt flows. Centralized so callers
 * never forget one half of the substitution.
 */
export function absolutizeMarkdown(
  markdown: string,
  siteOrigin: string,
): string {
  return rewriteRelativeLinks(rewriteOrigin(markdown, siteOrigin), siteOrigin);
}

/**
 * Backwards-compatible wrapper kept only for test fixtures and any callers
 * that pre-date the composer. New code should call `composeAgentPrompt`.
 *
 * Accepts either an llms.txt URL (`https://dev.databricks.com/llms.txt`) or a
 * site origin (`https://dev.databricks.com`); both end up rewriting the
 * canonical origin to the caller's origin.
 */
export function substituteAboutDevhubLlmsUrl(
  markdown: string,
  llmsOrSiteUrl: string,
): string {
  const trimmed = llmsOrSiteUrl.replace(/\/$/, "");
  const siteOrigin = trimmed.endsWith("/llms.txt")
    ? trimmed.slice(0, -"/llms.txt".length)
    : trimmed;
  return rewriteOrigin(markdown, siteOrigin);
}
