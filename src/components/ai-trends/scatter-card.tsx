"use client";

import { useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { getLabeledNames } from "@/lib/ai-trends/compute";
import { renderCanvasImage } from "@/lib/ai-trends/share-image";

import { ChartCard } from "./chart-card";
import { ScatterChart } from "./scatter-chart";

const CANVAS_ID = "scatterChart";

type ScatterCardProps = Omit<
  ComponentProps<typeof ScatterChart>,
  "selectedFamilies" | "onSelectedFamiliesChange" | "labeledNames"
> & {
  title: string;
  dateLabel: string;
  note?: string;
  /** The note while a family filter labels every visible point. */
  noteFiltered?: string;
  shareVersion: string;
};

/**
 * The scatter card owns the family filter so "Copy image" can copy the
 * filtered chart; the server-rendered share card always shows every family.
 */
export function ScatterCard({
  title,
  dateLabel,
  note,
  noteFiltered,
  shareVersion,
  ...chart
}: ScatterCardProps): ReactNode {
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const labeled = useMemo(
    () => getLabeledNames(chart.models, chart.paretoNames, selectedFamilies),
    [chart.models, chart.paretoNames, selectedFamilies],
  );
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
      dateLabel={dateLabel}
      note={labeled.all && noteFiltered ? noteFiltered : note}
      shareSlug="scatter"
      shareVersion={shareVersion}
      getShareImage={selectedLabels.length > 0 ? getFilteredImage : undefined}
    >
      <ScatterChart
        {...chart}
        selectedFamilies={selectedFamilies}
        onSelectedFamiliesChange={setSelectedFamilies}
        labeledNames={labeled.names}
      />
    </ChartCard>
  );
}
