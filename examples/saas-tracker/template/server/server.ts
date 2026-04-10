import {
  createApp,
  analytics,
  genie,
  lakebase,
  server,
} from "@databricks/appkit";
import { setupSaasRoutes } from "./routes/saas-routes";

createApp({
  plugins: [server({ autoStart: false }), analytics(), genie(), lakebase()],
})
  .then(async (appkit) => {
    await setupSaasRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
