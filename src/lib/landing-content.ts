import { Bot, Database, Server } from "lucide-react";
import type { ComponentType } from "react";
import {
  examples,
  filterPublished,
  cookbookPreviewItems,
  cookbooks,
  type Service,
} from "@/lib/recipes/recipes";

export type Pillar = {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  icon?: ComponentType<{ className?: string }>;
};

export type LandingTemplateItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  tags?: string[];
  services?: Service[];
  kind: "example" | "cookbook";
  previewImageLightUrl?: string;
  previewImageDarkUrl?: string;
};

export const pillars: Pillar[] = [
  {
    title: "Lakebase",
    subtitle: "Managed Postgres, colocated with your Lakehouse.",
    description:
      "Provision with the CLI, connect like any Postgres. Instant branching, scales to zero, and change data feed to Unity Catalog.",
    link: "/docs/lakebase/overview",
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

export function buildLandingTemplates(
  includeDrafts: boolean,
  includeExamples: boolean,
): LandingTemplateItem[] {
  const publishedExamples = includeExamples
    ? filterPublished(examples, includeDrafts)
    : [];
  const publishedCookbooks = filterPublished(cookbooks, includeDrafts);
  const publishedCookbookIds = new Set(publishedCookbooks.map((c) => c.id));
  const publishedPreviewItems = cookbookPreviewItems.filter((c) =>
    publishedCookbookIds.has(c.id),
  );

  return [
    ...publishedExamples.map<LandingTemplateItem>((e) => ({
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
    ...[...publishedPreviewItems].reverse().map<LandingTemplateItem>((c) => ({
      id: c.id,
      path: c.path,
      title: c.title,
      description: c.description,
      tags: c.tags,
      services: c.services,
      kind: "cookbook",
      ...(c.previewImageLightUrl
        ? { previewImageLightUrl: c.previewImageLightUrl }
        : {}),
      ...(c.previewImageDarkUrl
        ? { previewImageDarkUrl: c.previewImageDarkUrl }
        : {}),
    })),
  ];
}
