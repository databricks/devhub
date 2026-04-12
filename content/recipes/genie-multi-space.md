## Genie Multi-Space Selector

Upgrade a single-space Genie app (from the [Genie Conversational Analytics](/resources/recipes/genie-conversational-analytics) recipe) to let users switch between multiple AI/BI Genie spaces from a dropdown. Each space gets a named alias; switching spaces remounts `<GenieChat>` and clears stale conversation state automatically.

### 1. List all Genie spaces you want to include

```bash
databricks genie list-spaces -o json --profile <PROFILE>
```

Note the `space_id` and `title` for each space. Decide on a short lowercase alias for each (e.g. `sales`, `support`). These become the keys in the server `spaces` map and in the `SPACES` array on the client. They must match exactly.

### 2. Update the server plugin

Replace the single-space `genie()` call in `server/server.ts` with a `spaces` map. Use one environment variable per space following the pattern `DATABRICKS_GENIE_SPACE_<ALIAS>`:

```typescript
import { createApp, genie, server } from "@databricks/appkit";

createApp({
  plugins: [
    server(),
    genie({
      spaces: {
        sales: process.env.DATABRICKS_GENIE_SPACE_SALES ?? "",
        support: process.env.DATABRICKS_GENIE_SPACE_SUPPORT ?? "",
      },
    }),
  ],
}).catch(console.error);
```

Each key becomes the alias for all API routes (`/api/genie/<alias>/messages`) and the `<GenieChat alias="..." />` prop. Add one entry per space.

### 3. Update configuration files

#### `.env` (local development)

Keep `DATABRICKS_GENIE_SPACE_ID`. The platform validator still requires it even when you supply a custom `spaces` map. Point it at whichever space you treat as the default. Add one new variable per additional space:

```bash
DATABRICKS_GENIE_SPACE_ID=<first-space-id>
DATABRICKS_GENIE_SPACE_SALES=<sales-space-id>
DATABRICKS_GENIE_SPACE_SUPPORT=<support-space-id>
```

#### `app.yaml`

Keep the existing `DATABRICKS_GENIE_SPACE_ID → genie-space` mapping for platform validation. Add one `valueFrom` entry per additional space:

```yaml
command: ["npm", "run", "start"]
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    valueFrom: genie-space
  - name: DATABRICKS_GENIE_SPACE_SALES
    valueFrom: genie-space-sales
  - name: DATABRICKS_GENIE_SPACE_SUPPORT
    valueFrom: genie-space-support
```

#### `databricks.yml`

Keep the existing `genie_space_name` / `genie_space_id` variable pair and `genie-space` resource. They satisfy the platform validator and can continue pointing to your first/default space. Add a new variable pair and `genie_space` resource for each additional space:

```yaml
variables:
  # existing from single-space setup, keep as-is, used for platform validation
  genie_space_name:
    description: Default Genie space display title
  genie_space_id:
    description: Default Genie space ID
  # new: one pair per additional space
  genie_space_sales_name:
    description: Sales Genie space display title
  genie_space_sales_id:
    description: Sales Genie space ID
  genie_space_support_name:
    description: Support Genie space display title
  genie_space_support_id:
    description: Support Genie space ID

resources:
  apps:
    app:
      user_api_scopes:
        - dashboards.genie
      resources:
        # existing, keep as-is
        - name: genie-space
          genie_space:
            name: ${var.genie_space_name}
            space_id: ${var.genie_space_id}
            permission: CAN_RUN
        # new: one resource block per additional space
        - name: genie-space-sales
          genie_space:
            name: ${var.genie_space_sales_name}
            space_id: ${var.genie_space_sales_id}
            permission: CAN_RUN
        - name: genie-space-support
          genie_space:
            name: ${var.genie_space_support_name}
            space_id: ${var.genie_space_support_id}
            permission: CAN_RUN

targets:
  default:
    variables:
      genie_space_name: "<first-space-title>"
      genie_space_id: <first-space-id>
      genie_space_sales_name: "<sales-space-title>"
      genie_space_sales_id: <sales-space-id>
      genie_space_support_name: "<support-space-title>"
      genie_space_support_id: <support-space-id>
```

Repeat the variable pair and resource block for every additional space beyond the first.

### 4. Inject a build version stamp

`GenieChat` stores the active conversation ID in two places that can become stale across space switches or redeployments:

