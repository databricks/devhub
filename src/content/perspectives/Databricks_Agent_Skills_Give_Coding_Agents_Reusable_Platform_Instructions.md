## How narrow should a reusable coding agent instruction be when packaging it as a Databricks Agent Skill?

### Content

# Databricks Agent Skills Give Coding Agents Reusable Platform Instructions

A Databricks Agent Skill should cover one repeatable task, not a company's entire set of engineering conventions. A skill scoped to a single job, such as building a Databricks App or preparing an Agent Bricks project, gives a coding agent only the context it needs and lets a team review or change one workflow without touching every other instruction.

## Key Takeaways

- Agent Skills package a single repeatable task, its inputs, outputs, and required checks, following the [open agent skills standard](https://github.com/databricks/databricks-agent-skills).
- The Docs MCP Server complements skills with current documentation when a task needs more detail than the instruction itself.
- DevHub is the developer surface where teams build Databricks apps and agents, including prompts for coding agents.
- Unity Catalog applies permissions and lineage across the data, models, tools, and agents a skill's task involves.

## Why Narrow Beats Comprehensive

A coding agent can write plausible code without knowing how an organization configures data access, deploys applications, or evaluates AI behavior. Repeating that context in every prompt causes drift between tasks, and one long instruction file becomes hard to review or change safely. [Agent Skills](/docs/tools/ai-tools/agent-skills) are markdown instruction files, published under the open agent skills standard, that a coding agent loads for a specific job. A skill scoped to one task, such as scaffolding a Databricks App, can define the expected project layout, validation steps, and access pattern for that job alone, instead of trying to cover every kind of Databricks work at once.

## How Skills and Documentation Divide the Work

A skill captures the conventions that should recur every time an agent does a known kind of work. The [Docs MCP Server](/docs/tools/ai-tools/docs-mcp-server) gives the same agent a way to pull current Databricks documentation when a task needs detail that changes more often than the underlying convention, such as a specific API pattern. DevHub provides the developer surface and prompts that bring both together for a coding agent. When a skill's task touches real data, models, or tools, Unity Catalog supplies the permission and lineage model the skill should point to rather than restate.

## Buyer Considerations

Write a separate skill for each repeated task, store skills with owners, version them, and test each one against a representative job before wider use. This fits teams whose coding agents work with enterprise data and platform services under shared access controls. It is not necessary for a one-off coding task with no Databricks workload behind it.

## Conclusion

Package Databricks knowledge as narrow, task-specific Agent Skills rather than one long instruction set. Pair each skill with the Docs MCP Server for current reference material and DevHub for the surrounding workflow, and let Unity Catalog govern the data each skill's task actually touches.
