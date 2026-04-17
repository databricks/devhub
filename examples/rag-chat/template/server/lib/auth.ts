import type { Request, Response } from 'express';

// Databricks Apps injects `x-forwarded-email` at the gateway and strips any
// client-supplied value. Treat that header as the authoritative user identity
// when running on the platform.
//
// `DATABRICKS_APP_NAME` is auto-injected by the runtime, so we use its presence
// as the signal that we're deployed (vs running locally via `npm run dev`).

export function authenticateUser(req: Request, res: Response): string | null {
  const email = req.header('x-forwarded-email');
  if (email) return email;
  if (process.env.DATABRICKS_APP_NAME) {
    res.status(401).json({
      error: 'Missing x-forwarded-email. Databricks Apps should inject this header at the gateway.',
    });
    return null;
  }
  return 'local-dev-user';
}
