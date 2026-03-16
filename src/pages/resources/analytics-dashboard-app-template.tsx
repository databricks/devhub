import type { ReactNode } from "react";
import { TemplateDetail } from "@/components/resources/template-detail";
import { templates } from "@/lib/recipes/recipes";

const template = templates.find(
  (t) => t.id === "analytics-dashboard-app-template",
);

export default function AnalyticsDashboardAppTemplatePage(): ReactNode {
  if (!template) {
    throw new Error("Template analytics-dashboard-app-template not found");
  }
  return <TemplateDetail template={template} />;
}
