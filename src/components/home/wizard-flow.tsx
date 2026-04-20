import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import {
  Clipboard,
  MessagesSquare,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type WizardStep = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  visual: ReactNode;
};

function ClipboardVisual(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect
        x="48"
        y="36"
        width="304"
        height="188"
        rx="14"
        className="text-black/8 dark:text-white/8"
        fill="currentColor"
      />
      <rect
        x="48"
        y="36"
        width="304"
        height="188"
        rx="14"
        className="text-black/18 dark:text-white/18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <g className="text-black/30 dark:text-white/35" fill="currentColor">
        <rect x="70" y="60" width="120" height="10" rx="3" opacity="0.85" />
        <rect x="70" y="82" width="220" height="7" rx="3" opacity="0.4" />
        <rect x="70" y="96" width="190" height="7" rx="3" opacity="0.35" />
        <rect x="70" y="110" width="240" height="7" rx="3" opacity="0.35" />
        <rect x="70" y="124" width="180" height="7" rx="3" opacity="0.3" />
        <rect x="70" y="146" width="140" height="7" rx="3" opacity="0.3" />
        <rect x="70" y="160" width="210" height="7" rx="3" opacity="0.25" />
      </g>
      <g transform="translate(260 156)">
        <rect x="0" y="0" width="64" height="44" rx="10" fill="#ff3621" />
        <g transform="translate(18 10)" fill="#ffffff">
          <rect x="2" y="0" width="16" height="4" rx="1.5" opacity="0.9" />
          <rect
            x="0"
            y="4"
            width="20"
            height="22"
            rx="3"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  );
}

function ChatVisual(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g transform="translate(30 40)">
        <path
          d="M8 0 H240 a16 16 0 0 1 16 16 V64 a16 16 0 0 1 -16 16 H40 L24 94 V80 H8 a8 8 0 0 1 -8 -8 V8 a8 8 0 0 1 8 -8 Z"
          className="text-black/6 dark:text-white/8"
          fill="currentColor"
        />
        <path
          d="M8 0 H240 a16 16 0 0 1 16 16 V64 a16 16 0 0 1 -16 16 H40 L24 94 V80 H8 a8 8 0 0 1 -8 -8 V8 a8 8 0 0 1 8 -8 Z"
          className="text-black/18 dark:text-white/20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <g className="text-black/40 dark:text-white/55" fill="currentColor">
          <rect x="20" y="18" width="180" height="8" rx="3" opacity="0.75" />
          <rect x="20" y="34" width="140" height="7" rx="3" opacity="0.45" />
          <rect x="20" y="48" width="160" height="7" rx="3" opacity="0.4" />
        </g>
      </g>

      <g transform="translate(120 150)">
        <path
          d="M32 0 H244 a8 8 0 0 1 8 8 V72 a8 8 0 0 1 -8 8 H52 L32 96 V80 a8 8 0 0 1 -8 -8 V8 a8 8 0 0 1 8 -8 Z"
          fill="#ff3621"
        />
        <g fill="#ffffff">
          <circle cx="46" cy="24" r="3" />
          <rect
            x="56"
            y="20"
            width="12"
            height="8"
            rx="2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <rect x="76" y="22" width="120" height="6" rx="2" opacity="0.95" />
          <circle cx="46" cy="42" r="3" opacity="0.85" />
          <rect
            x="56"
            y="38"
            width="12"
            height="8"
            rx="2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.85"
          />
          <rect x="76" y="40" width="100" height="6" rx="2" opacity="0.75" />
          <circle cx="46" cy="60" r="3" opacity="0.75" />
          <rect
            x="56"
            y="56"
            width="12"
            height="8"
            rx="2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.75"
          />
          <rect x="76" y="58" width="84" height="6" rx="2" opacity="0.65" />
        </g>
      </g>
    </svg>
  );
}

