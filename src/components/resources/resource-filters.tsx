import { Checkbox } from "@/components/ui/checkbox";
import { SERVICES, type Service } from "@/lib/recipes/recipes";

export type ResourceType = "examples" | "guides";

export function ResourceFilters({
  selectedServices,
  onToggleService,
  selectedResourceTypes,
  onToggleResourceType,
}: {
  selectedServices: Set<Service>;
  onToggleService: (service: Service) => void;
  selectedResourceTypes: Set<ResourceType>;
  onToggleResourceType: (type: ResourceType) => void;
}) {
  return (
    <nav className="space-y-6" aria-label="Filters">
      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
          Services
        </h3>
        <div className="space-y-2">
          {SERVICES.map((service) => (
            <label
              key={service}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm text-black/80 transition-colors hover:bg-black/4 dark:text-white/80 dark:hover:bg-white/4"
            >
              <Checkbox
                checked={selectedServices.has(service)}
                onCheckedChange={() => onToggleService(service)}
                aria-label={service}
              />
              <span className="leading-tight">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-black/8 pt-6 dark:border-white/8">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
          Type
        </h3>
        <div className="space-y-2">
          {(
            [
              { type: "examples" as const, label: "Examples" },
              { type: "guides" as const, label: "Guides" },
            ] as const
          ).map(({ type, label }) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm text-black/80 transition-colors hover:bg-black/4 dark:text-white/80 dark:hover:bg-white/4"
            >
              <Checkbox
                checked={selectedResourceTypes.has(type)}
                onCheckedChange={() => onToggleResourceType(type)}
                aria-label={label}
              />
              <span className="leading-tight">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </nav>
  );
}
