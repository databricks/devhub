import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  exampleCardHoverPair,
  type Example,
  type Recipe,
  type Template,
} from "@/lib/recipes/recipes";
import { ExampleCardHoverVisual } from "@/components/examples/example-card-hover-visual";

export type ResourceItem =
  | { kind: "example"; data: Example }
  | { kind: "template"; data: Template }
  | { kind: "recipe"; data: Recipe };

const CARD_VISUALS: Array<{
  gradient: string;
  shapes: ReactNode;
}> = [
  {
    gradient: "bg-gradient-to-br from-[#171b21] via-[#2a3038] to-[#11141a]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-7 top-6 h-16 w-24 rounded-md bg-[#0e1116]/95 shadow-lg" />
        <div className="absolute left-16 top-12 h-20 w-28 rounded-md bg-db-lava/95" />
        <div className="absolute right-8 top-8 h-14 w-14 rounded-full border border-white/25" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#eceff2] via-[#fafafa] to-[#e8ebee]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-6 top-6 h-30 w-16 border-r border-black/12 bg-white/72" />
        <div className="absolute left-28 top-12 h-2 w-24 rounded bg-black/14" />
        <div className="absolute left-28 top-20 h-2 w-32 rounded bg-black/10" />
        <div className="absolute left-28 top-28 h-2 w-20 rounded bg-black/12" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#0f1923] via-[#162333] to-[#0a1219]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-7 top-8 h-14 w-20 rounded-sm bg-[#1a3a52]/90 shadow-lg" />
        <div className="absolute left-7 top-26 h-14 w-20 rounded-sm bg-[#1a3a52]/90 shadow-lg" />
        <div className="absolute left-32 top-14 h-20 w-24 rounded-md border border-[#2a8af6]/30 bg-[#0e1a26]/95" />
        <div className="absolute right-8 top-8 h-6 w-6 rounded-full bg-[#2a8af6]/50" />
        <div className="absolute right-10 bottom-8 h-4 w-12 rounded bg-[#2a8af6]/25" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#e9ecef] via-[#f9fafb] to-[#e2e7eb]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute left-6 bottom-6 h-28 w-10 rounded-t bg-[#4a9ff5]/40" />
        <div className="absolute left-20 bottom-6 h-20 w-10 rounded-t bg-[#4a9ff5]/55" />
        <div className="absolute left-34 bottom-6 h-32 w-10 rounded-t bg-[#4a9ff5]/35" />
        <div className="absolute right-10 top-8 h-2 w-20 rounded bg-black/12" />
        <div className="absolute right-10 top-14 h-2 w-14 rounded bg-black/10" />
        <div className="absolute right-10 top-20 h-2 w-18 rounded bg-black/8" />
      </div>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-[#11141a] via-[#1b2028] to-[#0d0f14]",
    shapes: (
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:8px_8px]" />
        <div className="absolute left-8 top-8 h-12 w-28 rounded-md bg-[#1a1f28]/95 shadow-lg" />
        <div className="absolute left-8 top-24 h-12 w-28 rounded-md bg-[#1a1f28]/95 shadow-lg" />
        <div className="absolute right-6 top-6 h-32 w-24 rounded-lg border border-db-lava/30 bg-[#0e1116]/90" />
        <div className="absolute right-10 top-12 h-2 w-16 rounded bg-db-lava/40" />
        <div className="absolute right-10 top-18 h-2 w-12 rounded bg-white/15" />
        <div className="absolute right-10 top-24 h-2 w-14 rounded bg-white/10" />
      </div>
    ),
  },
];

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
  const visual = CARD_VISUALS[index % CARD_VISUALS.length];
  const isExample = item.kind === "example";
  const name = item.data.name;
  const description = item.data.description;
  const tags = item.data.tags;
  const href = getResourceHref(item);
  const exampleHover =
    item.kind === "example" ? exampleCardHoverPair(item.data) : undefined;

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden rounded-xl border shadow-none transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 ${
        selected
          ? "border-db-lava/40 ring-1 ring-db-lava/20 dark:border-db-lava/40 dark:ring-db-lava/20"
          : "border-black/10 dark:border-white/10"
      } bg-[#f7f6f4] dark:bg-[#182a32]`}
    >
      <div
        className={`relative h-40 overflow-hidden border-b border-black/10 md:h-44 dark:border-white/10 ${
          isExample && exampleHover ? "" : visual.gradient
        }`}
      >
        {isExample && exampleHover ? (
          <ExampleCardHoverVisual
            imageLight={exampleHover.imageLight}
            imageDark={exampleHover.imageDark}
            alt={name}
          />
        ) : (
          visual.shapes
        )}
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
