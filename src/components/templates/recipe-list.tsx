import { useState, type ReactNode } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import type { Recipe } from "@/lib/recipes/recipes";

type RecipeListProps = {
  recipes: Recipe[];
};

export function RecipeList({ recipes }: RecipeListProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  if (recipes.length <= 1) return null;

  return (
    <div className="mb-8 rounded-xl border border-db-border bg-db-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/2 dark:hover:bg-white/3"
      >
        <BookOpen size={18} className="shrink-0 text-db-lava" />
        <div className="flex-1">
          <p className="m-0 text-sm font-semibold text-foreground">
            This template includes {recipes.length} recipes
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {isOpen ? "Click to collapse" : "Click to see the recipe list"}
          </p>
        </div>
        <ChevronRight
          size={16}
          className={[
            "shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-90" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div className="border-t border-db-border px-5 py-3">
          <ol className="m-0 list-none space-y-2 p-0">
            {recipes.map((recipe, index) => (
              <li key={recipe.id} className="m-0 p-0">
                <a
                  href={`#${recipe.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")}`}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors hover:bg-black/3 dark:hover:bg-white/5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-db-lava/10 text-xs font-bold text-db-lava">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-medium text-foreground">
                      {recipe.name}
                    </p>
                    <p className="m-0 mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {recipe.description}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
