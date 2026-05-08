import { Checkbox } from "@/components/ui/checkbox";
import { SERVICES, type Service } from "@/lib/recipes/recipes";

export function TemplateFilters({
  selectedServices,
  onToggleService,
  replitOnly,
  onToggleReplitOnly,
}: {
  selectedServices: Set<Service>;
  onToggleService: (service: Service) => void;
  replitOnly: boolean;
  onToggleReplitOnly: () => void;
}) {
  return (
    <nav className="space-y-6" aria-label="Filters">
      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-black/50 uppercase dark:text-white/50">
          Build with
        </h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm text-black/80 transition-colors hover:bg-black/4 dark:text-white/80 dark:hover:bg-white/4">
            <Checkbox
              checked={replitOnly}
              onCheckedChange={onToggleReplitOnly}
              aria-label="Replit Apps"
            />
            <span className="leading-tight">Replit Apps</span>
          </label>
        </div>
      </div>
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
    </nav>
  );
}
