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

  // apps init also installs dependencies, so allow more than the default.
  run(args.join(" "), { timeoutMs: 120_000 });

  if (!existsSync(appDir)) {
    throw new Error(`Expected ${appDir} to exist after apps init`);
  }

  // Some workspaces require Databricks Apps to be backed by a git repo, so
  // `apps deploy` fails to create the app otherwise. A local repo with no remote
  // satisfies the requirement, and `databricks apps init` does not create one.
  run(
    "git init -q && git add -A && git -c user.email=devhub-test@example.com " +
      '-c user.name=devhub-test commit -q -m "scaffold"',
    { cwd: appDir },
  );

  return appDir;
}

// `databricks apps init` installs dependencies with the template's package
// manager (pnpm for the default AppKit template), and the docs go straight to
// `npm run`. Running `npm install` over a pnpm-installed node_modules crashes
// npm, so only install when the scaffold skipped it.
export function installAndBuild(appDir: string): void {
  if (!existsSync(resolve(appDir, "node_modules"))) {
    run("npm install", { cwd: appDir, timeoutMs: 120_000 });
  }
  run("npm run build", { cwd: appDir, timeoutMs: 120_000 });
}
