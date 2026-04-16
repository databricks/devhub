import { Bot, Database, Server } from "lucide-react";
import type { ComponentType } from "react";
import {
  examples,
  filterPublished,
  templatePreviewItems,
  templates,
  type Service,
} from "@/lib/recipes/recipes";

export type Pillar = {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  icon?: ComponentType<{ className?: string }>;
};

export type LandingResourceItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
  services?: Service[];
  kind: "example" | "guide";
  image?: string;
};

export const pillars: Pillar[] = [
  {
    title: "Lakebase",
    subtitle: "The operational data layer for AI agents and apps.",
    description:
      "Postgres integrated with the lakehouse, built for modern operational workloads.",
    link: "/docs/lakebase/quickstart",
    icon: Database,
  },
  {
    title: "Agent Bricks",
    subtitle: "Production AI agents that continuously improve.",
    description:
      "A unified platform to build, deploy, and govern AI agents on your data.",
    link: "/docs/agents/quickstart",
    icon: Bot,
  },
  {
    title: "Databricks Apps",
    subtitle: "The fastest way to ship data and AI applications.",
    description:
      "Build secure, interactive apps on the Data Intelligence Platform with built-in auth and serverless compute.",
    link: "/docs/apps/appkit",
    icon: Server,
  },
];

export function buildLandingResources(
  includeDrafts: boolean,
  includeExamples: boolean,
): LandingResourceItem[] {
  const publishedExamples = includeExamples
    ? filterPublished(examples, includeDrafts)
    : [];
  const publishedTemplates = filterPublished(templates, includeDrafts);
  const publishedTemplateIds = new Set(publishedTemplates.map((t) => t.id));
  const publishedPreviewItems = templatePreviewItems.filter((t) =>
    publishedTemplateIds.has(t.id),
  );

  return [
    ...publishedExamples.map((e) => ({
      id: e.id,
      path: `/resources/${e.id}`,
      title: e.name,
      description: e.description,
      tags: e.tags,
      services: e.services,
      kind: "example" as const,
      image: e.image,
    })),
    ...[...publishedPreviewItems].reverse().map((t) => ({
      ...t,
      kind: "guide" as const,
    })),
  ];
}
