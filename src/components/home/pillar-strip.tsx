import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import { pillars, type Pillar } from "@/lib/landing-content";

/**
 * Conceptual illustration for each pillar. Not UI skeletons — each is a
 * purpose-built SVG that encodes the core idea of the concept:
 *   - Lakebase: a Postgres cylinder sitting on layered Lakehouse strata,
 *     with a git-like branching tree on the side (instant branches).
 *   - Agent Bricks: a central LLM hub connected to orbiting tool nodes of
 *     different shapes (tool use across Python, MCP, data access).
 *   - Databricks Apps: nested frames showing an app living inside a workspace
 *     with a lava "live" status badge (platform-hosted deployment).
 */
function PillarVisual({ index }: { index: number }): ReactNode {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/10 bg-db-oat-medium/40 shadow-[0_12px_32px_rgba(11,32,38,0.08)] dark:border-white/10 dark:bg-db-navy-light dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
      {index === 0 ? <LakebaseConcept /> : null}
      {index === 1 ? <AgentBricksConcept /> : null}
      {index === 2 ? <AppsConcept /> : null}
    </div>
  );
}

function LakebaseConcept(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="text-black/18 dark:text-white/22">
        <rect
          x="36"
          y="186"
          width="328"
          height="22"
          rx="5"
          fill="currentColor"
          opacity="0.55"
        />
        <rect
          x="58"
          y="214"
          width="284"
          height="18"
          rx="5"
          fill="currentColor"
          opacity="0.35"
        />
        <rect
          x="82"
          y="236"
          width="236"
          height="14"
          rx="4"
          fill="currentColor"
          opacity="0.2"
        />
      </g>

      <g transform="translate(220 60)">
        <ellipse cx="64" cy="14" rx="64" ry="14" fill="#ff3621" />
        <rect x="0" y="14" width="128" height="104" fill="#ff3621" />
        <ellipse cx="64" cy="118" rx="64" ry="14" fill="#ff5542" />
        <ellipse
          cx="64"
          cy="14"
          rx="64"
          ry="14"
          fill="#ffffff"
          opacity="0.14"
        />
        <ellipse
          cx="64"
          cy="56"
          rx="64"
          ry="14"
          fill="#000000"
          opacity="0.18"
        />
      </g>

      <g
        className="text-[#ff3621] dark:text-[#ff5542]"
        stroke="currentColor"
        fill="currentColor"
      >
        <line
          x1="82"
          y1="72"
          x2="82"
          y2="172"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="82" cy="72" r="5.5" />
        <circle cx="82" cy="172" r="5.5" />
        <path
          d="M82 92 Q82 100 96 102 L124 102"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="128" cy="102" r="5" />
        <path
          d="M82 142 Q82 150 96 152 L132 152"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="136" cy="152" r="5" />
      </g>
    </svg>
  );
}

function AgentBricksConcept(): ReactNode {
  const cx = 200;
  const cy = 150;
  const hubR = 34;
  const tools = [
    { dx: -120, dy: -70, shape: "square" as const },
    { dx: 120, dy: -70, shape: "circle" as const },
    { dx: -140, dy: 0, shape: "triangle" as const },
    { dx: 140, dy: 10, shape: "diamond" as const },
    { dx: -100, dy: 80, shape: "square" as const },
    { dx: 100, dy: 86, shape: "circle" as const },
  ];
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        className="text-black/22 dark:text-white/25"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {tools.map((t, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + t.dx}
            y2={cy + t.dy}
            strokeLinecap="round"
          />
        ))}
      </g>

      <g className="text-black/45 dark:text-white/55" fill="currentColor">
        {tools.map((t, i) => {
          const x = cx + t.dx;
          const y = cy + t.dy;
          const accent = i === 1;
          const fill = accent ? "#ff3621" : "currentColor";
          if (t.shape === "circle") {
            return (
              <circle key={i} cx={x} cy={y} r={accent ? 16 : 15} fill={fill} />
            );
          }
          if (t.shape === "square") {
            return (
              <rect
                key={i}
                x={x - 15}
                y={y - 15}
                width="30"
                height="30"
                rx="5"
                fill={fill}
              />
            );
          }
          if (t.shape === "triangle") {
            return (
              <polygon
                key={i}
                points={`${x},${y - 17} ${x + 15},${y + 10} ${x - 15},${y + 10}`}
                fill={fill}
              />
            );
          }
          return (
            <polygon
              key={i}
              points={`${x},${y - 17} ${x + 17},${y} ${x},${y + 17} ${x - 17},${y}`}
              fill={fill}
            />
          );
        })}
      </g>

      <g>
        <circle
          cx={cx}
          cy={cy}
          r={hubR + 10}
          fill="#ff3621"
          fillOpacity="0.12"
        />
        <circle cx={cx} cy={cy} r={hubR} fill="#ff3621" />
        <circle cx={cx - 10} cy={cy - 2} r="3" fill="#ffffff" opacity="0.95" />
        <circle cx={cx + 2} cy={cy - 2} r="3" fill="#ffffff" opacity="0.78" />
        <circle cx={cx + 14} cy={cy - 2} r="3" fill="#ffffff" opacity="0.58" />
      </g>
    </svg>
  );
}

