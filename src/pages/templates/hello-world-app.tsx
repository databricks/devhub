import type { ReactNode } from "react";
import { CookbookDetail } from "@/components/cookbooks/cookbook-detail";
import { useCookbookMarkdown } from "@/lib/use-cookbook-markdown";
import BootstrapPrereqs from "@site/content/recipes/databricks-local-bootstrap/prerequisites.md";
import BootstrapContent from "@site/content/recipes/databricks-local-bootstrap/content.md";

export default function HelloWorldAppPage(): ReactNode {
  const { cookbook, rawMarkdown } = useCookbookMarkdown("hello-world-app");

  return (
    <CookbookDetail cookbook={cookbook} rawMarkdown={rawMarkdown}>
      <h2 id="prerequisites">Prerequisites</h2>
      <BootstrapPrereqs />
      <hr />
      <BootstrapContent />
    </CookbookDetail>
  );
}
