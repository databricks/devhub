import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { SolutionDetail } from "@/components/solutions/solution-detail";
import { solutions } from "@/lib/solutions/solutions";

const solution = solutions.find(
  (s) => s.id === "database-branching-for-ai-agents",
);
if (!solution) {
  throw new Error("Solution not found: database-branching-for-ai-agents");
}

export default function DatabaseBranchingForAiAgentsPage(): ReactNode {
  return (
    <SolutionDetail solution={solution}>
      <h2>The most dangerous pattern in AI development</h2>
      <p>
        You built an AI agent. It works beautifully on synthetic test data. You
        deploy it to production and it immediately does something unexpected —
        because synthetic data does not reflect the complexity, edge cases, and
        inconsistencies of real-world data.
      </p>
      <p>
        <strong>
          Testing agents against fake data is how you ship agents that fail in
          production.
        </strong>{" "}
        But testing against production data directly is how you corrupt your
        production database.
      </p>

      <h2>Database branching: the third option</h2>
      <p>
        <strong>
          Lakebase database branching creates instant, isolated copies of your
          production database.
        </strong>{" "}
        Your agents can read and write freely in a branch. Production data is
        completely untouched. When you are confident the agent behaves
        correctly, you promote the changes. When it does not, you delete the
        branch.
      </p>

      <h3>How branching works</h3>
      <ul>
        <li>
          <strong>Instant creation.</strong> Branches are created using
          copy-on-write storage. No matter how large your database, branching
          takes seconds.
        </li>
        <li>
          <strong>Full isolation.</strong> Changes in a branch are invisible to
          production. Multiple agents can test in separate branches
          simultaneously.
        </li>
        <li>
          <strong>Production-accurate data.</strong> Branches contain your real
          data — the same edge cases, the same volume, the same relationships
          your agents will encounter in production.
        </li>
        <li>
          <strong>Zero storage overhead.</strong> Branches only consume storage
          for the data that changes. An unmodified branch costs almost nothing.
        </li>
      </ul>

      <h3>Use cases that matter</h3>
      <p>
        <strong>Agent development.</strong> Give every developer their own
        branch. Test agent behavior against real data without coordinating with
        anyone.
      </p>
      <p>
        <strong>Schema migrations.</strong> Test database changes against
        production data before applying them. Catch issues before they affect
        users.
      </p>
      <p>
        <strong>A/B testing agents.</strong> Run two agent versions against the
        same data in separate branches. Compare outcomes objectively.
      </p>
      <p>
        <strong>Incident recovery.</strong> When an agent misbehaves, branch
        from a point-in-time before the incident. Investigate without time
        pressure.
      </p>

      <h2>Why this matters</h2>
      <p>
        The quality of your AI agents is limited by the quality of your testing.
        Database branching removes the tradeoff between testing against real
        data and protecting production.
      </p>
      <p>
        <strong>
          Your agents should be tested against reality, not a simulation of it.
        </strong>
      </p>

      <hr />

      <h2>Get started</h2>
      <ul>
        <li>
          <Link to="/docs/lakebase/getting-started">Lakebase</Link> — Learn
          about database branching
        </li>
        <li>
          <Link to="/resources">AI Assistant Template</Link> — Test agent
          development with branches
        </li>
        <li>
          <Link to="/docs/get-started/getting-started">Documentation</Link> —
          Branching setup guide
        </li>
      </ul>
    </SolutionDetail>
  );
}
