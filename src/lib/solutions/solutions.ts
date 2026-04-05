export type Solution = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export const solutions: Solution[] = [
  {
    id: "what-is-a-lakebase",
    title: "What is a Lakebase?",
    description:
      "A new era of databases: how Lakebase combines transactional Postgres with the flexibility and economics of the data lake.",
    tags: ["Lakebase", "Architecture", "CTO"],
  },
  {
    id: "from-chatbots-to-agentic-workflows",
    title: "From chatbots to agentic workflows",
    description:
      "Simple chat-with-PDF tools are toy apps. Production AI requires multi-agent orchestration with the Lakehouse as episodic memory.",
    tags: ["AI Agents", "Agent Bricks", "Architecture"],
  },
  {
    id: "database-branching-for-ai-agents",
    title: "Database branching for AI agents",
    description:
      "Lakebase branches let agents test against production data safely. Instant copies, full isolation, zero risk to live data.",
    tags: ["Lakebase", "AI Agents", "Testing"],
  },
];
