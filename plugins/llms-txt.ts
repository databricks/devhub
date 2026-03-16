import fs from "fs";
import path from "path";
import type { Plugin } from "@docusaurus/types";
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
      "lakebase",
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

export default function llmsTxtPlugin(): Plugin {
  return {
    name: "docusaurus-llms-txt",

    async postBuild({ siteConfig, outDir }) {
      const baseUrl = siteConfig.url.replace(/\/$/, "");
      const docsDir = path.resolve(__dirname, "..", "docs");

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
        "Databricks use-case solutions built on Lakebase, AgentBricks, and Databricks Apps.",
        "",
        `- [All Solutions](${baseUrl}/solutions): Overview of Databricks developer solutions`,
        ...solutions.map(
          (s) =>
            `- [${s.title}](${baseUrl}/solutions/${s.id}): ${s.description}`,
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
        `- [Analytics Dashboard App Template](${baseUrl}/resources/analytics-dashboard-app-template): Interactive analytics dashboard backed by Lakebase with parameterized SQL queries and chart components`,
        `- [AI Data Explorer Template](${baseUrl}/resources/ai-data-explorer-template): Full-stack data app with Lakebase persistence, AI chat via Model Serving, and Genie natural-language data exploration`,
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

      fs.writeFileSync(path.join(outDir, "llms.txt"), lines.join("\n"));
    },
  };
}
