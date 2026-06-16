import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

import {
  DEFAULT_LOVED_METRICS_SETTINGS,
  LOVED_TIMELINE_LAYERS,
  formatMetricValue,
  getMetricStartValue,
  setupLovedMetricsReveal,
} from "./loved-by-developers-metrics-animation";

import "./loved-by-developers-metrics.css";

const METRIC_COLUMNS = [
  {
    title: "For developers",
    description:
      "Pick a template, run one command, and your agentic app is live - with a database, AI model access, and auth already wired up. No Kubernetes. No Terraform. No waiting on ops.",
    metrics: [
      {
        label: "improved operational accuracy",
        suffix: "%",
        target: 44,
      },
      {
        label: "in productivity gains",
        prefix: "$",
        suffix: "M+",
        target: 10,
      },
    ],
  },
  {
    title: "For developers",
    description:
      "Pick a template, run one command, and your agentic app is live - with a database, AI model access, and auth already wired up. No Kubernetes. No Terraform. No waiting on ops.",
    metrics: [
      {
        label: "accuracy of responses",
        suffix: "%",
        target: 96,
      },
      {
        label: "reduced costs via automation",
        suffix: "x",
        target: 10,
      },
    ],
  },
];

function LovedMetricValue({
  prefix,
  suffix,
  target,
}: {
  prefix?: string;
  suffix?: string;
  target: number;
}) {
  const initialText = formatMetricValue(
    getMetricStartValue(target, DEFAULT_LOVED_METRICS_SETTINGS.startValue),
    prefix,
    suffix,
  );
  const finalText = formatMetricValue(target, prefix, suffix);

  return (
    <span
      className="loved-metric-value shrink-0 font-mono text-5xl leading-[1.125] font-normal tracking-normal text-white md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-[6.25rem] 3xl:text-[7rem]"
      data-display={initialText}
      data-ghost-display=""
      data-layout-display={finalText}
      data-loved-metric-value
      data-prefix={prefix ?? ""}
      data-suffix={suffix ?? ""}
      data-target={target}
    >
      <span
        aria-hidden="true"
        className="loved-metric-underlay"
        data-loved-metric-text
      >
        {initialText}
      </span>
      <span className="loved-metric-final" data-loved-metric-text>
        {initialText}
      </span>
      {LOVED_TIMELINE_LAYERS.map((layer) => (
        <span
          aria-hidden="true"
          className={`loved-metric-layer loved-metric-layer-${layer.name}`}
          data-loved-metric-layer={layer.name}
          data-loved-metric-text
          key={layer.name}
        >
          {initialText}
        </span>
      ))}
      <span aria-hidden="true" className="loved-metric-cursor" />
    </span>
  );
}

function LovedByDevelopers({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    return setupLovedMetricsReveal({
      section,
      settings: DEFAULT_LOVED_METRICS_SETTINGS,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative loved-by-developers overflow-hidden text-white",
        className,
      )}
    >
      <div className="relative z-10 mx-auto flex flex-col px-5 pt-18 pb-14 max-w-272 xl:max-w-304 md:px-8 md:py-24 lg:py-32 xl:py-46 2xl:py-35 2xl:max-w-360 3xl:max-w-400 3xl:py-46">
        <header className="relative z-10 flex flex-col">
          <h2 className="font-heading text-5xl leading-none font-normal tracking-normal max-w-sm sm:max-w-none md:text-7xl/none lg:text-9xl/none xl:text-[10rem] 2xl:text-[12rem] 3xl:text-[13.125rem]">
            <span className="block max-w-342 text-balance">
              Built for enterprise.
            </span>
            <span className="block">
              {" "}
              <span className="text-db-lava-light lg:block lg:ml-60 2xl:ml-96 3xl:ml-122">
                Loved by
              </span>{" "}
              <span className="lg:block lg:ml-24 xl:translate-x-8 2xl:ml-52 3xl:ml-64">
                developers.
              </span>
            </span>
          </h2>
        </header>

        <ul className="relative z-10 mt-10 grid gap-10 max-w-360 md:mt-28 md:grid-cols-2 md:gap-8 lg:gap-20 lg:mt-44 xl:mt-46 xl:gap-24 3xl:gap-56">
          {METRIC_COLUMNS.map(({ title, description, metrics }, index) => (
            <li
              key={`${title}-${index}`}
              className={cn(
                "relative flex flex-col border-white/20 md:pl-8",
                index === 1 && "border-t pt-10 md:border-t-0 md:pt-0",
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 hidden h-full w-px bg-white/20 md:block"
                data-loved-metrics-line-drop
              />
              <h3 className="text-base leading-normal font-medium text-white md:text-xl/normal lg:text-2xl/normal">
                {title}
              </h3>
              <p className="mt-3 max-w-lg text-sm/normal text-white/60 md:text-base xl:text-lg/normal">
                {description}
              </p>
              <ul
                className="mt-10 grid gap-10 will-change-transform md:mt-32 xl:mt-42.5 md:gap-20"
                data-loved-metrics-list
              >
                {metrics.map(({ label, prefix, suffix, target }) => (
                  <li
                    key={`${target}-${label}`}
                    className="flex items-baseline gap-3 md:gap-4"
                  >
                    <LovedMetricValue
                      prefix={prefix}
                      suffix={suffix}
                      target={target}
                    />
                    <span className="text-xs leading-normal ml-1 text-white/60 md:max-w-66 md:text-sm lg:text-lg">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 h-30 w-61 translate-x-1/4 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] sm:hidden lg:block lg:translate-x-1/6 lg:h-60 lg:w-100 lg:right-auto lg:left-[calc(50%-4em)] xl:h-85 xl:w-140 xl:left-[calc(50%-3em)] 3xl:translate-x-8 3xl:h-94 3xl:w-170 3xl:left-1/2" />
        <div className="absolute hidden top-57 -right-1/2 h-98 w-145 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] lg:block lg:right-[calc(50%+27rem)] lg:top-100 lg:h-62 lg:w-80 xl:right-[calc(50%+31.125rem)] xl:top-130 xl:h-84 xl:w-145 2xl:top-136 3xl:h-98 3xl:right-[calc(50%+32.75rem)] 3xl:w-145 3xl:top-158" />
        <div className="absolute hidden top-66 right-1/2 h-48.5 w-45 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255)_1px,transparent_0)] bg-size-[6px_6px] lg:block lg:right-[calc(50%+20.25rem)] lg:top-100 lg:h-26 lg:w-26 xl:right-[calc(50%+22rem)] xl:top-130 xl:h-36 xl:w-36 2xl:top-136 3xl:h-45 3xl:right-[calc(50%+20.5rem)] 3xl:w-48.5 3xl:top-158" />
      </div>
    </section>
  );
}

export default LovedByDevelopers;
