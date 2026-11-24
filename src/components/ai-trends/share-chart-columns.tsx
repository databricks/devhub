import { useEffect, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { ChartArea } from "chart.js";

import type { ProviderShareLayer } from "@/lib/ai-trends/compute";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

import { CHART_TOOLTIP_SURFACE } from "./chart-tooltip";
import { ShareBreakdown } from "./share-breakdown";

export type WeekSelection = {
  index: number;
  mode: "hover" | "focus" | "pinned";
  side: "left" | "right" | "top";
};

export function ShareChartColumns({
  weeks,
  layers,
  plot,
  metricLabel,
  detailsId,
  barWidth,
  selected,
  onSelectedChange: setSelected,
  showModelColors,
  onlyProvider,
}: {
  weeks: string[];
  layers: ProviderShareLayer[];
  plot: ChartArea;
  metricLabel: string;
  detailsId: string;
  barWidth: number;
  selected: WeekSelection | null;
  onSelectedChange: Dispatch<SetStateAction<WeekSelection | null>>;
  showModelColors: boolean;
  onlyProvider: string | null;
}): ReactNode {
  const [tabIndex, setTabIndex] = useState(weeks.length - 1);
  const anchorRef = useRef({ getBoundingClientRect: () => new DOMRect() });
  const columnsRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openWeek(
    index: number,
    button: HTMLButtonElement,
    mode: WeekSelection["mode"],
  ) {
    clearTimeout(closeTimer.current);
    anchorRef.current = button;
    setSelected({
      index,
      mode,
      // Beside the bar, on the side with more of the chart behind it, so the
      // panel covers as few of the bars still ahead of the pointer as it can.
      side:
        window.innerWidth < 640
          ? "top"
          : index < weeks.length / 2
            ? "right"
            : "left",
    });
  }

  function closeAfterHover() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setSelected((current) => (current?.mode === "hover" ? null : current));
    }, 200);
  }

  return (
    <Popover
      open={selected !== null}
      onOpenChange={(open) => {
        if (!open) setSelected(null);
      }}
    >
      <div
        ref={columnsRef}
        role="group"
        aria-label={`${metricLabel} by week. Use the arrow keys to change week.`}
        className="absolute grid"
        style={{
          left: plot.left,
          top: plot.top,
          width: plot.width,
          height: plot.height,
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
        }}
      >
        {weeks.map((week, index) => (
          <button
            key={week}
            type="button"
            className="outline-db-navy mx-auto cursor-pointer outline-offset-2 transition-colors duration-150 focus-visible:outline-2 data-[dimmed=true]:bg-white/15"
            style={{ width: `${barWidth * 100}%` }}
            aria-label={`${metricLabel}, week of ${week}`}
            aria-expanded={selected?.index === index}
            aria-controls={selected?.index === index ? detailsId : undefined}
            aria-describedby={selected?.index === index ? detailsId : undefined}
            data-dimmed={selected !== null && selected.index !== index}
            tabIndex={index === tabIndex ? 0 : -1}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch" && selected?.mode !== "pinned")
                openWeek(index, event.currentTarget, "hover");
            }}
            onPointerLeave={closeAfterHover}
            onFocus={(event) => {
              setTabIndex(index);
              if (event.currentTarget.matches(":focus-visible"))
                openWeek(index, event.currentTarget, "focus");
            }}
            onClick={(event) => {
              if (selected?.index === index && selected.mode === "pinned")
                setSelected(null);
              else openWeek(index, event.currentTarget, "pinned");
            }}
            onKeyDown={(event) => {
              const direction = event.key === "ArrowLeft" ? -1 : 1;
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                return;
              event.preventDefault();
              const next = Math.max(
                0,
                Math.min(index + direction, weeks.length - 1),
              );
              columnsRef.current?.querySelectorAll("button")[next]?.focus();
            }}
          />
        ))}
      </div>
      <PopoverAnchor virtualRef={anchorRef} />
      {selected && (
        <PopoverContent
          id={detailsId}
          aria-label={`${metricLabel} breakdown for the week of ${weeks[selected.index]}`}
          side={selected.side}
          sideOffset={10}
          collisionPadding={12}
          // While it only follows the pointer the panel lets the pointer through
          // to the bars under it; pinned or focused, it can be scrolled.
          className={`${CHART_TOOLTIP_SURFACE} max-h-[min(30rem,var(--radix-popover-content-available-height))] max-w-[calc(100vw-1.5rem)] overflow-y-auto overscroll-contain p-0 ${selected.mode === "hover" ? "pointer-events-none" : ""}`}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (
              event.target instanceof Node &&
              columnsRef.current?.contains(event.target)
            )
              event.preventDefault();
          }}
          onPointerEnter={() => clearTimeout(closeTimer.current)}
          onPointerLeave={closeAfterHover}
        >
          <ShareBreakdown
            layers={layers}
            metricLabel={metricLabel}
            week={weeks[selected.index]}
            weekIndex={selected.index}
            showModelColors={showModelColors}
            onlyProvider={onlyProvider}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
