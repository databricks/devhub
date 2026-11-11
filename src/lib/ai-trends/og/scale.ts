export function linear(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const span = domainMax - domainMin || 1;
  return (value) =>
    rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin);
}

export function logScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const scale = linear(
    Math.log10(domainMin),
    Math.log10(domainMax),
    rangeMin,
    rangeMax,
  );
  return (value) => scale(Math.log10(value));
}

export function logTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  for (
    let exp = Math.floor(Math.log10(min));
    exp <= Math.ceil(Math.log10(max));
    exp++
  ) {
    for (const mult of [1, 2, 5]) {
      const v = mult * Math.pow(10, exp);
      if (v >= min && v <= max) ticks.push(v);
    }
  }
  return ticks;
}

export function formatUsd(value: number): string {
  if (value >= 1000) return `$${Math.round(value).toLocaleString("en-US")}`;
  if (value >= 10) return `$${value.toFixed(0)}`;
  return `$${value.toFixed(2)}`;
}

export function shortName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "");
}
