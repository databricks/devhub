import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseDataPersistencePrereqs from "@site/content/recipes/lakebase-data-persistence/prerequisites.md";
import LakebaseDataPersistenceContent from "@site/content/recipes/lakebase-data-persistence/content.md";

export default function AppWithLakebasePage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("app-with-lakebase");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <LakebaseCreateInstancePrereqs />
      <LakebaseDataPersistencePrereqs />
      <hr />
      <BootstrapContent />
      <hr />
      <LakebaseCreateInstanceContent />
      <hr />
      <LakebaseDataPersistenceContent />
    </CookbookDetail>
  );
}
