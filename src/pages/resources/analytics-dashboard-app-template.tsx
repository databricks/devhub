import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/templates/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "@site/content/recipes/databricks-local-bootstrap.md";
import LakebaseDataPersistence from "@site/content/recipes/lakebase-data-persistence.md";
import SqlAnalyticsDashboard from "@site/content/recipes/sql-analytics-dashboard.md";

const template = templates.find(
  (t) => t.id === "analytics-dashboard-app-template",
);

export default function AnalyticsDashboardAppTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template analytics-dashboard-app-template not found");
  }
  return (
    <TemplateDetail template={template}>
      <DatabricksLocalBootstrap />
      <hr />
      <LakebaseDataPersistence />
      <hr />
      <SqlAnalyticsDashboard />
    </TemplateDetail>
  );
}
