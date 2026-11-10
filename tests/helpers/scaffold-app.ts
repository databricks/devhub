import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
  packageManager?: "npm" | "pnpm";
  skipInstall?: boolean;
}): string {
  const appDir = resolve(options.outputDir, options.name);
  const args = [
    "databricks apps init",
    `--name ${options.name}`,
    `--output-dir ${options.outputDir}`,
    `--profile ${options.profile}`,
  ];
  if (options.features) {
    args.push(`--features=${options.features}`);
  }
  for (const flag of options.setFlags ?? []) {
    args.push(`--set ${flag}`);
  }
  if (options.packageManager) {
    args.push(`--package-manager ${options.packageManager}`);
  }
  // --skip-install and --run can't be combined.
  args.push(options.skipInstall ? "--skip-install" : "--run none");

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

// The scaffold's package manager; npm projects omit `packageManager`.
export function packageManagerOf(appDir: string): string {
  const { packageManager = "npm" } = JSON.parse(
    readFileSync(resolve(appDir, "package.json"), "utf-8"),
  ) as { packageManager?: string };
  return packageManager.split("@")[0];
}

// `databricks apps init` installs dependencies with the template's package
// manager, and the docs go straight to `pnpm run dev`. Install only when the
// scaffold skipped it, then build the way the docs do.
export function installAndBuild(appDir: string): void {
  const manager = packageManagerOf(appDir);
  if (!existsSync(resolve(appDir, "node_modules"))) {
    run(`${manager} install`, { cwd: appDir, timeoutMs: 120_000 });
  }
  run(`${manager} run build`, { cwd: appDir, timeoutMs: 120_000 });
}
