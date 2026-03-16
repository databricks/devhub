import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: "category",
      label: "Get Started",
      items: [
        "get-started/getting-started",
        "get-started/your-first-app",
        "get-started/core-concepts",
      ],
    },
    {
      type: "category",
      label: "Agents",
      items: [
        "agents/getting-started",
        "agents/core-concepts",
        "agents/development",
        "agents/ai-gateway",
        "agents/observability",
      ],
    },
    {
      type: "category",
      label: "Apps",
      items: [
        "apps/getting-started",
        "apps/core-concepts",
        "apps/plugins",
        "apps/development",
      ],
    },
    {
      type: "category",
      label: "Lakebase",
      items: [
        "lakebase/getting-started",
        "lakebase/core-concepts",
        "lakebase/development",
      ],
    },
    {
      type: "category",
      label: "Tools",
      items: [
        "tools/databricks-cli",
        "tools/appkit",
        {
          type: "category",
          label: "AI Tools",
          items: [
            "tools/ai-tools/agent-skills",
            "tools/ai-tools/docs-mcp-server",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "References",
      items: [
        {
          type: "link",
          label: "Databricks CLI",
          href: "https://docs.databricks.com/aws/en/dev-tools/cli/commands",
        },
        "references/appkit",
      ],
    },
  ],
};

export default sidebars;
