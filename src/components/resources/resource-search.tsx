import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ResourceSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
      <Input
        type="search"
        placeholder="Search examples and guides..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-white pl-10 text-sm dark:bg-[#162027]"
      />
    </div>
  );
}
