"use client";

import { useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { ChartCard } from "./chart-card";
import { ScatterChart } from "./scatter-chart";
import type { ScatterChartHandle } from "./scatter-chart";

type ScatterCardProps = Omit<
  ComponentProps<typeof ScatterChart>,
  "ref" | "selectedFamilies" | "onSelectedFamiliesChange"
> & { title: string; heading: string; note?: string; shareVersion: string };

/**
 * The scatter card owns the family filter so "Copy image" can copy the
 * filtered chart; the server-rendered share card always shows every family.
 */
export function ScatterCard({
  title,
  heading,
  note,
  shareVersion,
  ...chart
}: ScatterCardProps): ReactNode {
  const scatterRef = useRef<ScatterChartHandle>(null);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const selectedLabels = chart.families
    .map(({ label }) => label)
    .filter((label) => selectedFamilies.includes(label));
  const isFiltered =
    selectedLabels.length > 0 && selectedLabels.length < chart.families.length;

  function getFilteredImage(): Promise<Blob> {
    return (
      scatterRef.current?.renderFilteredImage(
        `${title}: ${selectedLabels.join(", ")}`,
      ) ?? Promise.reject(new Error("Scatter chart is not ready"))
    );
  }

  return (
    <ChartCard
      title={heading}
      shareTitle={title}
      note={note}
      shareSlug="scatter"
      shareVersion={shareVersion}
      getShareImage={isFiltered ? getFilteredImage : undefined}
    >
      <ScatterChart
        {...chart}
        ref={scatterRef}
        selectedFamilies={selectedFamilies}
        onSelectedFamiliesChange={setSelectedFamilies}
      />
    </ChartCard>
  );
}
