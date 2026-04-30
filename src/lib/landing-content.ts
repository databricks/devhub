import {
  examples,
  filterPublished,
  cookbookPreviewItems,
  cookbooks,
  type Service,
} from "@/lib/recipes/recipes";

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
