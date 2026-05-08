import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/recipes/recipes";

export function ActiveFilters({
  activeTags,
  onRemoveTag,
  selectedServices,
  onRemoveService,
  replitOnly,
  onRemoveReplitOnly,
  onClearAll,
}: {
  activeTags: Set<string>;
  onRemoveTag: (tag: string) => void;
  selectedServices: Set<Service>;
  onRemoveService: (service: Service) => void;
  replitOnly: boolean;
  onRemoveReplitOnly: () => void;
  onClearAll: () => void;
}) {
  const hasFilters =
    activeTags.size > 0 || selectedServices.size > 0 || replitOnly;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {replitOnly && (
        <button
          type="button"
          onClick={onRemoveReplitOnly}
          className="group/pill cursor-pointer"
        >
          <Badge
            variant="outline"
            className="gap-1 rounded-md border-db-lava/25 bg-db-lava/6 pr-1.5 text-[11px] font-medium text-db-lava dark:border-db-lava/30 dark:bg-db-lava/10 dark:text-db-lava-light"
          >
            Replit Apps
            <XIcon className="size-3 opacity-50 group-hover/pill:opacity-100" />
          </Badge>
        </button>
      )}
      {[...selectedServices].map((service) => (
        <button
          key={`svc-${service}`}
          type="button"
          onClick={() => onRemoveService(service)}
          className="group/pill cursor-pointer"
        >
          <Badge
            variant="outline"
            className="gap-1 rounded-md border-db-lava/25 bg-db-lava/6 pr-1.5 text-[11px] font-medium text-db-lava dark:border-db-lava/30 dark:bg-db-lava/10 dark:text-db-lava-light"
          >
            {service}
            <XIcon className="size-3 opacity-50 group-hover/pill:opacity-100" />
          </Badge>
        </button>
      ))}
      {[...activeTags].map((tag) => (
        <button
          key={`tag-${tag}`}
          type="button"
          onClick={() => onRemoveTag(tag)}
          className="group/pill cursor-pointer"
        >
          <Badge
            variant="outline"
            className="gap-1 rounded-md border-black/15 bg-black/4 pr-1.5 text-[11px] font-medium text-black/70 dark:border-white/15 dark:bg-white/6 dark:text-white/70"
          >
            {tag}
            <XIcon className="size-3 opacity-50 group-hover/pill:opacity-100" />
          </Badge>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 cursor-pointer text-[11px] font-medium text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
      >
        Clear all
      </button>
    </div>
  );
}
