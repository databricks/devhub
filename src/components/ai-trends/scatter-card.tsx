"use client";

import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { renderCanvasImage } from "@/lib/ai-trends/share-image";

import { ChartCard } from "./chart-card";
import { ScatterChart } from "./scatter-chart";

const CANVAS_ID = "scatterChart";

type ScatterCardProps = Omit<
  ComponentProps<typeof ScatterChart>,
  "selectedFamilies" | "onSelectedFamiliesChange"
> & { title: string; updated: string; note?: string };

/**
 * The scatter card owns the family filter so "Copy image" can copy the
 * filtered chart; the server-rendered share card always shows every family.
 */
export function ScatterCard({
  title,
  updated,
  note,
  ...chart
}: ScatterCardProps): ReactNode {
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const selectedLabels = chart.families
    .map(({ label }) => label)
    .filter((label) => selectedFamilies.includes(label));

  function getFilteredImage(): Promise<Blob> {
    const canvas = document.getElementById(CANVAS_ID);
    if (!(canvas instanceof HTMLCanvasElement)) {
      return Promise.reject(new Error(`No #${CANVAS_ID} canvas`));
    }
    return renderCanvasImage(canvas, `${title}: ${selectedLabels.join(", ")}`);
  }

  return (
    <ChartCard
      title={title}
      updated={updated}
      note={note}
      shareSlug="scatter"
      getShareImage={selectedLabels.length > 0 ? getFilteredImage : undefined}
    >
      <ScatterChart
        {...chart}
        selectedFamilies={selectedFamilies}
        onSelectedFamiliesChange={setSelectedFamilies}
      />
    </ChartCard>
  );
}
