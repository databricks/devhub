## Databricks Local Bootstrap

Prepare a local Databricks app workspace: install CLI, authenticate, scaffold, and install Databricks agent skills.

### 1. Verify Databricks CLI version

Use Databricks CLI 0.292+ before running setup and app scaffolding commands.

```bash
databricks --version
```

### 2. Install or upgrade Databricks CLI (if needed)

If the Databricks CLI is not installed or below `0.292`, install it using the appropriate method for your OS.

#### macOS

**Homebrew (recommended)**

```bash
brew tap databricks/tap
brew install databricks
```

**curl installer (fallback)**

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

If `/usr/local/bin` is not writable, rerun with `sudo`. If macOS blocks the binary (Gatekeeper), follow Apple's "open app from unidentified developer" flow.

#### Linux

**Homebrew (recommended, if available)**

```bash
brew tap databricks/tap
brew install databricks
```

**curl installer**

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

If `/usr/local/bin` is not writable, rerun with `sudo`.

**Manual install to user directory (when sudo is unavailable)**

```bash
mkdir -p ~/.local/bin
cd ~/.local/bin
ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/')
URL=$(curl -s https://api.github.com/repos/databricks/cli/releases/latest \
  | grep "browser_download_url.*linux.*${ARCH}" \
  | head -1 | cut -d '"' -f 4)
curl -L "$URL" -o databricks.tar.gz
tar -xzf databricks.tar.gz
rm databricks.tar.gz
chmod +x databricks
export PATH="$HOME/.local/bin:$PATH"
```

Add `export PATH="$HOME/.local/bin:$PATH"` to `~/.bashrc` or `~/.zshrc` for persistence. This method works in containers and sandboxed IDEs without sudo.

#### Windows

**WinGet (recommended)**

```bash
winget search databricks
winget install Databricks.DatabricksCLI
```

Restart your terminal session after installation.

**Chocolatey (experimental)**

```bash
choco install databricks-cli
```

**curl installer (via WSL)**

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

Requires WSL with `unzip` installed. Outside WSL, run as Administrator (installs to `C:\Windows\databricks.exe`).

#### Verify installation

```bash
databricks -v
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

Use `--version latest` to get the latest AppKit template with all available plugins (lakebase, genie, analytics). Add `--features` to enable specific plugins.

```bash
databricks apps init \
  --name <app-name> \
  --description "<desc>" \
  --version latest \
  --run none \
  --profile <PROFILE>
```

### 6. Install Databricks agent skills

`--all` installs all skills to all detected agents with confirmation skipped.

```bash
npx skills add databricks/databricks-agent-skills --all
```

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

#### References

- [Databricks CLI install](https://docs.databricks.com/en/dev-tools/cli/install)
- [Databricks CLI authentication](https://docs.databricks.com/en/dev-tools/cli/authentication.html)
