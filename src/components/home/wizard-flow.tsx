import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { Check, Clipboard, LoaderCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { getBootstrapPromptApiPath } from "@/lib/bootstrap-prompt";

type WizardStep = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
  action?: ReactNode;
};

function ClipboardVisual(): ReactNode {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Red pill button centered */}
      <g transform="translate(200 110)">
        {/* Button shadow */}
        <rect
          x="-110"
          y="2"
          width="220"
          height="48"
          rx="24"
          fill="#ff3621"
          opacity="0.25"
        />
        {/* Button background */}
        <rect x="-110" y="-20" width="220" height="48" rx="24" fill="#ff3621" />
        {/* Clipboard icon inside button */}
        <g
          transform="translate(-84 -10)"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
        >
          <rect
            x="2"
            y="0"
            width="12"
            height="3"
            rx="1.5"
            fill="#ffffff"
            opacity="0.9"
          />
          <rect x="0" y="3" width="16" height="18" rx="2.5" />
        </g>
        {/* Button text placeholder lines */}
        <g fill="#ffffff">
          <rect x="-58" y="-8" width="148" height="8" rx="4" opacity="0.95" />
          <rect x="-36" y="6" width="104" height="6" rx="3" opacity="0.5" />
        </g>
      </g>

      {/* Mouse cursor clicking the button */}
      <g transform="translate(268 138)">
        <path
          d="M0 0 L0 20 L5.5 15.5 L9.5 24 L13 22.5 L9 14 L15.5 13.5 Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Click ripple rings */}
      <circle
        cx="268"
        cy="138"
        r="8"
        fill="none"
        stroke="#ff3621"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <circle
        cx="268"
        cy="138"
        r="16"
        fill="none"
        stroke="#ff3621"
        strokeWidth="1"
        opacity="0.2"
      />
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
      {/* Terminal window background */}
      <rect
        x="30"
        y="20"
        width="340"
        height="220"
        rx="12"
        className="text-black/[0.03] dark:text-white/[0.03]"
        fill="currentColor"
      />
      <rect
        x="30"
        y="20"
        width="340"
        height="220"
        rx="12"
        className="text-black/15 dark:text-white/15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />

      {/* Title bar dots */}
      <circle
        cx="50"
        cy="36"
        r="4"
        className="text-black/15 dark:text-white/15"
        fill="currentColor"
      />
      <circle
        cx="64"
        cy="36"
        r="4"
        className="text-black/15 dark:text-white/15"
        fill="currentColor"
      />
      <circle
        cx="78"
        cy="36"
        r="4"
        className="text-black/15 dark:text-white/15"
        fill="currentColor"
      />

      {/* Terminal title */}
      <text
        x="200"
        y="39"
        textAnchor="middle"
        className="text-black/30 dark:text-white/30"
        fill="currentColor"
        fontSize="8"
        fontFamily="monospace"
      >
        Terminal
      </text>

      {/* Line 1: cd ~/projects */}
      <g transform="translate(50 70)">
        <text
          className="text-black/40 dark:text-white/45"
          fill="currentColor"
          fontSize="10"
          fontFamily="monospace"
        >
          <tspan fill="#ff3621" opacity="0.7">
            $
          </tspan>
          <tspan dx="6">cd ~/projects</tspan>
        </text>
      </g>

      {/* Line 2: cursor (or code .) to open agent */}
      <g transform="translate(50 96)">
        <text
          className="text-black/40 dark:text-white/45"
          fill="currentColor"
          fontSize="10"
          fontFamily="monospace"
        >
          <tspan fill="#ff3621" opacity="0.7">
            $
          </tspan>
          <tspan dx="6">cursor .</tspan>
        </text>
      </g>

      {/* Divider line */}
      <line
        x1="50"
        y1="116"
        x2="350"
        y2="116"
        className="text-black/8 dark:text-white/8"
        stroke="currentColor"
        strokeWidth="1"
      />

      {/* Agent chat area label */}
      <text
        x="50"
        y="138"
        className="text-black/25 dark:text-white/25"
        fill="currentColor"
        fontSize="8"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        AGENT CHAT
      </text>

      {/* Ghost text: paste the prompt */}
      <rect
        x="50"
        y="150"
        width="300"
        height="60"
        rx="8"
        className="text-black/[0.04] dark:text-white/[0.04]"
        fill="currentColor"
      />
      <rect
        x="50"
        y="150"
        width="300"
        height="60"
        rx="8"
        className="text-black/10 dark:text-white/10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text
        x="200"
        y="177"
        textAnchor="middle"
        className="text-black/25 dark:text-white/25"
        fill="currentColor"
        fontSize="10"
        fontFamily="monospace"
      >
        Paste the copied prompt here...
      </text>
      <rect
        x="298"
        y="166"
        width="8"
        height="14"
        rx="1.5"
        fill="#ff3621"
        opacity="0.5"
      />
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
        <path d="M80 142 C 140 74, 180 74, 200 94" strokeLinecap="round" />
        <path d="M320 142 C 260 74, 220 74, 200 94" strokeLinecap="round" />
      </g>

      <g transform="translate(40 114)">
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
        <ellipse cx="48" cy="52" rx="28" ry="8" fill="#ff3621" />
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

      <g transform="translate(152 76)">
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

      <g transform="translate(264 114)">
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

