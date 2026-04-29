import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/lib/recipes/recipes";
import type { TemplateType } from "./template-filters";

export function ActiveFilters({
  activeTags,
  onRemoveTag,
  selectedServices,
  onRemoveService,
  selectedTemplateTypes,
  onRemoveTemplateType,
  onClearAll,
}: {
  activeTags: Set<string>;
  onRemoveTag: (tag: string) => void;
  selectedServices: Set<Service>;
  onRemoveService: (service: Service) => void;
  selectedTemplateTypes: Set<TemplateType>;
  onRemoveTemplateType: (type: TemplateType) => void;
  onClearAll: () => void;
}) {
  const hasFilters =
    activeTags.size > 0 ||
    selectedServices.size > 0 ||
    selectedTemplateTypes.size > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
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
      {[...selectedTemplateTypes].map((type) => (
        <button
          key={`rt-${type}`}
          type="button"
          onClick={() => onRemoveTemplateType(type)}
          className="group/pill cursor-pointer"
        >
          <Badge
            variant="outline"
            className="gap-1 rounded-md border-db-cyan/30 bg-db-cyan/8 pr-1.5 text-[11px] font-medium text-db-navy dark:border-db-cyan/25 dark:bg-db-cyan/10 dark:text-db-cyan"
          >
            {type === "examples" ? "Example apps" : "Walkthroughs"}
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
