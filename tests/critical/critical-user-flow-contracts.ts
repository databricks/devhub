export const criticalUserFlowContracts = {
  bootstrapPrompt: {
    id: "TC-WEB-001",
    priority: "P0",
    route: "/",
    requiredPromptFragments: [
      "# About DevHub",
      "# Working with DevHub prompts",
      "# What the user just did",
      "# Verify your local Databricks dev environment",
      "Databricks CLI",
      "llms.txt",
    ],
  },
  docsSearchAndExport: {
    id: "TC-WEB-002",
    priority: "P0",
    route: "/docs/tools/databricks-cli",
    query: "Databricks CLI",
    requiredMarkdownFragments: [
      "# Databricks CLI",
      "command-line interface",
      "/templates",
    ],
  },
  templateDiscoveryAndHandoff: {
    id: "TC-WEB-003",
    priority: "P0",
    route: "/templates/saas-tracker",
    query: "SaaS Subscription Tracker",
    title: "SaaS Subscription Tracker",
    requiredPromptFragments: [
      "# About DevHub",
      "# SaaS Subscription Tracker",
      "Data Flow",
      "llms.txt",
    ],
  },
  copyRecovery: {
    id: "TC-WEB-004",
    priority: "P1",
    route: "/templates/saas-tracker",
  },
  agentEntryPoints: {
    id: "TC-AGENT-001",
    priority: "P0",
    mcpTools: ["get_doc_resource", "list_docs_resources"],
  },
} as const;
