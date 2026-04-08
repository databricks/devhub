## Genie Conversational Analytics

Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the server and client plugins, declare app resources, and deploy.

### 1. Create a Genie space in your Databricks workspace

Open your Databricks workspace, navigate to **AI/BI Genie**, and create a new Genie space connected to your data tables. Note the **space title** (display name) shown in the Genie list or space header.

To collect both the **title** and **space ID** in one step (for bundle variables and `DATABRICKS_GENIE_SPACE_ID`):

```bash
databricks genie list-spaces -o json --profile <PROFILE>
```

Use the `title` string as **Genie space name** and the `space_id` value wherever a space ID is required (scaffold `--set`, `.env`, and `databricks.yml`).

### 2. New app: scaffold with the Genie feature

If you are starting a new app, scaffold it with the Genie feature flag. This generates all server, client, resource, and environment wiring automatically.

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=genie \
  --set 'genie.genie-space.id=<your-space-id>' \
  --run none --profile <PROFILE>
```

Use the `space_id` from step 1 (or the **About** tab on the space) for `<your-space-id>`. The CLI maps this to `DATABRICKS_GENIE_SPACE_ID`.

**App name:** Use at most 26 characters, **lowercase letters, digits, and hyphens only** (no underscores). Example: `my-genie-app`, not `my_genie_app`.

After `init`, open `databricks.yml` and check **`targets.default.variables`**. Some templates set **`genie_space_id`** but omit **`genie_space_name`**. If **`genie_space_name`** is missing or empty, set it to the exact **space title** from step 1 (the same title shown in the Genie UI). Deploy requires both **name** and **space ID** in the bundle for the `genie_space` resource.

`apps init` creates a project folder in **kebab-case** matching `<app-name>`. For deploy and test (step 8), run all commands from **inside that folder** (the directory that contains `databricks.yml`).

Skip to step 8 to deploy.

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

For local development, add the space ID to `.env` (use the `space_id` from `databricks genie list-spaces` or the space **About** tab):

```bash
DATABRICKS_GENIE_SPACE_ID=<your-space-id>
```

Add the genie-space variables, the `user_api_scopes` and genie resource under your app, and the target variable values. The **name** is the Genie space **title**; **space ID** must match the same space:

```yaml
variables:
  genie_space_name:
    description: Genie space display title (as shown in the Genie UI)
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
            name: ${var.genie_space_name}
            space_id: ${var.genie_space_id}
            permission: CAN_RUN

targets:
  default:
    variables:
      genie_space_name: "<your-space-title>"
      genie_space_id: <your-space-id>
```

The `name: genie-space` on the resource is the key that `app.yaml` references via `valueFrom`.

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

### 8. Deploy and verify

From the app project directory (the folder with `databricks.yml`), deploy and run in one step:

```bash
cd <app-name>
databricks apps deploy --profile <PROFILE>
```

When run from that directory **without** a trailing app name argument, the CLI runs the full pipeline: validate the project (for Node: install if needed, typecheck, lint, build), sync the bundle to the workspace, create an app deployment, and start the app.

:::tip[Multiple CLI profiles for the same workspace]

If the CLI reports that **multiple profiles matched** your workspace host, pass **`--profile <PROFILE>`** on each command, set **`DATABRICKS_CONFIG_PROFILE`** to one profile, or add **`workspace.profile`** under your bundle target in `databricks.yml` so the bundle resolves auth consistently.

:::

:::tip[Bundle deploy vs apps deploy]

`databricks bundle deploy` updates bundle state and synced files in the workspace, but it does **not** run the full Apps build-and-run pipeline. If you only run `bundle deploy`, the app can stay **UNAVAILABLE** with a message like _deploy source code_ while compute is active. Use `databricks apps deploy` from the app directory when you want the runnable app updated. You may still use `bundle deploy` when you are only changing bundle or workspace configuration and will run `apps deploy` afterward.

:::

Optional flags:

- `--target <target>` if you use a non-default bundle target.
- `--skip-validation` to skip local build/typecheck/lint (use only when you accept skipping checks).

Check app status, URL, and logs (replace `<app-name>` with the name from `databricks.yml`):

```bash
databricks apps get <app-name> --profile <PROFILE>
databricks apps list --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

If the app is **UNAVAILABLE** with _deploy source code_, run `databricks apps deploy` from the app project directory again (not from a parent repo root). If **compute** is **STOPPED**, start it:

```bash
databricks apps start <app-name> --profile <PROFILE>
```

Open the app URL from `databricks apps get` while signed in to Databricks, navigate to the Genie page, and ask a natural-language question about your data to verify the integration.

### 9. Troubleshoot common issues

**Missing genie scope error.** If the app logs show `does not have required scopes: genie`, confirm `user_api_scopes` includes `dashboards.genie` in `databricks.yml` and redeploy. Users who authenticated before the scope was added may need to re-authorize the app.

**Genie space not found.** Verify the space ID matches the value on the Genie space **About** tab. Confirm the target variable in `databricks.yml` is set to the correct ID.

**`valueFrom` mismatch.** The `valueFrom` value in `app.yaml` must exactly match the resource `name` in `databricks.yml`. A mismatch causes `DATABRICKS_GENIE_SPACE_ID` to be empty at runtime.

#### References

- [Genie plugin docs](/docs/appkit/v0/plugins/genie)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
- [GenieChat component API](/docs/appkit/v0/api/appkit-ui/genie/GenieChat)
