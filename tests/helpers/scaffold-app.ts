import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function run(
  command: string,
  options?: { cwd?: string; timeoutMs?: number },
): string {
  const result = execSync(command, {
    encoding: "utf-8",
    timeout: options?.timeoutMs ?? 30_000,
    cwd: options?.cwd,
    stdio: "pipe",
  });
  return result.trim();
}

export function cli(
  command: string,
  profile: string,
  options?: { cwd?: string; timeoutMs?: number },
): string {
  return run(`databricks ${command} --profile ${profile}`, options);
}

export function cliJson<T = unknown>(
  command: string,
  profile: string,
  options?: { cwd?: string; timeoutMs?: number },
): T {
  return JSON.parse(cli(`${command} -o json`, profile, options)) as T;
}

export function scaffoldApp(options: {
  name: string;
  outputDir: string;
  profile: string;
  features?: string;
  setFlags?: string[];
}): string {
  const appDir = resolve(options.outputDir, options.name);
  const args = [
    "databricks apps init",
    `--name ${options.name}`,
    "--run none",
    `--output-dir ${options.outputDir}`,
    `--profile ${options.profile}`,
  ];
  if (options.features) {
    args.push(`--features=${options.features}`);
  }
  for (const flag of options.setFlags ?? []) {
    args.push(`--set ${flag}`);
  }

  run(args.join(" "), { timeoutMs: 60_000 });

  if (!existsSync(appDir)) {
    throw new Error(`Expected ${appDir} to exist after apps init`);
  }

  return appDir;
}

export function installAndBuild(appDir: string): void {
  run("npm install", { cwd: appDir, timeoutMs: 120_000 });
  run("npm run build", { cwd: appDir, timeoutMs: 120_000 });
}
