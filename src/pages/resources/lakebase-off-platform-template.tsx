import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import { useAllRawRecipeMarkdown } from "@/lib/use-raw-content-markdown";
import LakebaseOffPlatformEnvManagement from "@site/content/recipes/lakebase-off-platform-env-management.md";
import LakebaseTokenManagement from "@site/content/recipes/lakebase-token-management.md";
import LakebaseDrizzleOffPlatform from "@site/content/recipes/lakebase-drizzle-off-platform.md";

const template = templates.find(
  (t) => t.id === "lakebase-off-platform-template",
);

export default function LakebaseOffPlatformTemplatePage(): ReactNode {
  const rawBySlug = useAllRawRecipeMarkdown();
  if (!template) {
    throw new Error("Template lakebase-off-platform-template not found");
  }
  const rawMarkdown = template.recipeIds
    .map((id) => rawBySlug[id])
    .filter(Boolean)
    .join("\n\n---\n\n");
  return (
    <TemplateDetail template={template} rawMarkdown={rawMarkdown}>
      <LakebaseOffPlatformEnvManagement />
      <hr />
      <LakebaseTokenManagement />
      <hr />
      <LakebaseDrizzleOffPlatform />
    </TemplateDetail>
  );
}
