import fs from "fs";
import path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { solutions } from "../src/lib/solutions/solutions";
import {
  templates,
  recipesInOrder,
  examples,
  filterPublished,
} from "../src/lib/recipes/recipes";
import { expandMdxImports } from "../src/lib/expand-mdx";
import { showDrafts, examplesEnabled } from "../src/lib/feature-flags-server";

type Section = {
  title: string;
  description: string;
  docs: Array<{
    slug: string;
    title: string;
    description: string;
  }>;
};

const SIDEBAR_SECTIONS: Array<{
  title: string;
  description: string;
  slugs: string[];
}> = [
  {
    title: "Start Here",
    description:
      "Site orientation: what DevHub is, how to use guides and examples, and where to find companion docs.",
    slugs: ["start-here"],
  },
  {
    title: "Agent Bricks",
    description:
      "Connect Agent Bricks agents, governed LLM endpoints, and Genie spaces to your AppKit app. Covers AI Gateway, the Model Serving plugin for calling LLM and agent endpoints, and the Genie plugin for natural-language data queries.",
    slugs: [
      "agents/overview",
      "agents/ai-gateway",
      "agents/genie",
      "agents/custom-agents",
    ],
  },
  {
    title: "Apps",
    description:
      "Host and operate web applications as managed Databricks workspace resources.",
    slugs: [
      "apps/overview",
      "apps/quickstart",
      "apps/configuration",
      "apps/development",
    ],
  },
  {
    title: "Lakebase",
    description:
      "Managed PostgreSQL for operational workloads with Databricks-native governance and Delta Lake sync.",
    slugs: [
      "lakebase/quickstart",
      "lakebase/configuration",
      "lakebase/development",
    ],
  },
  {
    title: "AppKit",
    description:
      "TypeScript SDK for building full-stack Databricks Apps with plugin-based architecture, type-safe data access, and pre-built UI components.",
    slugs: ["appkit/v0", "appkit/v0/plugins"],
  },
  {
    title: "Tools",
    description:
      "CLI, SDKs, agent skills, and MCP integrations for Databricks developer workflows.",
    slugs: [
      "tools/databricks-cli",
      "tools/ai-tools/agent-skills",
      "tools/ai-tools/docs-mcp-server",
    ],
  },
];

function extractFrontmatterTitle(content: string): string | undefined {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;
  const titleMatch = match[1].match(/^title:\s*(.+)$/m);
  return titleMatch
    ? titleMatch[1].trim().replace(/^["']|["']$/g, "")
    : undefined;
}

function extractFirstParagraph(content: string): string {
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, "");
  const afterHeading = body.replace(/^#[^\n]*\n+/, "");
  const lines = afterHeading.split("\n");
  const paragraph: string[] = [];
  for (const line of lines) {
    if (line.trim() === "" && paragraph.length > 0) break;
    if (
      line.trim() !== "" &&
      !line.startsWith("#") &&
      !line.startsWith("import ")
    ) {
      paragraph.push(line.trim());
    }
  }
  return paragraph.join(" ").trim();
}

function readDoc(
  docsDir: string,
  slug: string,
): { title: string; description: string } | undefined {
  const extensions = [".md", ".mdx"];
  for (const ext of extensions) {
    const filePath = path.join(docsDir, slug + ext);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const title =
        extractFrontmatterTitle(content) ?? slug.split("/").pop() ?? slug;
      const description = extractFirstParagraph(content);
      return { title, description };
    }
    const indexPath = path.join(docsDir, slug, "index" + ext);
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      const title =
        extractFrontmatterTitle(content) ?? slug.split("/").pop() ?? slug;
      const description = extractFirstParagraph(content);
      return { title, description };
    }
  }
  return undefined;
}

