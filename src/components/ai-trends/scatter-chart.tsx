"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import { Chart, type ChartConfiguration, type Plugin } from "chart.js";

import { applyChartDefaults } from "@/lib/ai-trends/chart-setup";
import type { FamilyOption, QualityAxis } from "@/lib/ai-trends/compute";
import {
  placeLabels,
  type LabelPlacement,
} from "@/lib/ai-trends/label-placement";
import type { BenchmarkModel } from "@/lib/ai-trends/schema";
import { renderCanvasImage } from "@/lib/ai-trends/share-image";
import { useChart } from "@/lib/ai-trends/use-chart";
import { useIsNarrow } from "@/lib/ai-trends/use-narrow";
import { getVendorLogo } from "@/lib/ai-trends/vendor-logos";

import { ChartPointTooltip } from "./chart-tooltip";
import { FamilyFilter } from "./family-filter";
import {
  computeCostRange,
  costXScale,
  qualityYScale,
  SCATTER_POINT_STYLES,
} from "./scatter-scale-utils";

const POINT_RADIUS = 4.5;
const FRONTIER_POINT_RADIUS = 6;
const LABEL_FONT_SIZE = 11.5;
const LABEL_LETTER_SPACING = "-0.2px";
const LABEL_OFFSET = 10;
const LABEL_PADDING = 2;
const LABEL_GAP = 4;
const LEADER_COLOR = "rgba(11,32,38,0.35)";
const FRONTIER_COLOR = "#ff3621";
const PREVIEW_DIMMED_OPACITY = 0.4;

const FRONTIER_LABEL = "Pareto frontier";
/** The provider logo is the marker; frontier models get a larger one. */
const LOGO_SIZE = 14;
const FRONTIER_LOGO_SIZE = 18;
/** White disc behind a logo, so grid lines and the frontier don't cut it. */
const LOGO_HALO = 2.5;
/** Names off the frontier are set lighter, so the frontier reads first. */
const OFF_FRONTIER_LABEL_OPACITY = 0.6;

type ScatterPoint = {
  x: number;
  y: number;
  label: string;
  displayName: string;
  frontier: boolean;
  harness: string;
  logo?: string;
  place?: LabelPlacement;
};

