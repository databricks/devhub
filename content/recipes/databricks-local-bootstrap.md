## Databricks Local App Development Bootstrap

Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.

### 1. Verify Databricks CLI version

Use Databricks CLI 0.296+ before running setup and app scaffolding commands.

```bash
databricks -v
```

### 2. Install or upgrade Databricks CLI (if needed)

If the Databricks CLI is not installed or below `0.296`, install it using the appropriate method for your OS. If installed, upgrade it to the latest version using the install method used to install it. See the [Databricks CLI](/docs/tools/databricks-cli) docs for full details.

#### macOS

**Homebrew**

```bash
brew tap databricks/tap
brew install databricks
```

#### Windows

**WinGet**

```bash
winget install Databricks.DatabricksCLI
```

Restart your terminal session after installation.

#### All Systems (macOS, Windows, Linux)

**curl installer**

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

### 3. Authenticate to your Databricks workspace

```bash
databricks auth login
```

This opens a browser window for OAuth. The user must complete authentication in the browser before the CLI returns. Always show the user the OAuth URL from the CLI output as a clickable link so they can open it in their browser.

If you already know the workspace URL, you can authenticate the user directly:

```bash
databricks auth login --host <workspace-url>
```

If the user specified a profile name, use it:

```bash
databricks auth login --host <workspace-url> --profile <PROFILE>
```

Pass `--profile <PROFILE>` on subsequent commands when using named profiles. Otherwise the DEFAULT profile is used, if set. List saved profiles:

```bash
databricks auth profiles
```

### 4. Scaffold a new Databricks app

Run this from the directory where you want the project created. The CLI creates a new folder named after `--name` inside the current directory. Use `--version latest` to get the latest AppKit template. Add `--features` to enable specific plugins (e.g., `--features=lakebase` for database persistence).

```bash
databricks apps init \
  --name <app-name> \
  --description "<desc>" \
  --version latest \
  --run none \
  --profile <PROFILE>
```

Then enter the project and install dependencies:

```bash
cd <app-name>
npm install
```

### 5. Install Databricks agent skills

Install [agent skills](/docs/tools/ai-tools/agent-skills) for detected coding agents. The CLI auto-detects installed agents and installs skills globally (`--global`, the default). Pass `--project` to scope skills to the current directory instead.

```bash
databricks experimental aitools install
```

Verify by listing installed and available skills:

```bash
databricks experimental aitools list
```

### 6. UI & UX

Use Shadcn UI components for the app's UI. Focus on making things look and feel modern, clean, and professional. Iterate on the UI and route hierarchy first before sharing the first version with the user. It must look great before we run it locally.

### 7. Local Development Workflow

Always ensure features are working locally before deploying to production.

Ask the user to confirm the installation of `agent-browser` for testing locally. Explain that agent browser is a tool for automating browser actions for local development.

If approved, run:

```bash
npm i -g agent-browser && agent-browser install
agent-browser skills get agent-browser
```

Use `agent-browser` (if approved) or otherwise verify the app is working locally before deploying to production. Also share the localhost URL with the user for testing and iterating.

### 8. Deploy your app

Deploy the scaffolded app to your Databricks workspace:

```bash
databricks apps deploy --profile <PROFILE>
```

The CLI validates, builds, uploads, and starts your app. Once deployed, it prints the app URL.

### 9. Verify deployed app

```bash
databricks apps list --profile <PROFILE>
```

### 10. Verify deployed app logs

```bash
databricks apps logs <app-name> --profile <PROFILE>
```

Open the app URL from the deploy output (or `databricks apps list`) in your browser while signed in to Databricks to verify the app is running.

From there, edit the source and redeploy to iterate.
