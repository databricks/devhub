import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";
import DatabricksLocalBootstrap from "./_recipes/databricks-local-bootstrap.mdx";
import LakebaseDataPersistence from "./_recipes/lakebase-data-persistence.mdx";
import SqlAnalyticsDashboard from "./_recipes/sql-analytics-dashboard.mdx";

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
