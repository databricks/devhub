import { execSync } from "node:child_process";

import { getParetoNames } from "@/lib/ai-trends/compute";
import { benchmarkData } from "@/lib/ai-trends/data";

const { models, run_date } = benchmarkData;

console.log(`Config count: ${models.length}`);
console.log(`Run date: ${run_date}`);

const top3 = models
  .slice()
  .sort((a, b) => b.quality - a.quality)
  .slice(0, 3);
console.log("Top 3 by quality:");
top3.forEach((m) => {
  console.log(`  ${m.name}: ${m.quality.toFixed(1)}%`);
});

const paretoNames = getParetoNames(models);
console.log(`Pareto names: ${paretoNames.join(", ")}`);

try {
  const prev = execSync("git show HEAD:src/lib/ai-trends/data/benchmark.json", {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const prevModels: { name: string }[] = JSON.parse(prev).models;
  const prevNames = new Set(prevModels.map((m) => m.name));
  const currNames = new Set(models.map((m) => m.name));
  const added = [...currNames].filter((n) => !prevNames.has(n));
  const removed = [...prevNames].filter((n) => !currNames.has(n));
  if (added.length) console.log(`Configs added vs HEAD: ${added.join(", ")}`);
  if (removed.length)
    console.log(`Configs removed vs HEAD: ${removed.join(", ")}`);
  if (!added.length && !removed.length)
    console.log("No config changes vs HEAD.");
} catch {
  console.log("No prior HEAD:src/lib/ai-trends/data/benchmark.json to diff.");
}
