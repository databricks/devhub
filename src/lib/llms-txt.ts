import fs from "fs";
import path from "path";

import { absolutizeMarkdown } from "./copy-preamble";
import { showDrafts } from "./feature-flags-server";
import { buildRawDocMarkdown } from "./raw-docs";
import {
  cookbooks,
  examples,
  filterPublished,
  recipesInOrder,
} from "./recipes/recipes";

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
      "Site orientation: what DevHub is, how to use templates and examples, and where to find companion docs.",
    slugs: ["start-here"],
  },
  {
    title: "Unity Gateway",
    description:
      "Call governed LLM endpoints and model services from your AppKit app. Unity Gateway applies rate limits, usage tracking, guardrails, and cost controls to model and MCP traffic.",
    slugs: ["unity-gateway/overview"],
  },
  {
    title: "Agent Bricks",
    description:
      "Connect Agent Bricks agents to your AppKit app, and build custom agents with the Agent Bricks CLI. Covers the agents plugin for calling LLM and agent endpoints, managed agent memory and sessions, and Databricks Sandbox for running agent code.",
    slugs: [
      "agents/overview",
      "agents/cli",
      "agents/memory",
      "agents/sandbox",
      "agents/custom-agents",
    ],
  },
  {
    title: "Omnigent",
    description:
      "Work with multiple coding agents in one interface, collaborate on sessions, and continue from mobile. Start on Databricks Sandbox or connect your own machine, then automate sessions with workspace authentication.",
    slugs: [
      "omnigent/overview",
      "omnigent/quickstart",
      "omnigent/programmatic",
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
      "Managed PostgreSQL for agentic workloads with Databricks-native governance and Delta Lake sync.",
    slugs: [
      "lakebase/quickstart",
      "lakebase/configuration",
      "lakebase/development",
    ],
  },
  {
    title: "Data Lakehouse",
    description:
      "Governed analytical tables in Unity Catalog, populated by Lakeflow. Covers SQL warehouse reads, Lakeflow Jobs and Pipelines, and Genie Agents for natural-language Q&A over tables.",
    slugs: [
      "lakehouse/overview",
      "lakehouse/analytical-reads",
      "lakehouse/genie",
      "lakehouse/jobs",
      "lakehouse/pipelines",
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
      return { title, description: extractFirstParagraph(content) };
    }

    const indexPath = path.join(docsDir, slug, "index" + ext);
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      const title =
        extractFrontmatterTitle(content) ?? slug.split("/").pop() ?? slug;
      return { title, description: extractFirstParagraph(content) };
    }
  }

  return undefined;
}

export function generateLlmsTxt(baseUrl: string, docsDir: string): string {
  const includeDrafts = showDrafts();
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedRecipes = filterPublished(recipesInOrder, includeDrafts);
  const publishedExamples = filterPublished(examples, includeDrafts);

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
        (doc): doc is { slug: string; title: string; description: string } =>
          doc !== undefined,
      ),
  }));

  const startHere = allSections.find(
    (section) => section.title === "Start Here",
  );
  const refSections = allSections.filter(
    (section) => section.title !== "Start Here",
  );

  const lines: string[] = [
    "# Databricks Developer Hub",
    "",
    "> Documentation, templates, and examples for building apps and AI agents on Databricks using Lakebase (managed Postgres), Model Serving, and Databricks Apps.",
    "",
  ];

  if (startHere) {
    lines.push(`## ${startHere.title}`, "", startHere.description, "");
    for (const doc of startHere.docs) {
      const desc = doc.description
        ? `: ${absolutizeMarkdown(doc.description, baseUrl)}`
        : "";
      lines.push(`- [${doc.title}](${baseUrl}/docs/${doc.slug}.md)${desc}`);
    }
    lines.push("");
  }

  for (const section of refSections) {
    lines.push(`## ${section.title}`, "", section.description, "");
    for (const doc of section.docs) {
      const desc = doc.description
        ? `: ${absolutizeMarkdown(doc.description, baseUrl)}`
        : "";
      lines.push(`- [${doc.title}](${baseUrl}/docs/${doc.slug}.md)${desc}`);
    }
    lines.push("");
  }

  const allTemplates = [
    ...publishedCookbooks.map((template) => ({
      name: template.name,
      id: template.id,
      description: template.description,
    })),
    ...publishedRecipes.map((template) => ({
      name: template.name,
      id: template.id,
      description: template.description,
    })),
    ...publishedExamples.map((template) => ({
      name: template.name,
      id: template.id,
      description: template.description,
    })),
  ];

  lines.push(
    "## Templates",
    "",
    `Opinionated, copy-pasteable templates for building on Databricks. Browse the catalog at ${baseUrl}/templates.`,
    "",
    `- [All Templates](${baseUrl}/templates.md): Browse all templates`,
    ...allTemplates.map(
      (template) =>
        `- [${template.name}](${baseUrl}/templates/${template.id}.md): ${template.description}`,
    ),
    "",
  );

  return lines.join("\n");
}

export function copyRawDocs(
  docsDir: string,
  destDir: string,
  siteOrigin: string,
): void {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
    const srcPath = path.join(docsDir, entry.name);
    const dstPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRawDocs(srcPath, dstPath, siteOrigin);
      continue;
    }

    if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      const raw = fs.readFileSync(srcPath, "utf-8");
      fs.writeFileSync(dstPath, buildRawDocMarkdown(raw, srcPath, siteOrigin));
    }
  }
}
