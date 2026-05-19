## Set Up Your Local Dev Environment

Install the Databricks CLI, authenticate a profile, and verify the handshake. Every other DevHub template assumes this has already passed.

The official CLI reference for these steps is on DevHub at [Databricks CLI](/docs/tools/databricks-cli). Use it whenever a step here is unclear.

### 1. Check the installed CLI version

DevHub templates assume Databricks CLI `0.296+`. Anything older is missing the AppKit `apps init` template registry and several `experimental aitools` flags.

```bash
databricks -v
```

If the command is not found, or the version is below `0.296`, install or upgrade in the next step.

### 2. Install or upgrade the Databricks CLI

Pick the install path for your OS. If the CLI is already installed at an older version, the same commands upgrade in place.

#### macOS / Linux — Homebrew (recommended)

```bash
brew tap databricks/tap
brew install databricks

brew update && brew upgrade databricks
```

#### Windows — WinGet

```bash
winget install Databricks.DatabricksCLI

winget upgrade Databricks.DatabricksCLI
```

Restart your terminal after install.

#### Any platform — curl installer

```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
```

On Windows, run this from WSL. If `/usr/local/bin` is not writable, rerun with `sudo`. Re-running the script also upgrades an existing install.

After installing, confirm the version is `0.296+`:

```bash
databricks -v
```

### 3. Authenticate a profile

Always use OAuth for local development. Personal Access Tokens (PATs) are for CI/CD or non-interactive environments only.

Browser-based OAuth is the default for local use:

```bash
databricks auth login
```

The CLI prints a URL and waits for the user to complete OAuth in the browser. **Always show the URL to the user as a clickable link** so they can open it themselves — the CLI does not return until authentication finishes. Credentials save to `~/.databrickscfg`.

If you already know the workspace URL and want to name the profile, do it in one go:

```bash
databricks auth login --host <workspace-url> --profile <PROFILE>
```

`<PROFILE>` is the label you will pass on subsequent commands as `--profile <PROFILE>`. If you skip `--profile`, the CLI uses the `DEFAULT` profile.

For CI/CD, OAuth client credentials or a personal access token are better fits — see the [authentication section of the CLI doc](/docs/tools/databricks-cli#authenticate) for the non-interactive flows.

### 4. Verify the handshake

List the saved profiles and confirm the one you just created shows `Valid: YES`:

```bash
databricks auth profiles
```

```text
Name              Host                                           Valid
DEFAULT           https://adb-1234567890.12.azuredatabricks.net  YES
my-prod-workspace https://mycompany.cloud.databricks.com         YES
```

If the row shows `Valid: NO`, the saved token is stale. Re-run `databricks auth login --profile <NAME>` to refresh it. **Never proceed past this step if no profile is `Valid: YES`** — every downstream `databricks` command will fail with an auth error that looks like a template bug.

If the user wants a particular profile to be the default for this shell session, export it:

```bash
export DATABRICKS_CONFIG_PROFILE=<PROFILE>
```

### 5. Smoke-test the CLI against the workspace

Run a read-only API call to confirm the auth actually works (a fresh OAuth token can fail on the first real call if the user picked the wrong workspace in the browser):

```bash
databricks current-user me --profile <PROFILE>
```

A successful response prints the signed-in user's identity. A `401` or `403` here means the auth flow completed against a workspace the user cannot read — re-run `databricks auth login --profile <PROFILE>` and pick the right workspace this time.
