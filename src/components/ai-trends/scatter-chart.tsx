"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, type ChartConfiguration } from "chart.js";

import {
  applyChartDefaults,
  ChartDataLabels,
} from "@/lib/ai-trends/chart-setup";
import type { FamilyOption, QualityAxis } from "@/lib/ai-trends/compute";
import {
  placeLabels,
  type LabelPlacement,
} from "@/lib/ai-trends/label-placement";
import type { BenchmarkModel } from "@/lib/ai-trends/schema";
import { useChart } from "@/lib/ai-trends/use-chart";
import { useIsNarrow } from "@/lib/ai-trends/use-narrow";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";

import { FamilyFilter } from "./family-filter";
import {
  computeCostRange,
  costXScale,
  qualityYScale,
  SCATTER_POINT_STYLES,
  type DatalabelsCtx,
} from "./scatter-scale-utils";

const POINT_RADIUS = 4.5;
const FRONTIER_POINT_RADIUS = 6;
const LABEL_FONT_SIZE = 10.5;
const LABEL_OFFSET = 10;
const LABEL_PADDING = 2;
// Extra room around each label so near-touching labels aren't hidden as overlaps.
const LABEL_GAP = 6;
const LEADER_COLOR = "rgba(11,32,38,0.35)";
const FRONTIER_COLOR = "#ff3621";
/** Provider logo drawn inside each frontier label, left of the name. */
const LOGO_SIZE = 12;
const LOGO_GAP = 4;
const LOGO_ROOM = LOGO_SIZE + LOGO_GAP;

type ScatterPoint = {
  x: number;
  y: number;
  label: string;
  frontier: boolean;
  harness: string;
  logo?: string;
  place?: LabelPlacement;
};

/** The bits of chartjs-plugin-datalabels' per-element state the logos read. */
type DatalabelsElement = {
  $datalabels?: {
    $layout?: {
      _visible: boolean;
      _box: { _rect: { x: number; y: number; w: number; h: number } };
    };
  }[];
};

type HoveredModel = {
  name: string;
  harness: string;
  cost: number;
  quality: number;
  frontier: boolean;
  canvasX: number;
  canvasY: number;
};

type OverlayItem = {
  el: HTMLButtonElement;
  di: number;
  pi: number;
  model: string;
};

