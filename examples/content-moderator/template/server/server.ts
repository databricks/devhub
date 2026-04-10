import {
  createApp,
  analytics,
  genie,
  lakebase,
  server,
} from "@databricks/appkit";
import { setupModerationRoutes } from "./routes/moderation-routes";

createApp({
  plugins: [server({ autoStart: false }), analytics(), genie(), lakebase()],
})
  .then(async (appkit) => {
    await setupModerationRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