function BuildVisual(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g
        className="text-black/16 dark:text-white/18"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="none"
      >
        <path d="M80 178 C 140 110, 180 110, 200 130" strokeLinecap="round" />
        <path d="M320 178 C 260 110, 220 110, 200 130" strokeLinecap="round" />
      </g>

      <g transform="translate(40 150)">
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/8 dark:text-white/10"
          fill="currentColor"
        />
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/18 dark:text-white/20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <ellipse cx="48" cy="22" rx="28" ry="8" fill="#ff3621" />
        <rect x="20" y="22" width="56" height="30" fill="#ff3621" />
        <ellipse cx="48" cy="52" rx="28" ry="8" fill="#ff5542" />
        <text
          x="48"
          y="72"
          textAnchor="middle"
          className="fill-black/60 dark:fill-white/70"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          Lakebase
        </text>
      </g>

      <g transform="translate(152 112)">
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/8 dark:text-white/10"
          fill="currentColor"
        />
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/18 dark:text-white/20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle cx="48" cy="34" r="18" fill="#ff3621" />
        <circle cx="40" cy="33" r="2.5" fill="#ffffff" opacity="0.95" />
        <circle cx="48" cy="33" r="2.5" fill="#ffffff" opacity="0.8" />
        <circle cx="56" cy="33" r="2.5" fill="#ffffff" opacity="0.65" />
        <text
          x="48"
          y="68"
          textAnchor="middle"
          className="fill-black/60 dark:fill-white/70"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          Agent Bricks
        </text>
      </g>

      <g transform="translate(264 150)">
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/8 dark:text-white/10"
          fill="currentColor"
        />
        <rect
          x="0"
          y="0"
          width="96"
          height="76"
          rx="10"
          className="text-black/18 dark:text-white/20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <rect
          x="14"
          y="16"
          width="68"
          height="36"
          rx="6"
          fill="none"
          className="text-black/35 dark:text-white/45"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <rect x="22" y="24" width="30" height="5" rx="2" fill="#ff3621" />
        <rect
          x="22"
          y="34"
          width="52"
          height="4"
          rx="2"
          className="text-black/25 dark:text-white/30"
          fill="currentColor"
        />
        <rect
          x="22"
          y="42"
          width="40"
          height="4"
          rx="2"
          className="text-black/20 dark:text-white/25"
          fill="currentColor"
        />
        <text
          x="48"
          y="68"
          textAnchor="middle"
          className="fill-black/60 dark:fill-white/70"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          AppKit
        </text>
      </g>
    </svg>
  );
}

