import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { SolutionDetail } from "@/components/solutions/solution-detail";
import { solutions } from "@/lib/solutions/solutions";

const solution = solutions.find(
  (s) => s.id === "from-chatbots-to-agentic-workflows",
);
if (!solution) {
  throw new Error("Solution not found: from-chatbots-to-agentic-workflows");
}

export default function FromChatbotsToAgenticWorkflowsPage(): ReactNode {
  return (
    <SolutionDetail solution={solution}>
      <h2>Chatbots are not AI strategy</h2>
      <p>
        Every enterprise has a chatbot project. Most of them do the same thing:
        take a PDF, chunk it, embed it into a vector database, and let users ask
        questions. The demo is impressive. The production value is near zero.
      </p>
      <p>
        <strong>
          A chatbot that answers questions about a document is a search engine
          with extra steps.
        </strong>{" "}
        It cannot take action. It cannot coordinate across systems. It cannot
        learn from outcomes.
      </p>
      <p>
        Production AI requires something fundamentally different: agents that
        can reason, plan, execute multi-step workflows, and learn from their
        results.
      </p>

      <h2>What agentic workflows actually look like</h2>
      <p>
        Consider a real business problem: a manufacturing company needs to
        detect anomalies in sensor data, determine root causes, and initiate
        remediation steps — all without human intervention for common failure
        modes.
      </p>

      <h3>The supervisor-worker pattern</h3>
      <p>
        <strong>
          AgentBricks implements a multi-agent architecture with two core roles:
        </strong>
      </p>
      <p>
        <strong>Supervisors</strong> manage the overall workflow. They receive a
        goal, break it into tasks, assign tasks to workers, evaluate results,
        and decide next steps.
      </p>
      <p>
        <strong>Workers</strong> execute specific tasks. One worker might query
        the data warehouse for anomaly patterns. Another might look up
        maintenance procedures. A third might create a ticket in your incident
        management system.
      </p>

      <h3>The Lakehouse as episodic memory</h3>
      <p>
        The critical difference between a toy chatbot and a production agent
        system is <strong>memory</strong>. In AgentBricks, the Lakehouse serves
        as the agent's episodic memory. Every action an agent takes is logged as
        a structured record in Delta Lake tables.
      </p>
      <p>This gives you three capabilities that chatbots simply do not have:</p>
      <ol>
        <li>
          <strong>Pattern learning.</strong> Agents query their own history to
          identify which strategies worked for similar problems.
        </li>
        <li>
          <strong>Full auditability.</strong> Every agent action is a row in a
          governed table with Unity Catalog lineage.
        </li>
        <li>
          <strong>Cross-agent coordination.</strong> Multiple agents can read
          each other's episodic memory to collaborate on complex workflows.
        </li>
      </ol>

      <h2>Why DIY AI stacks fail at scale</h2>
      <p>
        Building this yourself means assembling a separate vector database,
        orchestration framework, model serving endpoint, logging system, and
        governance layer. The prototype works in a notebook, but production
        deployment takes months.
      </p>
      <p>
        <strong>AgentBricks eliminates this entirely.</strong> Model serving,
        vector search, orchestration, evaluation, and governance are all built
        into the platform.
      </p>

      <hr />

      <h2>Get started</h2>
      <ul>
        <li>
          <Link to="/resources">Multi-Agent Hub Template</Link> — Built on
          AgentBricks with supervisor-worker patterns
        </li>
        <li>
          <Link to="/docs/agents/getting-started">AgentBricks</Link> — The
          framework behind production AI agents
        </li>
        <li>
          <Link to="/docs/lakebase/getting-started">Lakebase</Link> — Managed
          Postgres for agent state and memory
        </li>
      </ul>
    </SolutionDetail>
  );
}
