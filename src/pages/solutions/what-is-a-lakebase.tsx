import type { ReactNode } from "react";
import { SolutionDetail } from "@/components/solutions/solution-detail";
import { solutions } from "@/lib/solutions/solutions";

const solution = solutions.find((s) => s.id === "what-is-a-lakebase");
if (!solution) {
  throw new Error("Solution not found: what-is-a-lakebase");
}

export default function WhatIsALakebasePage(): ReactNode {
  return (
    <SolutionDetail solution={solution}>
      <h2>The Problem with Traditional Databases</h2>
      <p>
        For decades, databases have been the backbone of software — quietly
        powering everything from ecommerce checkout flows to enterprise resource
        planning. But the underlying databases have changed very little since
        the 1980s. They suffer from three critical limitations:
      </p>
      <p>
        <strong>Fragile &amp; costly operations</strong> — Traditional databases
        bundle compute and storage into a rigid, monolithic unit. This forces
        teams to provision for peak capacity, leading to expensive idle
        resources. Simple maintenance tasks like snapshotting or running a GDPR
        cleanup query can potentially bring the entire database down.
      </p>
      <p>
        <strong>Clunky development experience</strong> — For code, it takes less
        than a second to create a git branch. For databases, it takes minutes if
        not hours to provision one, and taking a high-fidelity clone of the
        production database is very costly. AI agents need to spin up temporary,
        isolated environments instantly — traditional databases can't keep up.
      </p>
      <p>
        <strong>Extreme vendor lock-in</strong> — The monolithic architecture
        means the only way to get data in or out is through the database engine
        itself. This imposes significant vendor lock-in, making organizations
        deeply dependent on a specific vendor.
      </p>

      <h2>What is a Lakebase?</h2>
      <p>
        A <strong>Lakebase</strong> is a new, open architecture that combines
        the best elements of transactional databases with the flexibility and
        economics of the data lake.
      </p>
      <p>
        The core breakthrough is{" "}
        <strong>separating compute from storage</strong> and placing the
        database's data directly in low-cost cloud storage in open formats,
        while allowing the transactional compute layer to run independently on
        top.
      </p>

      <h3>Key Features</h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Benefit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Storage separated from compute</strong>
              </td>
              <td>
                Massive scale, high concurrency, scale to zero in under a second
              </td>
            </tr>
            <tr>
              <td>
                <strong>Unlimited, low-cost storage</strong>
              </td>
              <td>
                Data lives in the lake — essentially infinite and dramatically
                cheaper
              </td>
            </tr>
            <tr>
              <td>
                <strong>Elastic, serverless Postgres</strong>
              </td>
              <td>Scales up instantly with demand, scales down when idle</td>
            </tr>
            <tr>
              <td>
                <strong>Instant branching &amp; cloning</strong>
              </td>
              <td>
                Branch databases like code — even petabyte-scale in seconds
              </td>
            </tr>
            <tr>
              <td>
                <strong>Unified OLTP + OLAP</strong>
              </td>
              <td>Run analytics and ML directly on transactional data</td>
            </tr>
            <tr>
              <td>
                <strong>Open and multicloud</strong>
              </td>
              <td>No proprietary lock-in, true portability across clouds</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Database Architecture Evolution</h2>

      <h3>Generation 1: Monolith</h3>
      <p className="!mt-1 !text-sm italic text-black/50 dark:text-white/50">
        Examples: MySQL, Postgres, classic Oracle
      </p>
      <p>
        In the pre-cloud era, the only way to design a high-performance database
        was to tightly bind compute and storage together inside a single
        physical machine. While this made sense for the hardware limitations of
        the 1980s, it created a rigid cage where data was trapped.
      </p>

      <h3>Generation 2: Proprietary Loose Coupling</h3>
      <p className="!mt-1 !text-sm italic text-black/50 dark:text-white/50">
        Examples: Aurora, Oracle Exadata
      </p>
      <p>
        Cloud vendors physically separated storage from compute, moving storage
        into proprietary backend tiers. But the data remains locked inside a
        proprietary format accessible only by a single engine — creating a
        single-engine chokehold, analytical friction, and cloud lock-in.
      </p>

      <h3>Generation 3: Lakebase</h3>
      <p className="!mt-1 !text-sm italic text-black/50 dark:text-white/50">
        The next evolution
      </p>
      <p>
        A Lakebase takes decoupled architecture to its logical conclusion. Both
        the storage infrastructure and data formats are completely open:
      </p>
      <ul>
        <li>
          <strong>Better reliability</strong> — Common operations like
          provisioning, scaling, branching, and recovery complete in seconds
        </li>
        <li>
          <strong>Git-like developer experience</strong> — High-fidelity
          branches of production databases for developers and AI agents
        </li>
        <li>
          <strong>No vendor lock-in</strong> — Data in open formats stored in
          cloud object stores
        </li>
      </ul>
      <p>
        In many ways, a Lakebase is what you would build if you had to redesign
        OLTP databases today, with cheap, reliable object storage and cloud
        elasticity available. As organizations adopt cloud and AI, this model
        will become a standard foundation for transactional systems.
      </p>

      <blockquote>
        <p>
          Read the full blog post at{" "}
          <a
            href="https://www.databricks.com/blog/what-is-a-lakebase"
            target="_blank"
            rel="noopener noreferrer"
          >
            databricks.com/blog/what-is-a-lakebase
          </a>
        </p>
      </blockquote>
    </SolutionDetail>
  );
}