export function ScatterChart({
  models,
  paretoNames,
  axis,
  families,
  selectedFamilies,
  onSelectedFamiliesChange,
}: {
  models: BenchmarkModel[];
  paretoNames: string[];
  axis: QualityAxis;
  families: FamilyOption[];
  selectedFamilies: string[];
  onSelectedFamiliesChange: (selected: string[]) => void;
}) {
  const [hovered, setHovered] = useState<HoveredModel | null>(null);
  const narrow = useIsNarrow();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<OverlayItem[]>([]);

  const { xMin, xMax } = computeCostRange(models);

  const { canvasRef, chartRef } = useChart<"scatter">(() => {
    applyChartDefaults();

    if (overlayRef.current) overlayRef.current.innerHTML = "";
    circlesRef.current = [];

    const paretoSet = new Set(paretoNames);

    const vendorMap = new Map<string, { color: string; pts: ScatterPoint[] }>();
    models.forEach((m) => {
      if (!vendorMap.has(m.vendor)) {
        vendorMap.set(m.vendor, { color: m.color, pts: [] });
      }
      vendorMap.get(m.vendor)!.pts.push({
        x: m.cost,
        y: m.quality,
        label: m.name,
        frontier: paretoSet.has(m.name),
        harness: m.harness,
        logo: getVendorLogo(m.vendor),
      });
    });

    const datasets: object[] = [];
    const isFrontier = (ctx: { raw: unknown }) =>
      (ctx.raw as ScatterPoint).frontier;
    vendorMap.forEach(({ color, pts }, vendor) => {
      datasets.push({
        label: vendor,
        type: "scatter",
        backgroundColor: (ctx: { raw: unknown }) =>
          isFrontier(ctx) ? color : `${color}8C`,
        ...SCATTER_POINT_STYLES,
        pointRadius: (ctx: { raw: unknown }) =>
          isFrontier(ctx) ? FRONTIER_POINT_RADIUS : POINT_RADIUS,
        pointHoverRadius: (ctx: { raw: unknown }) =>
          (isFrontier(ctx) ? FRONTIER_POINT_RADIUS : POINT_RADIUS) + 2,
        data: pts,
        datalabels: {
          // Only frontier points carry a label; the rest show on hover.
          display: (ctx: DatalabelsCtx) => {
            const pt = ctx.dataset.data[ctx.dataIndex] as ScatterPoint;
            return !narrow && pt.frontier && !pt.place?.hidden;
          },
          color: "#0b2026",
          font: { size: LABEL_FONT_SIZE, weight: "500" },
          formatter: (v: unknown) => (v as ScatterPoint).label,
          align: (ctx: DatalabelsCtx) =>
            (ctx.dataset.data[ctx.dataIndex] as ScatterPoint).place?.angle ??
            -90,
          offset: (ctx: DatalabelsCtx) =>
            (ctx.dataset.data[ctx.dataIndex] as ScatterPoint).place?.offset ??
            LABEL_OFFSET,
          clamp: true,
          padding: (ctx: DatalabelsCtx) => ({
            top: LABEL_PADDING,
            bottom: LABEL_PADDING,
            right: LABEL_PADDING,
            left:
              LABEL_PADDING +
              ((ctx.dataset.data[ctx.dataIndex] as ScatterPoint).logo
                ? LOGO_ROOM
                : 0),
          }),
          backgroundColor: "rgba(255,255,255,0.9)",
        },
      });
    });

    const frontierPts = models
      .filter((m) => paretoSet.has(m.name))
      .sort((a, b) => a.cost - b.cost)
      .map((m) => ({ x: m.cost, y: m.quality }));
    // Past the best model nothing improves, so the frontier runs flat to the edge.
    const best = frontierPts.at(-1);
    if (best) frontierPts.push({ x: xMax, y: best.y });

    datasets.push({
      label: "Pareto frontier",
      type: "line",
      // Highest order draws first, so the line sits beneath every point.
      order: 1,
      data: frontierPts,
      borderColor: FRONTIER_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      showLine: true,
      datalabels: { display: false },
    });

    // Before labels are laid out, give each frontier label a side where it fits.
    const labelPlacementPlugin = {
      id: "labelPlacement",
      afterLayout(chart: Chart) {
        if (narrow) return;
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.font = `500 ${LABEL_FONT_SIZE}px ${Chart.defaults.font.family}`;
        const points = chart.data.datasets.flatMap((ds, di) =>
          ds.label === "Pareto frontier" || !chart.isDatasetVisible(di)
            ? []
            : (ds.data as ScatterPoint[]).filter((pt) => pt.frontier),
        );
        const placements = placeLabels(
          points.map((pt) => ({
            x: scales.x.getPixelForValue(pt.x),
            y: scales.y.getPixelForValue(pt.y),
            width:
              ctx.measureText(pt.label).width +
              LABEL_PADDING * 2 +
              LABEL_GAP +
              // Datalabels keeps the text centred and grows the box leftwards,
              // so reserve the logo's room on both sides.
              (pt.logo ? LOGO_ROOM * 2 : 0),
            height: LABEL_FONT_SIZE * 1.2 + LABEL_PADDING * 2 + LABEL_GAP,
            marker: FRONTIER_POINT_RADIUS * 2,
            priority: (pt.frontier ? 1000 : 0) + pt.y,
            required: pt.frontier,
          })),
          chartArea,
          LABEL_OFFSET,
        );
        ctx.restore();
        points.forEach((pt, i) => {
          pt.place = placements[i];
        });
      },
    };

    const leaderLinePlugin = {
      id: "leaderLines",
      afterDatasetDraw(chart: Chart, args: { index: number }) {
        if (chart.data.datasets[args.index]?.label !== "Pareto frontier")
          return;
        const { ctx } = chart;
        ctx.save();
        // Leader lines run from a pushed-out label to its point, under the points.
        ctx.strokeStyle = LEADER_COLOR;
        ctx.lineWidth = 1;
        chart.data.datasets.forEach((ds, di) => {
          if (ds.label === "Pareto frontier" || !chart.isDatasetVisible(di))
            return;
          chart.getDatasetMeta(di).data.forEach((el, pi) => {
            const { place } = ds.data[pi] as ScatterPoint;
            if (narrow || !place?.leader || place.hidden || !place.box) return;
            const { left, right, top, bottom } = place.box;
            ctx.beginPath();
            ctx.moveTo(el.x, el.y);
            ctx.lineTo(
              Math.min(Math.max(el.x, left), right),
              Math.min(Math.max(el.y, top), bottom),
            );
            ctx.stroke();
          });
        });
        ctx.restore();
      },
    };

    const logoImages = new Map<string, HTMLImageElement>();
    const labelLogoPlugin = {
      id: "labelLogos",
      afterDatasetsDraw(chart: Chart) {
        if (narrow) return;
        const { ctx } = chart;
        ctx.save();
        chart.data.datasets.forEach((ds, di) => {
          if (ds.label === "Pareto frontier" || !chart.isDatasetVisible(di))
            return;
          const elements = chart.getDatasetMeta(di).data;
          (ds.data as ScatterPoint[]).forEach((pt, pi) => {
            const { logo } = pt;
            if (!pt.frontier || !logo) return;
            // The label's drawn frame, as chartjs-plugin-datalabels laid it out.
            const layout = (elements[pi] as unknown as DatalabelsElement)
              .$datalabels?.[0]?.$layout;
            if (!layout?._visible) return;
            let img = logoImages.get(logo);
            if (!img) {
              img = new Image(LOGO_SIZE, LOGO_SIZE);
              img.onload = () => chart.draw();
              img.src = logo;
              logoImages.set(logo, img);
            }
            if (!img.complete) return;
            const frame = layout._box._rect;
            ctx.drawImage(
              img,
              frame.x + LABEL_PADDING,
              frame.y + (frame.h - LOGO_SIZE) / 2,
              LOGO_SIZE,
              LOGO_SIZE,
            );
          });
        });
        ctx.restore();
      },
    };

    const overlayPlugin = {
      id: "scatterOverlay",
      afterRender(chart: Chart) {
        const overlay = overlayRef.current;

        if (overlay && circlesRef.current.length === 0) {
          chart.data.datasets.forEach((ds, di) => {
            if (ds.label === "Pareto frontier") return;
            (ds.data as ScatterPoint[]).forEach((pt, pi) => {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.style.cssText =
                "position:absolute;width:18px;height:18px;border-radius:50%;" +
                "cursor:pointer;transform:translate(-50%,-50%);" +
                "background:transparent;border:none;padding:0;pointer-events:auto;";
              btn.setAttribute(
                "aria-label",
                `${ds.label}: ${pt.label}, cost $${pt.x.toFixed(2)}, quality ${pt.y}%`,
              );
              const baseName = pt.label.split(" (")[0];

              const showTip = () => {
                const meta = chart.getDatasetMeta(di);
                const el = meta.data[pi];
                if (!el) return;
                setHovered({
                  name: pt.label,
                  harness: pt.harness,
                  cost: pt.x,
                  quality: pt.y,
                  frontier: pt.frontier,
                  canvasX: el.x,
                  canvasY: el.y,
                });
                if (announceRef.current) {
                  announceRef.current.textContent = `${pt.label}, $${pt.x.toFixed(2)}, ${pt.y}%`;
                }
                circlesRef.current.forEach((item) => {
                  item.el.style.opacity =
                    item.model === baseName ? "1" : "0.15";
                });
              };

              const hideTip = () => {
                setHovered(null);
                circlesRef.current.forEach((item) => {
                  item.el.style.opacity = "";
                });
              };

              btn.addEventListener("mouseenter", showTip);
              btn.addEventListener("mouseleave", hideTip);
              btn.addEventListener("focus", showTip);
              btn.addEventListener("click", showTip);
              btn.addEventListener("blur", hideTip);
              btn.addEventListener("keydown", (e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const dir = e.key === "ArrowRight" ? 1 : -1;
                const circles = circlesRef.current;
                const idx = circles.findIndex((x) => x.el === btn);
                let nextIdx = (idx + dir + circles.length) % circles.length;
                for (let i = 0; i < circles.length; i++) {
                  if (circles[nextIdx].el.style.display !== "none") break;
                  nextIdx = (nextIdx + dir + circles.length) % circles.length;
                }
                circles[nextIdx].el.focus();
              });

              overlay.appendChild(btn);
              circlesRef.current.push({ el: btn, di, pi, model: baseName });
            });
          });
        }

        circlesRef.current.forEach(({ el, di, pi }) => {
          const visible = chart.isDatasetVisible(di);
          if (!visible) {
            el.style.display = "none";
            return;
          }
          const meta = chart.getDatasetMeta(di);
          const point = meta.data[pi];
          if (!point) {
            el.style.display = "none";
            return;
          }
          el.style.display = "";
          el.style.left = `${point.x}px`;
          el.style.top = `${point.y}px`;
        });
      },
    };

    return {
      type: "scatter" as const,
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false },
        },
        scales: {
          x: costXScale(xMin, xMax),
          y: qualityYScale(axis, "Quality"),
        },
      },
      plugins: [
        labelPlacementPlugin,
        ChartDataLabels,
        labelLogoPlugin,
        leaderLinePlugin,
        overlayPlugin,
      ],
    } as unknown as ChartConfiguration<"scatter">;
  }, [models, paretoNames, axis, narrow]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets.forEach((ds, i) => {
      if (ds.label === "Pareto frontier") return;
      chart.setDatasetVisibility(
        i,
        selectedFamilies.length === 0 ||
          selectedFamilies.includes(String(ds.label)),
      );
    });
    chart.update();
  }, [selectedFamilies, chartRef, narrow]);

  let tooltipLeft = 0;
  let tooltipTop = 0;
  if (hovered && wrapperRef.current) {
    const tooltipWidth = 200;
    tooltipLeft = Math.min(
      Math.max(hovered.canvasX - tooltipWidth / 2, 4),
      wrapperRef.current.offsetWidth - tooltipWidth - 4,
    );
    tooltipTop =
      hovered.canvasY - 112 >= 4 ? hovered.canvasY - 112 : hovered.canvasY + 12;
  }

  return (
    <div className="flex flex-col gap-3">
      <FamilyFilter
        families={families}
        selected={selectedFamilies}
        onChange={onSelectedFamiliesChange}
        label="Model family"
      />
      <div
        ref={wrapperRef}
        className="relative h-[420px]"
        onClick={(e) => {
          if (e.target instanceof HTMLButtonElement) return;
          setHovered(null);
          circlesRef.current.forEach((item) => {
            item.el.style.opacity = "";
          });
        }}
      >
        <canvas
          id="scatterChart"
          ref={canvasRef}
          className="block h-full w-full"
        />
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0"
        />
        {hovered && (
          <div
            role="tooltip"
            style={{ left: tooltipLeft, top: tooltipTop, width: 200 }}
            className="pointer-events-none absolute z-10 bg-black px-3 py-2.5 text-xs/normal text-white"
          >
            <div className="font-semibold">{hovered.name}</div>
            <div>Harness: {hovered.harness}</div>
            <div>Cost/task: ${hovered.cost.toFixed(2)}</div>
            <div>Quality: {hovered.quality}%</div>
            {hovered.frontier && (
              <div className="text-orange">On the frontier</div>
            )}
          </div>
        )}
        <div
          ref={announceRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </div>
  );
}
