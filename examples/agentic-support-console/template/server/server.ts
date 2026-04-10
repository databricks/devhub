import { createApp, analytics, genie, lakebase, server } from '@databricks/appkit';
import { setupSupportRoutes } from './routes/support-routes';

createApp({
  plugins: [server({ autoStart: false }), analytics(), genie(), lakebase()],
})
  .then(async (appkit) => {
    await setupSupportRoutes(appkit);
    await appkit.server.start();
  })
  .catch(console.error);