- **URL**: stored as `?conversationId=<id>`, read on every mount to replay history. When the user switches spaces, the new `GenieChat` instance reads this param and tries to fetch the old conversation through the new space's alias, resulting in `NOT_FOUND`.
- **localStorage**: `appkit:genie:*` keys for related state. After a redeployment, stored IDs may no longer exist in the Genie backend, resulting in `NOT_FOUND`.

Stamping every build with a timestamp lets the page detect a new deployment and clean up before `GenieChat` mounts.

In `client/vite.config.ts`, add a `define` block alongside your existing config:

```typescript
export default defineConfig({
  // ... existing config ...
  define: {
    // Changes on every build so the page can detect a new deployment
    // and clear stale conversation state before GenieChat mounts.
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(Date.now().toString()),
  },
});
```

### 5. Replace the Genie page

Replace the contents of `client/src/pages/genie/GeniePage.tsx` with the multi-space version below.

`clearConversationUrl` strips `?conversationId` from the URL before the alias state changes, so the newly mounted `GenieChat` instance always starts without a stale cross-space conversation reference.

`initAlias` runs once at component mount. On build-version mismatch it wipes all `appkit:genie:*` localStorage keys and clears the URL param, then restores the user's last-selected alias before returning it as initial state.

```tsx
import { useState } from "react";
import { GenieChat } from "@databricks/appkit-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@databricks/appkit-ui/react";

const SPACES = [
  { alias: "sales", label: "Sales Analytics" },
  { alias: "support", label: "Support Analytics" },
];

const VERSION_KEY = "appkit:genie:version";
const ALIAS_KEY = "appkit:genie:alias";

function clearConversationUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("conversationId");
  window.history.replaceState({}, "", url.toString());
}

function initAlias(): string {
  const buildVersion = import.meta.env.VITE_APP_VERSION ?? "dev";

  if (localStorage.getItem(VERSION_KEY) !== buildVersion) {
    const savedAlias = localStorage.getItem(ALIAS_KEY);
    Object.keys(localStorage)
      .filter((k) => k.startsWith("appkit:genie:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, buildVersion);
    if (savedAlias) localStorage.setItem(ALIAS_KEY, savedAlias);
    clearConversationUrl();
  }

  return localStorage.getItem(ALIAS_KEY) ?? SPACES[0]?.alias ?? "";
}

export function GeniePage() {
  const [selectedAlias, setSelectedAlias] = useState(initAlias);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Genie</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about your data using Databricks AI/BI Genie.
          </p>
        </div>
        <Select
          value={selectedAlias}
          onValueChange={(alias) => {
            clearConversationUrl();
            setSelectedAlias(alias);
            localStorage.setItem(ALIAS_KEY, alias);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select space" />
          </SelectTrigger>
          <SelectContent>
            {SPACES.map((space) => (
              <SelectItem key={space.alias} value={space.alias}>
                {space.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[600px] border rounded-lg overflow-hidden">
        <GenieChat key={selectedAlias} alias={selectedAlias} />
      </div>
    </div>
  );
}
```

No changes are needed in `client/src/App.tsx`. The import, nav link, and route from the single-space setup carry over unchanged.

### 6. Deploy and test

From the app project directory (the folder containing `databricks.yml`):

```bash
databricks apps deploy --profile <PROFILE>
```

This runs the full pipeline: typecheck, build, bundle sync, resource update, and app deploy in one step.

:::tip[Bundle deploy vs apps deploy]

`databricks bundle deploy` updates workspace files and bundle resources but does **not** run the full build-and-deploy pipeline. If you only run `bundle deploy`, the app may stay **UNAVAILABLE** with a message like _deploy source code_. Use `databricks apps deploy` from the app project directory to deploy and start the runnable app.

:::

Verify status and open the app URL:

```bash
databricks apps get <app-name> --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

If the app is **UNAVAILABLE** with _deploy source code_, re-run `databricks apps deploy` from inside the app project directory (not from a parent repo). If compute is **STOPPED**, start it first:

```bash
databricks apps start <app-name> --profile <PROFILE>
```

Open the app URL while signed in to Databricks, navigate to the Genie page, and verify:

1. The space selector shows all configured spaces
2. Asking a question routes to the correct space
3. Switching spaces resets the conversation with no `NOT_FOUND` error
4. Reloading the page restores the last selected space and replays the conversation
5. After redeploying, stale conversation IDs are automatically cleared on the next page load

#### References

- [Genie plugin docs](https://databricks.github.io/appkit/docs/plugins/genie)
- [GenieChat component](https://databricks.github.io/appkit/docs/api/appkit-ui/genie/GenieChat)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
