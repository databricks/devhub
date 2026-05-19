import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import Goal from "@site/content/cookbooks/operational-data-analytics/goal.md";
import UnityCatalogSetupPrereqs from "@site/content/recipes/unity-catalog-setup/prerequisites.md";
import UnityCatalogSetupContent from "@site/content/recipes/unity-catalog-setup/content.md";
import LakebaseCreateInstancePrereqs from "@site/content/recipes/lakebase-create-instance/prerequisites.md";
import LakebaseCreateInstanceContent from "@site/content/recipes/lakebase-create-instance/content.md";
import LakebaseChangeDataFeedAutoscalingPrereqs from "@site/content/recipes/lakebase-change-data-feed-autoscaling/prerequisites.md";
import LakebaseChangeDataFeedAutoscalingContent from "@site/content/recipes/lakebase-change-data-feed-autoscaling/content.md";
import SyncTablesAutoscalingPrereqs from "@site/content/recipes/sync-tables-autoscaling/prerequisites.md";
import SyncTablesAutoscalingContent from "@site/content/recipes/sync-tables-autoscaling/content.md";
import MedallionArchitectureFromCdcPrereqs from "@site/content/recipes/medallion-architecture-from-cdc/prerequisites.md";
import MedallionArchitectureFromCdcContent from "@site/content/recipes/medallion-architecture-from-cdc/content.md";

export default function OperationalDataAnalyticsPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown(
    "operational-data-analytics",
  );

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <Goal />
      <h2 id="prerequisites">Prerequisites</h2>
      <UnityCatalogSetupPrereqs />
      <LakebaseCreateInstancePrereqs />
      <LakebaseChangeDataFeedAutoscalingPrereqs />
      <SyncTablesAutoscalingPrereqs />
      <MedallionArchitectureFromCdcPrereqs />
      <hr />
      <UnityCatalogSetupContent />
      <hr />
      <LakebaseCreateInstanceContent />
      <hr />
      <LakebaseChangeDataFeedAutoscalingContent />
      <hr />
      <SyncTablesAutoscalingContent />
      <hr />
      <MedallionArchitectureFromCdcContent />
    </CookbookDetail>
  );
}
