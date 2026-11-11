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

/** Logo markers are drawn at this size; hit testing uses half of it as radius. */
const LOGO_SIZE = 24;
const NARROW_LOGO_SIZE = 18;
const LABEL_FONT_SIZE = 9.5;
const LABEL_OFFSET = 10;
const LABEL_PADDING = 2;
// Extra room around each label so near-touching labels aren't hidden as overlaps.
const LABEL_GAP = 6;
const LEADER_COLOR = "rgba(68,68,68,0.45)";

type ScatterPoint = {
  x: number;
  y: number;
  label: string;
  frontier: boolean;
  harness: string;
  place?: LabelPlacement;
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
  const logoSize = narrow ? NARROW_LOGO_SIZE : LOGO_SIZE;

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
      });
    });

    const datasets: object[] = [];
    vendorMap.forEach(({ color, pts }, vendor) => {
      const logoSrc = getVendorLogo(vendor);
      let logo: HTMLImageElement | undefined;
      if (logoSrc) {
        logo = new Image(logoSize, logoSize);
        // Redraw once the logo has loaded; until then the point is invisible.
        logo.onload = () => chartRef.current?.draw();
        logo.src = logoSrc;
      }
      datasets.push({
        label: vendor,
        type: "scatter",
        backgroundColor: (ctx: { raw: unknown }) => {
          const pt = ctx.raw as ScatterPoint;
          return pt.frontier ? color : `${color}BB`;
        },
        ...SCATTER_POINT_STYLES,
        ...(logo
          ? {
              pointStyle: logo,
              pointRadius: logoSize / 2,
              pointHoverRadius: logoSize / 2,
            }
          : {}),
        data: pts,
        datalabels: {
          display: (ctx: DatalabelsCtx) => {
            const pt = ctx.dataset.data[ctx.dataIndex] as ScatterPoint;
            if (narrow || pt.place?.hidden) return false;
            return pt.frontier ? true : "auto";
          },
          color: "#444",
          font: { size: LABEL_FONT_SIZE, weight: "500" },
          formatter: (v: unknown) => (v as ScatterPoint).label,
          align: (ctx: DatalabelsCtx) =>
            (ctx.dataset.data[ctx.dataIndex] as ScatterPoint).place?.angle ??
            -90,
          offset: (ctx: DatalabelsCtx) =>
            (ctx.dataset.data[ctx.dataIndex] as ScatterPoint).place?.offset ??
            LABEL_OFFSET,
          clamp: true,
          padding: LABEL_PADDING,
          backgroundColor: "rgba(255,255,255,0.88)",
          borderRadius: 3,
        },
      });
    });

    const frontierPts = models
      .filter((m) => paretoSet.has(m.name))
      .sort((a, b) => a.cost - b.cost)
      .map((m) => ({ x: m.cost, y: m.quality }));

    datasets.push({
      label: "Pareto frontier",
      type: "line",
      // Highest order draws first, so the line sits beneath every logo.
      order: 1,
      data: frontierPts,
      borderColor: "#171715",
      borderDash: [9, 5],
      borderWidth: 2.5,
      pointRadius: 0,
      backgroundColor: "transparent",
      showLine: true,
      datalabels: { display: false },
    });

    // Logos are line art with transparent gaps; a white disc behind each one
    // keeps the frontier line from showing through, so every logo reads as
    // sitting on top of the line.
    // Before labels are laid out, give each one a side where it fits.
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
            : (ds.data as ScatterPoint[]),
        );
        const placements = placeLabels(
          points.map((pt) => ({
            x: scales.x.getPixelForValue(pt.x),
            y: scales.y.getPixelForValue(pt.y),
            width:
              ctx.measureText(pt.label).width + LABEL_PADDING * 2 + LABEL_GAP,
            height: LABEL_FONT_SIZE * 1.2 + LABEL_PADDING * 2 + LABEL_GAP,
            marker: logoSize,
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

    const logoBackdropPlugin = {
      id: "logoBackdrop",
      afterDatasetDraw(chart: Chart, args: { index: number }) {
        if (chart.data.datasets[args.index]?.label !== "Pareto frontier")
          return;
        const { ctx } = chart;
        ctx.save();
        // Leader lines run from a pushed-out label to its logo, under the logos.
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
        ctx.fillStyle = "#ffffff";
        chart.data.datasets.forEach((ds, di) => {
          if (ds.label === "Pareto frontier" || !chart.isDatasetVisible(di))
            return;
          chart.getDatasetMeta(di).data.forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, logoSize / 2 + 1, 0, Math.PI * 2);
            ctx.fill();
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
        logoBackdropPlugin,
        overlayPlugin,
      ],
    } as unknown as ChartConfiguration<"scatter">;
  }, [models, paretoNames, axis, narrow, logoSize]);

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
            className="pointer-events-none absolute z-10 rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white shadow-lg"
          >
            <div className="font-semibold">{hovered.name}</div>
            <div>Harness: {hovered.harness}</div>
            <div>Cost/task: ${hovered.cost.toFixed(2)}</div>
            <div>Quality: {hovered.quality}%</div>
            {hovered.frontier && <div>&#9733; Pareto frontier</div>}
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