function AppsConcept(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="30"
        y="40"
        width="340"
        height="220"
        rx="18"
        className="text-black/18 dark:text-white/22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <g className="text-black/22 dark:text-white/32" fill="currentColor">
        <circle cx="46" cy="56" r="3.5" />
        <circle cx="58" cy="56" r="3.5" />
        <circle cx="70" cy="56" r="3.5" />
      </g>

      <rect
        x="70"
        y="76"
        width="260"
        height="152"
        rx="14"
        className="text-black/8 dark:text-white/10"
        fill="currentColor"
      />
      <rect
        x="70"
        y="76"
        width="260"
        height="152"
        rx="14"
        className="text-black/22 dark:text-white/22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <g className="text-black/42 dark:text-white/58" fill="currentColor">
        <rect x="90" y="98" width="92" height="10" rx="3" opacity="0.75" />
        <rect x="90" y="122" width="220" height="8" rx="3" opacity="0.4" />
        <rect x="90" y="140" width="180" height="8" rx="3" opacity="0.35" />
        <rect x="90" y="158" width="200" height="8" rx="3" opacity="0.3" />
        <rect x="90" y="186" width="76" height="24" rx="8" fill="#ff3621" />
      </g>

      <g transform="translate(304 88)">
        <rect x="-18" y="-10" width="30" height="20" rx="10" fill="#ff3621" />
        <circle cx="-8" cy="0" r="3" fill="#ffffff" />
      </g>
    </svg>
  );
}

function PillarRow({
  pillar,
  index,
}: {
  pillar: Pillar;
  index: number;
}): ReactNode {
  const isReversed = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className={[
        "grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12",
        isReversed ? "md:[direction:rtl]" : "",
      ].join(" ")}
    >
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
          <span className="text-db-lava">{number}</span>
          <span className="text-black/50 dark:text-white/50">
            {pillar.title}
          </span>
        </p>
        <h3 className="text-2xl leading-snug font-medium tracking-tight text-black dark:text-white md:text-3xl">
          {pillar.subtitle}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-black/50 italic dark:text-white/50">
          {pillar.description}
        </p>
        <Link
          to={pillar.link}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-db-lava no-underline hover:underline"
        >
          Learn more
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 13L13 1M13 1H3M13 1v10" />
          </svg>
        </Link>
      </div>
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <PillarVisual index={index} />
      </div>
    </div>
  );
}

export function PillarStrip(): ReactNode {
  return (
    <section className="bg-db-oat-medium py-20 dark:bg-black md:py-28">
      <div className="container px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-black/55 dark:text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-db-lava" />
            The building blocks
          </p>
          <h2 className="text-3xl leading-[1.1] font-medium tracking-tight text-black md:text-5xl dark:text-white">
            The wizard wires these up{" "}
            <span className="text-db-lava">for you</span>.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            Three first-class primitives for operationalizing data on
            Databricks. Same workspace, same identity, same governance —
            composed by{" "}
            <Link
              to="/docs/apps/overview"
              className="font-medium text-black no-underline underline-offset-2 hover:underline dark:text-white"
            >
              AppKit
            </Link>
            , our open-source TypeScript SDK.
          </p>
        </div>
        <div className="mx-auto flex max-w-5xl flex-col gap-16 md:gap-24">
          {pillars.map((pillar, index) => (
            <PillarRow key={pillar.title} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
