import {
  createApp,
  analytics,
  genie,
  lakebase,
  server,
} from "@databricks/appkit";
import { setupInventoryRoutes, genieEnabled } from "./routes/inventory-routes";

createApp({
  plugins: [
    server({ autoStart: false }),
    analytics(),
    ...(genieEnabled ? [genie()] : []),
    lakebase(),
  ],
})
  .then(async (appkit) => {
    await setupInventoryRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