function CopyPromptButton(): ReactNode {
  const [copyState, setCopyState] = useState<
    "idle" | "copying" | "copied" | "error"
  >("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopy = useCallback(async () => {
    setCopyState("copying");
    try {
      const response = await fetch(getBootstrapPromptApiPath());
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const text = await response.text();
      if (!text.trim()) throw new Error("Empty prompt");

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.append(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopyState("copied");
      track("copy_bootstrap_prompt", { source: "wizard" });
    } catch {
      setCopyState("error");
    } finally {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2500);
    }
  }, []);

  return (
    <Button
      className="mt-5 h-10 rounded-full px-5 text-sm font-medium shadow-[0_8px_24px_-8px_rgba(255,54,33,0.5)] transition-transform hover:-translate-y-0.5"
      onClick={handleCopy}
      disabled={copyState === "copying"}
    >
      {copyState === "copying" ? (
        <span className="inline-flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Copying…
        </span>
      ) : copyState === "copied" ? (
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4" />
          Copied — now paste into your agent
        </span>
      ) : copyState === "error" ? (
        "Failed to copy — try again"
      ) : (
        <span className="inline-flex items-center gap-2">
          <Clipboard className="h-4 w-4" />
          Copy prompt for your agent
        </span>
      )}
    </Button>
  );
}

const steps: WizardStep[] = [
  {
    number: "01",
    eyebrow: "Copy",
    title: "Copy the prompt",
    description:
      "One click copies everything your coding agent needs to build and deploy on Databricks.",
    visual: <ClipboardVisual />,
    action: <CopyPromptButton />,
  },
  {
    number: "02",
    eyebrow: "Paste",
    title: "Paste it into your coding agent",
    description:
      "Navigate to your projects folder (e.g. ~/projects), open your coding agent, and paste the prompt. It creates a new directory for your app and sets everything up inside it.",
    visual: <ChatVisual />,
  },
  {
    number: "03",
    eyebrow: "Build",
    title: "Your agent scaffolds, wires, and iterates",
    description:
      "Your agent scaffolds the app, provisions whatever it needs, and iterates on the UI — all guided by your answers.",
    visual: <BuildVisual />,
  },
  {
    number: "04",
    eyebrow: "Ship",
    title: "Deploy to your workspace",
    description:
      "Once you're ready, just tell your agent to deploy — it ships your app to Databricks Apps. You get a live URL under your workspace, with data governance and authentication built in.",
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
        {step.action}
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
            How the prompt works
          </p>
          <h2 className="text-3xl leading-[1.1] font-medium tracking-tight text-black md:text-5xl dark:text-white">
            Copy. Paste. Build.{" "}
            <span className="text-db-lava">Ship to Databricks.</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-black/60 md:text-lg dark:text-white/60">
            Four steps from an empty folder to a live Databricks app.
            Here&apos;s what the prompt does when you paste it into your coding
            agent.
          </p>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-16 md:gap-24">
          {steps.map((step, index) => (
            <StepRow key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
