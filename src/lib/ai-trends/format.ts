export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** The Sunday that closes the Monday-to-Sunday week starting on `weekStartIso`. */
export function weekEnd(weekStartIso: string): string {
  const d = new Date(weekStartIso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** "Data through Nov 15, 2026" for weekly data whose last week starts on `weekStartIso`. */
export function formatDataThrough(weekStartIso: string): string {
  return `Data through ${formatDate(weekEnd(weekStartIso))}`;
}

/** Shown next to "Data through …" on weekly charts. */
export const WEEKS_NOTE = "Weeks run Monday–Sunday";

/** "Benchmark run Nov 8, 2026". */
export function formatBenchmarkRun(iso: string): string {
  return `Benchmark run ${formatDate(iso)}`;
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
