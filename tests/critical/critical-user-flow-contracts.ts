export const criticalUserFlowContracts = {
  bootstrapPrompt: {
    id: "TC-WEB-001",
    priority: "P0",
    route: "/",
    minimumPromptLength: 500,
    requiredPromptFragments: ["# About DevHub", "Databricks CLI", "llms.txt"],
  },
  docsSearchAndExport: {
    id: "TC-WEB-002",
    priority: "P0",
    route: "/docs/tools/databricks-cli",
    query: "Databricks CLI",
    minimumMarkdownLength: 500,
    requiredMarkdownFragments: ["# Databricks CLI"],
  },
  templateDiscoveryAndHandoff: {
    id: "TC-WEB-003",
    priority: "P0",
    route: "/templates/saas-tracker",
    query: "SaaS Subscription Tracker",
    title: "SaaS Subscription Tracker",
    minimumPromptLength: 1_000,
    requiredPromptFragments: ["# About DevHub", "# SaaS Subscription Tracker"],
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
