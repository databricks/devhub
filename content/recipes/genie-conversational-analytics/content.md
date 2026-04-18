## Genie Conversational Analytics

Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the server and client plugins, declare app resources, and deploy.

:::info[Choose your path]

- **New app** — follow steps 1 → 2 → 8.
- **Adding Genie to an existing AppKit app** — follow steps 1 → 3 → 4 → 5 → 6 → 7 → 8.
  :::

### 1. Create a Genie space and set your profile

Open your Databricks workspace, navigate to **AI/BI Genie**, and create a new Genie space connected to your data tables.

List your spaces to get the `space_id`:

```bash
databricks genie list-spaces -o json --profile <PROFILE>
```

Use the `space_id` value wherever a space ID is required (scaffold `--set`, `.env`, and `databricks.yml`).

:::tip[Avoid repeating `--profile` on every command]
Add your profile to the bundle's `databricks.yml` under the target — then `bundle deploy` and `apps` commands pick it up automatically:

```yaml
targets:
  default:
    workspace:
      profile: <PROFILE>
```

This is more reliable than `export DATABRICKS_CONFIG_PROFILE` since it persists across shells and works for agents running commands in subshells.
:::

### 2. New app: scaffold with the Genie feature

If you are starting a new app, scaffold it with the Genie feature flag. This generates all server, client, resource, and environment wiring automatically.

Run this from a neutral directory (not inside another app folder) — `apps init` creates the project folder in your current working directory:

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=genie \
  --set 'genie.genie-space.id=<your-space-id>' \
  --run none
```

`--run none` skips launching the app locally after scaffolding. Use the `space_id` from step 1 for `<your-space-id>`.

**App name:** Use at most 26 characters, **lowercase letters, digits, and hyphens only** (no underscores). Example: `my-genie-app`, not `my_genie_app`.

:::warning[Fix generated `databricks.yml` before deploying]
The scaffold generates a `genie_space_name` variable and references it as `name: ${var.genie_space_name}`, but never assigns a value. `bundle deploy` will fail with _no value assigned to required variable genie_space_name_.

Your `variables:` block should look like this after the fix — only `genie_space_id`, no `genie_space_name`:

```yaml
variables:
  genie_space_id:
    description: Default Genie Space ID
```

And the `genie_space` resource block should use a hardcoded label:

```yaml
genie_space:
  name: genie-space
  space_id: ${var.genie_space_id}
  permission: CAN_RUN
```

The `name: genie-space` is an internal label used by `app.yaml` (`valueFrom: genie-space`), not the Genie space display title.
:::

Skip to step 8 to deploy.

---

### 3. Existing app: add Genie server plugin

The following steps match what `apps init --features=genie` generates. Apply them to an existing scaffolded AppKit app.

:::tip[Get the latest template code]
The code below may be outdated. To get the latest, clone `https://github.com/databricks/appkit` and look in the `template/` directory. Search for `{{if .plugins.genie}}` to find all genie-conditional files and blocks.
:::

In `server/server.ts`, add `genie` to the import and plugins array:

```typescript
import { createApp, server, genie } from "@databricks/appkit";

createApp({
  plugins: [server(), genie()],
}).catch(console.error);
```

The `genie()` plugin reads `DATABRICKS_GENIE_SPACE_ID` (the **space ID**, not the display name) from the environment and registers it under the `default` alias. To register multiple spaces, pass explicit aliases:

```typescript
genie({
  spaces: {
    sales: "<sales-space-id>",
    support: "<support-space-id>",
  },
});
```

### 4. Existing app: create the Genie page component

Create `client/src/pages/genie/GeniePage.tsx`:

```tsx
import { GenieChat } from "@databricks/appkit-ui/react";

export function GeniePage() {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Genie</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about your data using Databricks AI/BI Genie.
        </p>
      </div>
      <div className="h-[600px] border rounded-lg overflow-hidden">
        <GenieChat alias="default" />
      </div>
    </div>
  );
}
```

The `alias` prop must match a key in the server-side `spaces` configuration. When using the default single-space setup, use `"default"`.

For custom chat UIs, use the `useGenieChat` hook instead of the `GenieChat` component:

