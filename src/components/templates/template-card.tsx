import Link from "@docusaurus/Link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Example, Recipe, Cookbook } from "@/lib/recipes/recipes";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { TemplatePreviewImage } from "@/components/examples/template-preview-image";

export type TemplateItem =
  | { kind: "example"; data: Example }
  | { kind: "cookbook"; data: Cookbook }
  | { kind: "recipe"; data: Recipe };

function getTemplateHref(item: TemplateItem): string {
  return `/templates/${item.data.id}`;
}

export function TemplateCard({
  item,
  index,
}: {
  item: TemplateItem;
  index: number;
}) {
  const name = item.data.name;
  const description = item.data.description;
  const href = getTemplateHref(item);
  const lightUrl = item.data.previewImageLightUrl;
  const darkUrl = item.data.previewImageDarkUrl;

  return (
    <Link to={href} className="no-underline">
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 shadow-none transition-all duration-200 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20 bg-[#f7f6f4] dark:bg-[#182a32]">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-black/10 dark:border-white/10">
          <TemplatePreviewImage
            lightUrl={lightUrl}
            darkUrl={darkUrl}
            alt={name}
            fallback={<FallbackCardArt index={index} />}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg leading-tight font-medium text-black dark:text-white">
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <p className="m-0 text-[14px] leading-relaxed text-black/68 dark:text-white/68">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
