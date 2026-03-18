## Databricks Local Bootstrap

Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.

### 1. Verify Databricks CLI version

Use Databricks CLI 0.294+ before running setup and app scaffolding commands.

```bash
databricks -v
```

### 2. Install or upgrade Databricks CLI (if needed)

If the Databricks CLI is not installed or below `0.294`, install it using the appropriate method for your OS. If installed, upgrade it to the latest version using the install method used to install it.

Recommended installation methods below. Find all the installation methods [here](https://docs.databricks.com/aws/en/dev-tools/cli/install).

#### macOS

**Homebrew**

```bash
brew tap databricks/tap
brew install databricks
```

#### Windows

**WinGet**

```bash
winget search databricks
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
databricks auth login --host <workspace-url>
```

### 4. List and select profile

Always run workspace commands with `--profile <PROFILE>`.

```bash
databricks auth profiles
```

### 5. Scaffold a new Databricks app

Run this from the directory where you want the project created. The CLI creates a new folder named after `--name` inside the current directory. Use `--version latest` to get the latest AppKit template. Add `--features` to enable specific plugins (e.g., `--features=genie,lakebase`).

```bash
databricks apps init \
  --name <app-name> \
  --description "<desc>" \
  --version latest \
  --run none \
  --profile <PROFILE>
```

### 6. Install Databricks agent skills

Install the agent skills for the agents and editors you actively use.

```bash
npx skills add databricks/databricks-agent-skills -y -a claude-code -a cursor -a codex
```

Use `-y` for noninteractive installs and add one or more `-a <agent-name>` flags for your specific agents.

### 7. Verify installed skills

```bash
npx skills list
```

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

#### References

- [Databricks CLI install](https://docs.databricks.com/en/dev-tools/cli/install)
- [Databricks CLI authentication](https://docs.databricks.com/en/dev-tools/cli/authentication.html)
