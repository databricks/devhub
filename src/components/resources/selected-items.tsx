import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResourceItem } from "./resource-card";

export function SelectedItems({
  items,
  onRemove,
}: {
  items: ResourceItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-black/50 dark:text-white/50">
        {items.length} selected:
      </span>
      {items.map((item) => (
        <button
          key={item.data.id}
          type="button"
          onClick={() => onRemove(item.data.id)}
          className="group/chip cursor-pointer"
        >
          <Badge
            variant="secondary"
            className="gap-1 rounded-md border border-black/10 bg-black/5 pr-1.5 text-[11px] font-medium text-black/70 dark:border-white/10 dark:bg-white/8 dark:text-white/70"
          >
            {item.data.name}
            <XIcon className="size-3 opacity-40 group-hover/chip:opacity-80" />
          </Badge>
        </button>
      ))}
    </div>
  );
}
