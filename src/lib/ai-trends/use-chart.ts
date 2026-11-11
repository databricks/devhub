"use client";

import { useEffect, useRef } from "react";
import type { DependencyList, RefObject } from "react";
import { Chart } from "chart.js";
import type { ChartConfiguration, ChartType } from "chart.js";

import { applyChartDefaults } from "./chart-setup";

export function useChart<TType extends ChartType>(
  buildConfig: () => ChartConfiguration<TType>,
  deps: DependencyList,
): {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  chartRef: RefObject<Chart<TType> | null>;
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<TType> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    applyChartDefaults();
    Chart.getChart(canvas)?.destroy();
    chartRef.current = new Chart(canvas, buildConfig());

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { canvasRef, chartRef };
}
