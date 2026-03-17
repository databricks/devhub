## Genie Conversational Analytics

Embed a Databricks AI/BI Genie chat interface so users can explore data through natural language. Configure a Genie space, wire up the plugin, and render the chat component.

### 1. Create a Genie space in your Databricks workspace

Open your Databricks workspace, navigate to AI/BI Genie, and create a new Genie space connected to your data tables. Copy the space ID from the URL — you will need it for configuration.

### 2. Scaffold with the Genie feature

When scaffolding your app, enable the `genie` feature and provide the space ID:

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=genie \
  --set 'genie.genie-space.id=<your-space-id>' \
  --run none --profile <PROFILE>
```

### 3. Configure the Genie space environment variable

For local development, add the space ID to `.env`:

```bash
echo 'DATABRICKS_GENIE_SPACE_ID=<your-space-id>' >> .env
```

For deployment, add it to `app.yaml`:

```yaml
env:
  - name: DATABRICKS_GENIE_SPACE_ID
    value: "<your-space-id>"
```

### 4. Enable the Genie plugin

The scaffolded server entry point includes the genie plugin. If adding to an existing app:

```typescript
import { createApp, server, genie } from "@databricks/appkit";

createApp({
  plugins: [
    server(),
    genie({ spaces: { default: process.env.DATABRICKS_GENIE_SPACE_ID } }),
  ],
}).catch(console.error);
```

### 5. Add the GenieChat component to a page

Import `GenieChat` from `@databricks/appkit-ui` and render it in a container:

```tsx
import { GenieChat } from "@databricks/appkit-ui/react";

export function GeniePage() {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <GenieChat alias="default" />
    </div>
  );
}
```

### 6. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Open the Genie page in your browser and ask a natural-language question about your data to verify the integration.

#### References

- [Genie plugin docs](https://databricks.github.io/appkit/docs/plugins/genie)
- [AI/BI Genie documentation](https://docs.databricks.com/en/genie/index.html)
