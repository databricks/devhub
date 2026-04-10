import { Bot, Database, Server } from "lucide-react";
import type { ComponentType } from "react";
import { templatePreviewItems } from "@/lib/recipes/recipes";

export type Pillar = {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  icon?: ComponentType<{ className?: string }>;
};

export type TemplatePreviewItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
};

export const pillars: Pillar[] = [
  {
    title: "Lakebase",
    subtitle: "The modern agentic database",
    description:
      "Managed Postgres that syncs with Delta Lake, branches like Git, and scales to zero.",
    link: "/docs/lakebase/getting-started",
    icon: Database,
  },
  {
    title: "Agent Bricks",
    subtitle: "Production-ready AI agents",
    description:
      "Model serving, vector search, RAG, and guardrails - all governed by Unity Catalog.",
    link: "/docs/agents/getting-started",
    icon: Bot,
  },
  {
    title: "Databricks Apps",
    subtitle: "Your code, deployed. No DevOps.",
    description:
      "Ship React, Python, or any framework as a managed app with built-in auth and serverless compute.",
    link: "/docs/apps/appkit",
    icon: Server,
  },
];

export const landingTemplates: TemplatePreviewItem[] = [
  ...templatePreviewItems,
].reverse();