type HoveredModel = {
  name: string;
  provider?: string;

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

export type ScatterChartHandle = {
  renderFilteredImage: (title: string) => Promise<Blob>;
};

function setFamilyVisibility(
  chart: Chart<"scatter">,
  selectedFamilies: string[],
  previewing: boolean,
) {
  chart.data.datasets.forEach(({ label }, i) => {
    if (label === FRONTIER_LABEL) return;
    chart.setDatasetVisibility(
      i,
      previewing ||
        selectedFamilies.length === 0 ||
        selectedFamilies.includes(String(label)),
    );
  });
  chart.update("none");
}

export function ScatterChart({
  ref,
  models,
  paretoNames,
  axis,
  families,
  benchmarkDate,
  selectedFamilies,
  onSelectedFamiliesChange,
}: {
  ref: Ref<ScatterChartHandle>;
  models: BenchmarkModel[];
  paretoNames: string[];
  axis: QualityAxis;
  families: FamilyOption[];
  benchmarkDate: string;
  selectedFamilies: string[];
  onSelectedFamiliesChange: (selected: string[]) => void;
}) {
  const [hovered, setHovered] = useState<HoveredModel | null>(null);
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null);
  const previewFamiliesRef = useRef<Set<string> | null>(null);
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
    const familyOpacity = (family: string | undefined) => {
      const preview = previewFamiliesRef.current;
      return preview &&
        family &&
        family !== FRONTIER_LABEL &&
        !preview.has(family)
        ? PREVIEW_DIMMED_OPACITY
        : 1;
    };

    const vendorMap = new Map<string, { color: string; pts: ScatterPoint[] }>();
    models.forEach((m) => {
      if (!vendorMap.has(m.vendor)) {
        vendorMap.set(m.vendor, { color: m.color, pts: [] });
      }
      vendorMap.get(m.vendor)!.pts.push({
        x: m.cost,
        y: m.quality,
        label: m.name,
        // The harness stays in the tooltip; the label is the model alone.
        displayName: m.name.replace(/\s+\([^)]*\)$/, ""),
        frontier: paretoSet.has(m.name),
        harness: m.harness,
        logo: getVendorLogo(m.vendor),
      });
    });

    const datasets: object[] = [];
    const isFrontier = (ctx: { raw: unknown }) =>
      (ctx.raw as ScatterPoint).frontier;
    const markerSize = (pt: ScatterPoint) =>
      pt.logo
        ? pt.frontier
          ? FRONTIER_LOGO_SIZE
          : LOGO_SIZE
        : (pt.frontier ? FRONTIER_POINT_RADIUS : POINT_RADIUS) * 2;
    // A phone has no room for every name: only the frontier is named there,
    // the rest are read from the tooltip.
    const isLabeled = (pt: ScatterPoint) => !narrow || pt.frontier;

    vendorMap.forEach(({ color, pts }, vendor) => {
      datasets.push({
        label: vendor,
        type: "scatter",
        backgroundColor: (ctx: { raw: unknown }) =>
          isFrontier(ctx) || previewFamiliesRef.current ? color : `${color}8C`,
        ...SCATTER_POINT_STYLES,
        // A logo stands in for the dot; only providers without one keep it.
        pointRadius: (ctx: { raw: unknown }) =>
          (ctx.raw as ScatterPoint).logo
            ? 0
            : isFrontier(ctx)
              ? FRONTIER_POINT_RADIUS
              : POINT_RADIUS,
        pointHoverRadius: (ctx: { raw: unknown }) =>
          (ctx.raw as ScatterPoint).logo
            ? 0
            : (isFrontier(ctx) ? FRONTIER_POINT_RADIUS : POINT_RADIUS) + 2,
        data: pts,
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
      label: FRONTIER_LABEL,
      type: "line",
      // Highest order draws first, so the line sits beneath every point.
      order: 1,
      data: frontierPts,
      borderColor: FRONTIER_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      showLine: true,
    });

    const labelFont = `500 ${LABEL_FONT_SIZE}px ${Chart.defaults.font.family}`;
    const labelHeight = LABEL_FONT_SIZE * 1.2 + LABEL_PADDING * 2;

    const labelPlacementPlugin = {
      id: "labelPlacement",
      afterLayout(chart: Chart) {
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.font = labelFont;
        ctx.letterSpacing = LABEL_LETTER_SPACING;
        const points = chart.data.datasets.flatMap((ds, di) =>
          ds.label === FRONTIER_LABEL || !chart.isDatasetVisible(di)
            ? []
            : (ds.data as ScatterPoint[]),
        );
        const placements = placeLabels(
          points.map((pt) => ({
            x: scales.x.getPixelForValue(pt.x),
            y: scales.y.getPixelForValue(pt.y),
            // An unlabeled point takes no room but still keeps its marker clear.
            width: isLabeled(pt)
              ? ctx.measureText(pt.displayName).width +
                LABEL_PADDING * 2 +
                LABEL_GAP
              : 0,
            height: isLabeled(pt) ? labelHeight + LABEL_GAP : 0,
            marker: markerSize(pt) + LOGO_HALO * 2,
            priority: (pt.frontier ? 1000 : 0) + pt.y,
            required: true,
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

    const previewOpacityPlugin: Plugin<"scatter"> = {
      id: "familyPreviewOpacity",
      beforeDatasetDraw(chart, { index }) {
        const opacity = familyOpacity(chart.data.datasets[index]?.label);
        if (opacity === 1) return;
        chart.ctx.save();
        chart.ctx.globalAlpha *= opacity;
      },
      afterDatasetDraw(chart, { index }) {
        if (familyOpacity(chart.data.datasets[index]?.label) < 1)
          chart.ctx.restore();
      },
    };

    const leaderLinePlugin = {
      id: "leaderLines",
      afterDatasetDraw(chart: Chart, args: { index: number }) {
        if (chart.data.datasets[args.index]?.label !== FRONTIER_LABEL) return;
        const { ctx } = chart;
        ctx.save();
        // Leader lines run from a pushed-out label to its point, under the points.
        ctx.strokeStyle = LEADER_COLOR;
        ctx.lineWidth = 1;
        chart.data.datasets.forEach((ds, di) => {
          if (ds.label === FRONTIER_LABEL || !chart.isDatasetVisible(di))
            return;
          ctx.globalAlpha = familyOpacity(ds.label);
          chart.getDatasetMeta(di).data.forEach((el, pi) => {
            const point = ds.data[pi] as ScatterPoint;
            const { place } = point;
            if (!isLabeled(point)) return;
            if (!place?.leader || place.hidden || !place.box) return;
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
    const logoMarkerPlugin = {
      id: "logoMarkers",
      afterDatasetsDraw(chart: Chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = "#fff";
        // Frontier models last, so their logos sit on top of the rest.
        for (const frontier of [false, true]) {
          chart.data.datasets.forEach((ds, di) => {
            if (ds.label === FRONTIER_LABEL || !chart.isDatasetVisible(di))
              return;
            chart.getDatasetMeta(di).data.forEach((el, pi) => {
              const point = ds.data[pi] as ScatterPoint;
              if (!point.logo || point.frontier !== frontier) return;
              let img = logoImages.get(point.logo);
              if (!img) {
                img = new Image();
                img.onload = () => chart.draw();
                img.src = point.logo;
                logoImages.set(point.logo, img);
              }
              const size = markerSize(point);
              ctx.globalAlpha = familyOpacity(ds.label);
              ctx.beginPath();
              ctx.arc(el.x, el.y, size / 2 + LOGO_HALO, 0, Math.PI * 2);
              ctx.fill();
              if (!img.complete || img.naturalWidth === 0) return;

              ctx.drawImage(img, el.x - size / 2, el.y - size / 2, size, size);
            });
          });
        }
        ctx.restore();
      },
    };

    const pointLabelPlugin = {
      id: "pointLabels",
      afterDatasetsDraw(chart: Chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = labelFont;
        ctx.letterSpacing = LABEL_LETTER_SPACING;
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.75;
        ctx.lineJoin = "round";
        ctx.fillStyle = "#0b2026";
        chart.data.datasets.forEach((ds, di) => {
          if (ds.label === FRONTIER_LABEL || !chart.isDatasetVisible(di))
            return;
          ctx.globalAlpha = familyOpacity(ds.label);
          (ds.data as ScatterPoint[]).forEach((point) => {
            const { place, displayName } = point;
            if (!isLabeled(point) || place?.hidden || !place?.box) return;
            ctx.globalAlpha =
              familyOpacity(ds.label) *
              (point.frontier ? 1 : OFF_FRONTIER_LABEL_OPACITY);
            const { left, top, bottom } = place.box;
            const x = left + LABEL_GAP / 2 + LABEL_PADDING;
            const y = (top + bottom) / 2;
            ctx.strokeText(displayName, x, y);
            ctx.fillText(displayName, x, y);
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
            if (ds.label === FRONTIER_LABEL) return;
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
                  provider: ds.label,

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
                if (e.key === "Escape") hideTip();
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
        },
        scales: {
          x: costXScale(xMin, xMax),
          y: qualityYScale(axis, "Quality"),
        },
      },
      plugins: [
        labelPlacementPlugin,
        previewOpacityPlugin,
        logoMarkerPlugin,
        pointLabelPlugin,
        leaderLinePlugin,
        overlayPlugin,
      ],
    } as unknown as ChartConfiguration<"scatter">;
  }, [models, paretoNames, axis, narrow]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    previewFamiliesRef.current = hoveredFamily
      ? new Set([...selectedFamilies, hoveredFamily])
      : null;
    setFamilyVisibility(chart, selectedFamilies, hoveredFamily !== null);
  }, [
    selectedFamilies,
    hoveredFamily,
    chartRef,
    narrow,
    models,
    paretoNames,
    axis,
  ]);

  useImperativeHandle(ref, () => ({
    async renderFilteredImage(title) {
      const chart = chartRef.current;
      if (!chart) throw new Error("Scatter chart is not ready");

      const preview = previewFamiliesRef.current;
      chart.stop();
      previewFamiliesRef.current = null;
      try {
        setFamilyVisibility(chart, selectedFamilies, false);
        // Copies the pixels now, before the asynchronous PNG encoding.
        return renderCanvasImage(chart.canvas, title);
      } finally {
        if (preview) {
          previewFamiliesRef.current = preview;
          setFamilyVisibility(chart, selectedFamilies, true);
        }
      }
    },
  }));

  return (
    <div className="flex flex-col gap-3">
      <FamilyFilter
        families={families}
        selected={selectedFamilies}
        onChange={onSelectedFamiliesChange}
        onPreviewChange={setHoveredFamily}
        label="Model family"
      />
      <div
        ref={wrapperRef}
        className="relative h-[540px] min-[360px]:h-[420px]"
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
        {hovered && wrapperRef.current && (
          <ChartPointTooltip
            tooltip={{
              title: hovered.name,
              date: benchmarkDate,
              x: hovered.canvasX,
              y: hovered.canvasY,
              width: wrapperRef.current.clientWidth,
              height: wrapperRef.current.clientHeight,
              rows: [
                ...(hovered.provider
                  ? [
                      {
                        label: "Provider",
                        value: hovered.provider,
                        icon: getVendorLogo(hovered.provider),
                      },
                    ]
                  : []),
                { label: "Harness", value: hovered.harness },
                {
                  label: "Cost per task",
                  value: `$${hovered.cost.toFixed(2)}`,
                },
                { label: "Quality", value: `${hovered.quality}%` },
              ],
              note: hovered.frontier ? "On the frontier" : undefined,
            }}
          />
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
