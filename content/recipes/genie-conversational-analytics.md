## Genie Conversational Analytics

Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the plugin, and render the chat component.

### 1. Create a Genie space in your Databricks workspace

Open your Databricks workspace, navigate to AI/BI Genie, and create a new Genie space connected to your data tables. Copy the space ID from the URL.

### 2. New app: scaffold with the Genie feature

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=genie \
  --set 'genie.genie-space.id=<your-space-id>' \
  --run none --profile <PROFILE>
```

This scaffolds a complete app with Genie already wired up. Skip to step 4 to deploy.

### 3. Existing app: add Genie manually

The following changes match what `apps init --features=genie` generates. Apply them to an existing scaffolded AppKit app.

:::tip[Get the latest template code]
The code below may be outdated. To get the latest, clone `https://github.com/databricks/appkit` and look in the `template/` directory. Search for `{{if .plugins.genie}}` to find all genie-conditional files and blocks. Files entirely wrapped in that conditional are genie-only; shared files like `App.tsx` and `server.ts` contain conditional blocks you can extract.
:::

#### Add `genie` to server plugins

In `server/server.ts`, add `genie` to the import and plugins array:

```typescript
import { createApp, server, genie } from "@databricks/appkit";

createApp({
  plugins: [server(), genie()],
}).catch(console.error);
```

The `genie()` plugin reads `DATABRICKS_GENIE_SPACE_ID` from the environment automatically.

#### Create `client/src/pages/genie/GeniePage.tsx`

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

#### Update `client/src/App.tsx`

Add the import, nav link, and route:

```tsx
// Add import at top
import { GeniePage } from './pages/genie/GeniePage';

// Add nav link inside the <nav> element
<NavLink to="/genie" className={navLinkClass}>
  Genie
</NavLink>

// Add route in the router children array
{ path: '/genie', element: <GeniePage /> },
```

#### Add Genie environment variable

Add to `.env`:

```bash
DATABRICKS_GENIE_SPACE_ID=<your-space-id>
```

#### Update `databricks.yml`

Add the genie-space variable, the `user_api_scopes` and genie resource under your app, and the target variable value:

```yaml
variables:
  genie_space_id:
    description: Default Genie Space ID

resources:
  apps:
    app:
      # Add under existing app config
      user_api_scopes:
        - dashboards.genie
      resources:
        - name: genie-space
          genie_space:
            space_id: ${var.genie_space_id}
            permission: CAN_RUN

targets:
  default:
    variables:
      genie_space_id: <your-space-id>
```

### 4. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Verify app status and logs:

```bash
databricks apps list --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

Open the app URL in your browser while signed in to Databricks, navigate to the Genie page, and ask a natural-language question about your data to verify the integration.

#### References

- [Genie plugin docs](https://databricks.github.io/appkit/docs/plugins/genie)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
