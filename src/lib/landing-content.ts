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
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
};

export const pillars: Pillar[] = [
  {
    title: "Lakebase",
    subtitle: "Managed Postgres, colocated with your Lakehouse.",
    description:
      "Provision with the CLI, connect like any Postgres. Instant branching, scales to zero, and change data feed to Unity Catalog.",
    link: "/docs/lakebase/quickstart",
    icon: Database,
  },
  {
    title: "Agent Bricks",
    subtitle: "Managed AI agents and governed LLM endpoints.",
    description:
      "Connect Knowledge Assistants, Genie spaces, and foundation models to your AppKit app. AI Gateway handles rate limits, cost attribution, and content safety.",
    link: "/docs/agents/overview",
    icon: Bot,
  },
  {
    title: "Databricks Apps",
    subtitle: "Web apps that run inside your workspace.",
    description:
      "One CLI command to deploy. Fixed URL, built-in OAuth, and direct access to your workspace data \u2014 no separate hosting service.",
    link: "/docs/apps/overview",
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
    ...publishedExamples.map<LandingResourceItem>((e) => ({
      id: e.id,
      path: `/templates/${e.id}`,
      title: e.name,
      description: e.description,
      tags: e.tags,
      services: e.services,
      kind: "example",
      ...(e.previewImageLightUrl
        ? { previewImageLightUrl: e.previewImageLightUrl }
        : {}),
      ...(e.previewImageDarkUrl
        ? { previewImageDarkUrl: e.previewImageDarkUrl }
        : {}),
    })),
    ...[...publishedPreviewItems].reverse().map<LandingResourceItem>((t) => ({
      id: t.id,
      path: t.path,
      title: t.title,
      description: t.description,
      tags: t.tags,
      services: t.services,
      kind: "guide",
      ...(t.previewImageLightUrl
        ? { previewImageLightUrl: t.previewImageLightUrl }
        : {}),
      ...(t.previewImageDarkUrl
        ? { previewImageDarkUrl: t.previewImageDarkUrl }
        : {}),
    })),
  ];
}
