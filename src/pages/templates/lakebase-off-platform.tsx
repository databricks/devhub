import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/templates/cookbook-detail";
import { cookbooks, recipes } from "@/lib/recipes/recipes";
import {
  useAllRecipeSections,
  useCookbookIntro,
} from "@/lib/use-raw-content-markdown";
import { composeCookbookMarkdown } from "@/lib/cookbook-composition";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseOffPlatformEnvManagementPrereqs from "@site/content/recipes/lakebase-off-platform-env-management/prerequisites.md";
import LakebaseOffPlatformEnvManagementContent from "@site/content/recipes/lakebase-off-platform-env-management/content.md";
import LakebaseTokenManagementPrereqs from "@site/content/recipes/lakebase-token-management/prerequisites.md";
import LakebaseTokenManagementContent from "@site/content/recipes/lakebase-token-management/content.md";
import LakebaseDrizzleOffPlatformPrereqs from "@site/content/recipes/lakebase-drizzle-off-platform/prerequisites.md";
import LakebaseDrizzleOffPlatformContent from "@site/content/recipes/lakebase-drizzle-off-platform/content.md";

const COOKBOOK_ID = "lakebase-off-platform";

export default function LakebaseOffPlatformPage(): ReactNode {
  const cookbook = cookbooks.find((t) => t.id === COOKBOOK_ID);
  if (!cookbook) throw new Error(`Cookbook ${COOKBOOK_ID} not found`);

  const sectionsBySlug = useAllRecipeSections();
  const intro = useCookbookIntro(COOKBOOK_ID);

  const recipeInputs = cookbook.recipeIds.map((id) => {
    const recipe = recipes.find((r) => r.id === id);
    const sections = sectionsBySlug[id];
    if (!recipe || !sections) {
      throw new Error(`Missing recipe or sections for "${id}"`);
    }
    return { id, name: recipe.name, sections };
  });

  const rawMarkdown = composeCookbookMarkdown({
    cookbookName: cookbook.name,
    cookbookDescription: cookbook.description,
    intro,
    recipes: recipeInputs,
  });

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <LakebaseCreateInstancePrereqs />
      <LakebaseOffPlatformEnvManagementPrereqs />
      <LakebaseTokenManagementPrereqs />
      <LakebaseDrizzleOffPlatformPrereqs />
      <hr />
      <LakebaseCreateInstanceContent />
      <hr />
      <LakebaseOffPlatformEnvManagementContent />
      <hr />
      <LakebaseTokenManagementContent />
      <hr />
      <LakebaseDrizzleOffPlatformContent />
    </CookbookDetail>
  );
}