```tsx
import { useGenieChat } from "@databricks/appkit-ui/react";

function CustomGenieChat() {
  const { messages, status, sendMessage, reset } = useGenieChat({
    alias: "default",
  });
  // Build your own UI with messages, status, sendMessage, and reset
}
```

### 5. Existing app: add the route

In `client/src/App.tsx`, add the import, nav link, and route:

```tsx
import { GeniePage } from "./pages/genie/GeniePage";

// Add inside the <nav> element
<NavLink to="/genie" className={navLinkClass}>
  Genie
</NavLink>

// Add in the router children array
{ path: "/genie", element: <GeniePage /> },
```

### 6. Existing app: declare the Genie resource in `databricks.yml`

The Genie space must be declared as an app resource with the `dashboards.genie` API scope. Without the scope, on-behalf-of user execution fails at runtime.

Add the `genie_space_id` variable, the `user_api_scopes`, and the genie resource under your app. The `name: genie-space` on the resource is the key that `app.yaml` references via `valueFrom`:

```yaml
variables:
  genie_space_id:
    description: Genie space ID (from list-spaces or About)

resources:
  apps:
    app:
      # Merge into your existing app config
      user_api_scopes:
        - dashboards.genie
      resources:
        - name: genie-space
          genie_space:
            name: genie-space
            space_id: ${var.genie_space_id}
            permission: CAN_RUN

targets:
  default:
    variables:
      genie_space_id: <your-space-id>
```

### 7. Existing app: map the environment variable in `app.yaml`

Add the Genie space ID mapping so the deployed app receives the value at runtime:

```yaml
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
```

The `valueFrom` value must match the resource `name` in `databricks.yml`.

For local development, add the space ID to `.env`:

```bash
DATABRICKS_GENIE_SPACE_ID=<your-space-id>
```

---

### 8. Deploy and verify

From inside the app project folder (the directory containing `databricks.yml`):

```bash
cd <app-name>

# Build the client
npm run build

# Deploy bundle resources and sync files to workspace
# Copy the upload path printed in the output — you'll need it below
databricks bundle deploy

# Put the app in RUNNING state and wait for compute to be ready
# The loop polls every 5 seconds — press Ctrl+C if it hangs more than 2 minutes
databricks apps start <app-name>
until databricks apps get <app-name> -o json | grep -q '"ACTIVE"'; do sleep 5; done

# First deploy requires --source-code-path: paste the path from bundle deploy output above
databricks apps deploy <app-name> \
  --source-code-path <path-from-bundle-deploy-output>
```

`bundle deploy` prints the workspace upload path (`Uploading bundle files to ...`) — copy that value for `--source-code-path`. `apps start` puts the app into RUNNING state; the `until` loop waits for compute to be ACTIVE. `apps deploy` deploys the source and starts the app server.

For subsequent deploys, `--source-code-path` is not needed — the app remembers the path:

```bash
npm run build
databricks bundle deploy
databricks apps deploy <app-name>
```

Check app status and get the URL:

```bash
databricks apps get <app-name>
```

Open `<app-url>/genie` while signed in to Databricks and ask a natural-language question about your data to verify the integration.

If compute is **STOPPED**, run `databricks apps start <app-name>` and wait for `compute_status.state: ACTIVE` before deploying.

### 9. Troubleshoot common issues

**Missing genie scope error.** If the app logs show `does not have required scopes: genie`, confirm `user_api_scopes` includes `dashboards.genie` in `databricks.yml` and redeploy. Users who authenticated before the scope was added may need to re-authorize the app.

**Genie space not found.** Verify the space ID matches the value on the Genie space **About** tab. Confirm the target variable in `databricks.yml` is set to the correct ID.

**`valueFrom` mismatch.** The `valueFrom` value in `app.yaml` must exactly match the resource `name` in `databricks.yml`. A mismatch causes `DATABRICKS_GENIE_SPACE_ID` to be empty at runtime.

#### References

- [Genie plugin docs](/docs/appkit/v0/plugins/genie)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
- [GenieChat component API](/docs/appkit/v0/api/appkit-ui/genie/GenieChat)
