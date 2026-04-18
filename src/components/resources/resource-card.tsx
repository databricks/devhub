import Link from "@docusaurus/Link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Example, Recipe, Template } from "@/lib/recipes/recipes";
import { FallbackCardArt } from "@/components/examples/fallback-card-art";
import { ResourcePreviewImage } from "@/components/examples/resource-preview-image";

export type ResourceItem =
  | { kind: "example"; data: Example }
  | { kind: "template"; data: Template }
  | { kind: "recipe"; data: Recipe };

function getResourceHref(item: ResourceItem): string {
  return `/resources/${item.data.id}`;
}

function getResourceBadge(item: ResourceItem): string {
  if (item.kind === "example") return "Example";
  return "Guide";
}

export function ResourceCard({
  item,
  index,
  selected,
  onToggleSelect,
  onTagClick,
}: {
  item: ResourceItem;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onTagClick: (tag: string) => void;
}) {
  const isExample = item.kind === "example";
  const name = item.data.name;
  const description = item.data.description;
  const tags = item.data.tags;
  const href = getResourceHref(item);
  const lightUrl = item.data.previewImageLightUrl;
  const darkUrl = item.data.previewImageDarkUrl;

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden rounded-xl border shadow-none transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 ${
        selected
          ? "border-db-lava/40 ring-1 ring-db-lava/20 dark:border-db-lava/40 dark:ring-db-lava/20"
          : "border-black/10 dark:border-white/10"
      } bg-[#f7f6f4] dark:bg-[#182a32]`}
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-black/10 dark:border-white/10">
        <ResourcePreviewImage
          lightUrl={lightUrl}
          darkUrl={darkUrl}
          alt={name}
          fallback={<FallbackCardArt index={index} />}
        />
      </div>
      <CardHeader className="pb-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
              isExample
                ? "border-db-lava/20 bg-db-lava/8 text-db-lava"
                : "border-black/10 bg-black/5 text-black/60 dark:border-white/10 dark:bg-white/8 dark:text-white/60"
            }`}
          >
            {getResourceBadge(item)}
          </Badge>
          {!isExample && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              aria-label={`Select ${name}`}
            />
          )}
        </div>
        <CardTitle className="text-lg leading-tight font-medium text-black dark:text-white">
          <Link to={href} className="text-inherit no-underline hover:underline">
            {name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="m-0 text-[14px] leading-relaxed text-black/68 dark:text-white/68">
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex items-end justify-between gap-4 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="cursor-pointer"
            >
              <Badge
                variant="secondary"
                className="rounded-sm border border-black/10 bg-black/4 px-1.5 py-0 text-[11px] font-medium text-black/78 hover:border-db-lava/30 hover:bg-db-lava/8 dark:border-white/10 dark:bg-white/8 dark:text-white/78 dark:hover:border-db-lava/30 dark:hover:bg-db-lava/10"
              >
                {tag}
              </Badge>
            </button>
          ))}
        </div>
        <Link
          to={href}
          className="shrink-0 text-xs font-medium text-db-lava no-underline hover:underline"
        >
          View
        </Link>
      </CardFooter>
    </Card>
  );
}
