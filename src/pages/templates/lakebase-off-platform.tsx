import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseOffPlatformEnvManagementPrereqs from "@site/content/recipes/lakebase-off-platform-env-management/prerequisites.md";
import LakebaseOffPlatformEnvManagementContent from "@site/content/recipes/lakebase-off-platform-env-management/content.md";
import LakebaseTokenManagementPrereqs from "@site/content/recipes/lakebase-token-management/prerequisites.md";
import LakebaseTokenManagementContent from "@site/content/recipes/lakebase-token-management/content.md";
import LakebaseDrizzleOffPlatformPrereqs from "@site/content/recipes/lakebase-drizzle-off-platform/prerequisites.md";
import LakebaseDrizzleOffPlatformContent from "@site/content/recipes/lakebase-drizzle-off-platform/content.md";

export default function LakebaseOffPlatformPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown(
    "lakebase-off-platform",
  );

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
