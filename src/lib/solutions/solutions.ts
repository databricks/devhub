export type Solution = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export const solutions: Solution[] = [
  {
    id: "devhub-launch",
    title: "Introducing dev.databricks.com",
    description:
      "A new developer hub for building on Databricks: opinionated guides, copy-pasteable recipes, and agent-ready documentation for software engineers.",
    tags: ["Launch", "Developer Experience", "Agent-Led Development"],
  },
];
