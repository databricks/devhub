## Genie Multi-Space Selector

Upgrade a single-space Genie app (from the [Genie Conversational Analytics](/resources/recipes/genie-conversational-analytics) recipe) to let users switch between multiple AI/BI Genie spaces from a dropdown. Each space gets a named alias; switching spaces remounts `<GenieChat>` and clears stale conversation state automatically.

### 1. List all Genie spaces you want to include

List your spaces:

```bash
databricks genie list-spaces -o json --profile <PROFILE>
```

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

Note the `space_id` and `title` for each space. Decide on a short lowercase alias for each (e.g. `sales`, `support`) — these become the keys in the server `spaces` map and in the `SPACES` array on the client. They must match exactly.

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

Keep the existing `genie_space_id` variable and `genie-space` resource — they satisfy the platform validator and can continue pointing to your first/default space. Add a new variable and `genie_space` resource for each additional space:

```yaml
variables:
  # existing from single-space setup — keep as-is, used for platform validation
  genie_space_id:
    description: Default Genie space ID
  # new: one variable per additional space
  genie_space_sales_id:
    description: Sales Genie space ID
  genie_space_support_id:
    description: Support Genie space ID

resources:
  apps:
    app:
      user_api_scopes:
        - dashboards.genie
      resources:
        # existing — keep as-is
        - name: genie-space
          genie_space:
            name: genie-space
            space_id: ${var.genie_space_id}
            permission: CAN_RUN
        # new: one resource block per additional space
        - name: genie-space-sales
          genie_space:
            name: genie-space-sales
            space_id: ${var.genie_space_sales_id}
            permission: CAN_RUN
        - name: genie-space-support
          genie_space:
            name: genie-space-support
            space_id: ${var.genie_space_support_id}
            permission: CAN_RUN

targets:
  default:
    variables:
      genie_space_id: <first-space-id>
      genie_space_sales_id: <sales-space-id>
      genie_space_support_id: <support-space-id>
```

Repeat the variable and resource block for every additional space beyond the first.

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

No changes are needed in `client/src/App.tsx` — the import, nav link, and route from the single-space setup carry over unchanged.

### 6. Deploy and test

From the app project directory (the folder containing `databricks.yml`):

```bash
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

For subsequent deploys, `--source-code-path` is not needed. Run both `bundle deploy` and `apps deploy` when changing `databricks.yml`; for client-only changes, `apps deploy` alone is sufficient after `npm run build`:

```bash
npm run build
databricks bundle deploy
databricks apps deploy <app-name>
```

Check app status and get the URL:

```bash
databricks apps get <app-name>
```

If compute is **STOPPED**, run `databricks apps start <app-name>` and wait for `compute_status.state: ACTIVE` before deploying.

Open `<app-url>/genie` while signed in to Databricks and verify:

1. The space selector shows all configured spaces
2. Asking a question routes to the correct space
3. Switching spaces resets the conversation with no `NOT_FOUND` error
4. Reloading the page restores the last selected space and replays the conversation
5. After redeploying, stale conversation IDs are automatically cleared on the next page load

#### References

- [Genie plugin docs](https://databricks.github.io/appkit/docs/plugins/genie)
- [GenieChat component](https://databricks.github.io/appkit/docs/api/appkit-ui/genie/GenieChat)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
