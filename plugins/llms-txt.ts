import fs from "fs";
import path from "path";
import type { LoadContext, Plugin } from "@docusaurus/types";
import { solutions } from "../src/lib/solutions/solutions";

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
    title: "Get Started",
    description:
      "First-time setup: local environment, first app deployment, and platform concepts.",
    slugs: [
      "get-started/getting-started",
      "get-started/your-first-app",
      "get-started/core-concepts",
    ],
  },
  {
    title: "Agents",
    description:
      "Design, develop, and monitor AI agents with Databricks model serving, guardrails, and observability.",
    slugs: [
      "agents/getting-started",
      "agents/core-concepts",
      "agents/development",
      "agents/ai-gateway",
      "agents/observability",
    ],
  },
  {
    title: "Apps",
    description:
      "Host and operate web applications as managed Databricks workspace resources.",
    slugs: [
      "apps/getting-started",
      "apps/core-concepts",
      "apps/plugins",
      "apps/development",
    ],
  },
  {
    title: "Lakebase",
    description:
      "Managed PostgreSQL for operational workloads with Databricks-native governance and Delta Lake sync.",
    slugs: [
      "lakebase/getting-started",
      "lakebase/core-concepts",
      "lakebase/development",
    ],
  },
  {
    title: "AppKit",
    description:
      "TypeScript SDK and developer framework for building full-stack Databricks applications.",
    slugs: ["appkit"],
  },
  {
    title: "Tools",
    description:
      "CLI, SDKs, agent skills, and MCP integrations for Databricks developer workflows.",
    slugs: [
      "tools/databricks-cli",
      "tools/appkit",
      "tools/ai-tools/agent-skills",
      "tools/ai-tools/docs-mcp-server",
    ],
  },
  {
    title: "References",
    description: "API references and SDK documentation.",
    slugs: ["references/appkit"],
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
  const sections: Section[] = SIDEBAR_SECTIONS.map((section) => ({
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

  const lines: string[] = [
    "# Databricks Developer",
    "",
    "> Build intelligent data and AI applications in minutes, not months.",
    "",
    "Documentation for the Databricks developer platform covering application frameworks, AI agents, managed PostgreSQL (Lakebase), deployment tools, and starter templates.",
    "",
    "## Solutions",
    "",
    "Databricks use-case solutions built on Lakebase, Agent Bricks, and Databricks Apps.",
    "",
    `- [All Solutions](${baseUrl}/solutions): Overview of Databricks developer solutions`,
    ...solutions.map(
      (s) => `- [${s.title}](${baseUrl}/solutions/${s.id}): ${s.description}`,
    ),
    "",
    "## Resources",
    "",
    "Templates and starter kits for building on Databricks.",
    "",
    `- [All Resources](${baseUrl}/resources): Browse all templates`,
    `- [Base App Template](${baseUrl}/resources/base-app-template): Databricks local bootstrap template for CLI, auth, app scaffolding, and agent skill setup`,
    `- [AI Chat App Template](${baseUrl}/resources/ai-chat-app-template): Streaming AI chat powered by Databricks Model Serving (AI Gateway) with AI SDK and AI Elements`,
    `- [Data App Template](${baseUrl}/resources/data-app-template): Bootstrap a Databricks app with Lakebase for persistent data storage, schema setup, and CRUD API routes`,
    `- [Genie App Template](${baseUrl}/resources/genie-app-template): Build a minimal Databricks App with AI/BI Genie conversational analytics. Covers CLI setup, Genie space configuration, plugin wiring, and deploy.`,
    `- [Lakebase Outside Databricks App Platform](${baseUrl}/resources/lakebase-off-platform-template): Use Lakebase from apps hosted outside Databricks App Platform with portable env, token, and Drizzle patterns.`,
    `- [Operational Data Analytics](${baseUrl}/resources/operational-data-analytics-template): End-to-end setup for analyzing operational database data in the lakehouse with Unity Catalog, Lakebase, Lakehouse Sync CDC, and medallion architecture.`,
    "",
  ];

  for (const section of sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    lines.push(section.description);
    lines.push("");

    for (const doc of section.docs) {
      const desc = doc.description ? `: ${doc.description}` : "";
      lines.push(`- [${doc.title}](${baseUrl}/docs/${doc.slug})${desc}`);
    }

    lines.push("");
  }

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
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

export default function llmsTxtPlugin(context: LoadContext): Plugin {
  const docsDir = path.resolve(__dirname, "..", "docs");
  const baseUrl = context.siteConfig.url.replace(/\/$/, "");

  const staticDir = path.resolve(__dirname, "..", "static");
  fs.writeFileSync(
    path.join(staticDir, "llms.txt"),
    generateLlmsTxt(baseUrl, docsDir),
  );
  copyRawDocs(docsDir, path.join(staticDir, "raw-docs"));

  return {
    name: "docusaurus-llms-txt",

    async postBuild({ siteConfig, outDir }) {
      const prodBaseUrl = siteConfig.url.replace(/\/$/, "");
      fs.writeFileSync(
        path.join(outDir, "llms.txt"),
        generateLlmsTxt(prodBaseUrl, docsDir),
      );
      copyRawDocs(docsDir, path.join(outDir, "raw-docs"));
    },
  };
}
