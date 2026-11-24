"use client";

import { useState } from "react";
import type { RefObject } from "react";
import type { Chart } from "chart.js";

function fade(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? `${color}33` : color;
}

/**
 * Legend-driven focus for a chart: hovering or pinning a series fades the
 * others on the canvas. `series` runs in dataset order; `stroke` also fades
 * the line color, for area charts.
 */
export function useSeriesHighlight<T extends "bar" | "line">(
  chartRef: RefObject<Chart<T> | null>,
  series: { label: string; color: string }[],
  stroke: boolean,
) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const highlighted = hovered ?? pinned;

  function colorForSeries(label: string, color: string, active = highlighted) {
    return active && label !== active ? fade(color) : color;
  }

  function apply(active: string | null) {
    const chart = chartRef.current;
    if (!chart) return;
    const datasets = chart.data.datasets as {
      backgroundColor?: string;
      borderColor?: string;
    }[];
    datasets.forEach((dataset, i) => {
      const { label, color } = series[i];
      const shade = colorForSeries(label, color, active);
      dataset.backgroundColor = shade;
      if (stroke) dataset.borderColor = shade;
    });
    chart.update("none");
  }

  return {
    colorForSeries,
    highlighted,
    pinned,
    onHover(label: string | null) {
      setHovered(label);
      apply(label ?? pinned);
    },
    onToggle(label: string) {
      const next = pinned === label ? null : label;
      setPinned(next);
      apply(hovered ?? next);
    },
  };
}