function generateLlmsTxt(baseUrl: string, docsDir: string): string {
  const includeDrafts = showDrafts();
  const includeExamples = examplesEnabled();
  const publishedTemplates = filterPublished(templates, includeDrafts);
  const publishedRecipes = filterPublished(recipesInOrder, includeDrafts);
  const publishedExamples = includeExamples
    ? filterPublished(examples, includeDrafts)
    : [];

  const allSections: Section[] = SIDEBAR_SECTIONS.map((section) => ({
    title: section.title,
    description: section.description,
    docs: section.slugs
      .map((slug) => {
        const doc = readDoc(docsDir, slug);
        if (!doc) return undefined;
        return { slug, title: doc.title, description: doc.description };
      })
      .filter(
        (d): d is { slug: string; title: string; description: string } =>
          d !== undefined,
      ),
  }));

  const startHere = allSections.find((s) => s.title === "Start Here");
  const refSections = allSections.filter((s) => s.title !== "Start Here");

  const lines: string[] = [
    "# Databricks Developer Hub",
    "",
    "> Documentation, guides, and examples for building apps and AI agents on Databricks using Lakebase (managed Postgres), Model Serving, and Databricks Apps.",
    "",
  ];

  // Start Here first — orientation for agents
  if (startHere) {
    lines.push(`## ${startHere.title}`, "", startHere.description, "");
    for (const doc of startHere.docs) {
      const desc = doc.description ? `: ${doc.description}` : "";
      lines.push(`- [${doc.title}](${baseUrl}/docs/${doc.slug}.md)${desc}`);
    }
    lines.push("");
  }

  // Reference docs (Agents, Apps, Lakebase, AppKit, Tools)
  for (const section of refSections) {
    lines.push(`## ${section.title}`, "", section.description, "");
    for (const doc of section.docs) {
      const desc = doc.description ? `: ${doc.description}` : "";
      lines.push(`- [${doc.title}](${baseUrl}/docs/${doc.slug}.md)${desc}`);
    }
    lines.push("");
  }

  // Resources — grouped by type
  lines.push(
    "## Resources",
    "",
    "Guides and examples for building on Databricks.",
    "",
    `- [All Resources](${baseUrl}/templates.md): Browse all resources`,
    "",
  );

  if (publishedTemplates.length > 0) {
    lines.push(
      "### Guides",
      "",
      ...publishedTemplates.map(
        (t) =>
          `- [${t.name}](${baseUrl}/templates/${t.id}.md): ${t.description}`,
      ),
      "",
    );
  }

  if (publishedRecipes.length > 0) {
    lines.push(
      "### Recipes",
      "",
      ...publishedRecipes.map(
        (r) =>
          `- [${r.name}](${baseUrl}/templates/${r.id}.md): ${r.description}`,
      ),
      "",
    );
  }

  if (publishedExamples.length > 0) {
    lines.push(
      "### Examples",
      "",
      ...publishedExamples.map(
        (e) =>
          `- [${e.name}](${baseUrl}/templates/${e.id}.md): ${e.description}`,
      ),
      "",
    );
  }

  // Solutions last — least actionable
  lines.push(
    "## Solutions",
    "",
    "Databricks use-case solutions built on Lakebase, Agent Bricks, and Databricks Apps.",
    "",
    `- [All Solutions](${baseUrl}/solutions.md): Overview of Databricks developer solutions`,
    ...solutions.map(
      (s) =>
        `- [${s.title}](${baseUrl}/solutions/${s.id}.md): ${s.description}`,
    ),
    "",
  );

  return lines.join("\n");
}

function copyRawDocs(docsDir: string, destDir: string): void {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
    const srcPath = path.join(docsDir, entry.name);
    const dstPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRawDocs(srcPath, dstPath);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      const raw = fs.readFileSync(srcPath, "utf-8");
      const expanded = expandMdxImports(raw, srcPath);
      const stripped = expanded.replace(/^---\n[\s\S]*?\n---\n*/, "");
      fs.writeFileSync(dstPath, stripped);
    }
  }
}

/** Use the Vercel preview URL for non-production builds, otherwise the configured site URL. */
function getBaseUrl(configUrl: string): string {
  if (process.env.VERCEL_ENV !== "production" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return configUrl.replace(/\/$/, "");
}

export default function llmsTxtPlugin(context: LoadContext): Plugin {
  const docsDir = path.resolve(__dirname, "..", "docs");
  const baseUrl = getBaseUrl(context.siteConfig.url);

  const staticDir = path.resolve(__dirname, "..", "static");
  fs.writeFileSync(
    path.join(staticDir, "llms.txt"),
    generateLlmsTxt(baseUrl, docsDir),
  );
  copyRawDocs(docsDir, path.join(staticDir, "raw-docs"));

  return {
    name: "docusaurus-llms-txt",

    async postBuild({ siteConfig, outDir }) {
      const buildBaseUrl = getBaseUrl(siteConfig.url);
      fs.writeFileSync(
        path.join(outDir, "llms.txt"),
        generateLlmsTxt(buildBaseUrl, docsDir),
      );
      copyRawDocs(docsDir, path.join(outDir, "raw-docs"));
    },
  };
}
