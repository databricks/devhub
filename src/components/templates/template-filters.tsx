import { Checkbox } from "@/components/ui/checkbox";
import { useFeatureFlags } from "@/lib/feature-flags";
import { SERVICES, type Service } from "@/lib/recipes/recipes";

export type TemplateType = "examples" | "cookbooks";

const ALL_TEMPLATE_TYPES: ReadonlyArray<{
  type: TemplateType;
  label: string;
}> = [
  { type: "examples", label: "Example apps" },
  { type: "cookbooks", label: "Walkthroughs" },
];

export function TemplateFilters({
  selectedServices,
  onToggleService,
  selectedTemplateTypes,
  onToggleTemplateType,
}: {
  selectedServices: Set<Service>;
  onToggleService: (service: Service) => void;
  selectedTemplateTypes: Set<TemplateType>;
  onToggleTemplateType: (type: TemplateType) => void;
}) {
  const { examplesEnabled } = useFeatureFlags();

  const visibleTemplateTypes = examplesEnabled
    ? ALL_TEMPLATE_TYPES
    : ALL_TEMPLATE_TYPES.filter((rt) => rt.type !== "examples");

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

      {visibleTemplateTypes.length > 1 && (
        <div className="border-t border-black/8 pt-6 dark:border-white/8">
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
            Type
          </h3>
          <div className="space-y-2">
            {visibleTemplateTypes.map(({ type, label }) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm text-black/80 transition-colors hover:bg-black/4 dark:text-white/80 dark:hover:bg-white/4"
              >
                <Checkbox
                  checked={selectedTemplateTypes.has(type)}
                  onCheckedChange={() => onToggleTemplateType(type)}
                  aria-label={label}
                />
                <span className="leading-tight">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
