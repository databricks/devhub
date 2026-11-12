export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Median spend panel ticks: $0, $1.00, $2.00. */
export function formatSpendCentsTick(v: number): string {
  return v === 0 ? "$0" : "$" + v.toFixed(2);
}

/** P90 and P99 spend panel ticks: $50, $800, $1k, $1.5k. */
export function formatSpendTick(v: number): string {
  if (v < 1000) return "$" + v;
  const k = v / 1000;
  return (
    "$" + (k < 10 && !Number.isInteger(k) ? k.toFixed(1) : k.toFixed(0)) + "k"
  );
}