function ShipVisual(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect
        x="44"
        y="54"
        width="312"
        height="160"
        rx="14"
        className="text-black/6 dark:text-white/8"
        fill="currentColor"
      />
      <rect
        x="44"
        y="54"
        width="312"
        height="160"
        rx="14"
        className="text-black/18 dark:text-white/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <g className="text-black/28 dark:text-white/35" fill="currentColor">
        <circle cx="60" cy="70" r="3" />
        <circle cx="72" cy="70" r="3" />
        <circle cx="84" cy="70" r="3" />
      </g>
      <rect
        x="106"
        y="62"
        width="168"
        height="16"
        rx="8"
        className="text-black/8 dark:text-white/10"
        fill="currentColor"
      />
      <text
        x="190"
        y="74"
        textAnchor="middle"
        className="fill-black/55 dark:fill-white/65"
        fontSize="10"
        fontFamily="DM Mono, monospace"
      >
        your-app.databricksapps.com
      </text>
      <g>
        <circle cx="326" cy="70" r="5" fill="#22c55e" />
        <circle cx="326" cy="70" r="9" fill="#22c55e" opacity="0.25" />
      </g>

      <g transform="translate(76 108)">
        <rect
          x="0"
          y="0"
          width="110"
          height="78"
          rx="10"
          fill="#ff3621"
          opacity="0.92"
        />
        <rect
          x="14"
          y="14"
          width="48"
          height="8"
          rx="2"
          fill="#ffffff"
          opacity="0.9"
        />
        <rect
          x="14"
          y="28"
          width="80"
          height="6"
          rx="2"
          fill="#ffffff"
          opacity="0.55"
        />
        <rect
          x="14"
          y="40"
          width="66"
          height="6"
          rx="2"
          fill="#ffffff"
          opacity="0.5"
        />
        <rect
          x="14"
          y="54"
          width="36"
          height="14"
          rx="4"
          fill="#ffffff"
          opacity="0.85"
        />
      </g>

      <g transform="translate(210 108)">
        <rect
          x="0"
          y="0"
          width="110"
          height="78"
          rx="10"
          className="text-black/8 dark:text-white/12"
          fill="currentColor"
        />
        <rect
          x="0"
          y="0"
          width="110"
          height="78"
          rx="10"
          className="text-black/18 dark:text-white/22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <g className="text-black/35 dark:text-white/45" fill="currentColor">
          <rect x="14" y="14" width="46" height="7" rx="2" opacity="0.9" />
          <rect x="14" y="28" width="82" height="5" rx="2" opacity="0.5" />
          <polyline
            points="14,62 28,52 42,58 56,44 70,50 84,36 96,42"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

const steps: WizardStep[] = [
  {
    number: "01",
    eyebrow: "Copy",
    title: "Copy the wizard prompt",
    description:
      "One click copies a guided setup prompt — the full recipe your coding agent needs to build and deploy on Databricks.",
    icon: Clipboard,
    visual: <ClipboardVisual />,
  },
  {
    number: "02",
    eyebrow: "Paste",
    title: "Paste it into your coding agent",
    description:
      "Works with Cursor, Claude Code, or Codex. Your agent reads the prompt and starts a conversation: what do you want to build, which data, which workspace?",
    icon: MessagesSquare,
    visual: <ChatVisual />,
  },
  {
    number: "03",
    eyebrow: "Build",
    title: "It scaffolds, wires, and iterates",
    description:
      "The wizard uses AppKit to scaffold the app, provisions Lakebase for data, wires Agent Bricks for AI, and iterates on the UI until it feels right — all guided by your answers.",
    icon: Sparkles,
    visual: <BuildVisual />,
  },
  {
    number: "04",
    eyebrow: "Ship",
    title: "Deploy to your workspace",
    description:
      "One command ships it to Databricks Apps. Unity Catalog governs the data, OAuth is built in, and you get a live URL under your workspace.",
    icon: Rocket,
    visual: <ShipVisual />,
  },
];

function StepRow({
  step,
  index,
}: {
  step: WizardStep;
  index: number;
}): ReactNode {
  const isReversed = index % 2 === 1;
  const Icon = step.icon;

  return (
    <div
      className={[
        "grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14",
        isReversed ? "md:[direction:rtl]" : "",
      ].join(" ")}
    >
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <p className="mb-4 inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
          <span className="font-mono text-db-lava">{step.number}</span>
          <span className="h-px w-6 bg-db-lava/60" />
          <span className="text-black/55 dark:text-white/55">
            {step.eyebrow}
          </span>
        </p>
        <h3 className="text-2xl leading-snug font-medium tracking-tight text-black md:text-[2rem] md:leading-[1.15] dark:text-white">
          {step.title}
        </h3>
        <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-black/60 dark:text-white/60">
          {step.description}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-black/70 backdrop-blur-sm dark:border-white/12 dark:bg-white/6 dark:text-white/70">
          <Icon className="h-3.5 w-3.5 text-db-lava" />
          Step {step.number}
        </div>
      </div>
      <div className={isReversed ? "md:[direction:ltr]" : ""}>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_48px_-24px_rgba(11,32,38,0.25)] dark:border-white/10 dark:bg-db-navy-light dark:shadow-[0_18px_48px_-24px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,54,33,0.06)_0%,transparent_45%)]" />
          {step.visual}
        </div>
      </div>
    </div>
  );
}

export function WizardFlow(): ReactNode {
  return (
    <section
      id="wizard-flow"
      className="relative scroll-mt-20 bg-white py-20 dark:bg-db-navy md:py-28"
    >
      <div className="container px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-black/55 dark:text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-db-lava" />
            How the wizard prompt works
          </p>
          <h2 className="text-3xl leading-[1.1] font-medium tracking-tight text-black md:text-5xl dark:text-white">
            Copy. Paste. Build.{" "}
            <span className="text-db-lava">Ship to Databricks.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            The wizard prompt guides you and your coding agent from an empty
            folder to a deployed Databricks app — with your data, your
            workspace, and your agent logic wired together in one conversation.
          </p>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-16 md:gap-24">
          {steps.map((step, index) => (
            <StepRow key={step.number} step={step} index={index} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-black/10 bg-db-oat-medium/60 p-6 text-center dark:border-white/10 dark:bg-black/40 md:mt-24 md:p-8">
          <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
            <span className="font-medium text-black dark:text-white">
              Want a more specific starting point?
            </span>{" "}
            Every guide and example on{" "}
            <Link
              to="/resources"
              className="font-medium text-db-lava no-underline hover:underline"
            >
              /resources
            </Link>{" "}
            is a copy-pasteable prompt. Get inspired by what&apos;s already
            possible, then hand it to your agent.
          </p>
        </div>
      </div>
    </section>
  );
}
