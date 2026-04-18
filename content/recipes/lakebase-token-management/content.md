## Lakebase Token Management

Fetch, cache, and automatically refresh the short-lived Postgres credentials that Lakebase requires. Supports both direct token auth (local dev) and M2M OAuth (production).

### 1. Add a token manager for workspace auth and Lakebase credentials

Create `src/lib/lakebase/tokens.ts`:

```typescript
import { env } from "@/lib/env";

const REFRESH_BUFFER_MS = 2 * 60 * 1000;

type CachedToken = {
  value: string;
  expiresAt: number;
};

type AuthStrategy =
  | { kind: "token"; token: string }
  | { kind: "m2m"; host: string; clientId: string; clientSecret: string };

let cachedWorkspaceToken: CachedToken | null = null;
let workspaceRefreshPromise: Promise<CachedToken> | null = null;
let cachedLakebaseToken: CachedToken | null = null;
let lakebaseRefreshPromise: Promise<CachedToken> | null = null;

function isFresh(token: CachedToken | null): token is CachedToken {
  return token !== null && Date.now() < token.expiresAt - REFRESH_BUFFER_MS;
}

function authStrategyFromEnv(): AuthStrategy {
  if (env.DATABRICKS_TOKEN) {
    return { kind: "token", token: env.DATABRICKS_TOKEN };
  }
  return {
    kind: "m2m",
    host: env.DATABRICKS_HOST.replace(/\/$/, ""),
    clientId: env.DATABRICKS_CLIENT_ID!,
    clientSecret: env.DATABRICKS_CLIENT_SECRET!,
  };
}

async function fetchWorkspaceTokenM2M(
  host: string,
  clientId: string,
  clientSecret: string,
): Promise<CachedToken> {
  const response = await fetch(`${host}/oidc/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "all-apis",
    }),
  });
  if (!response.ok) {
    throw new Error(`M2M token request failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token || !data.expires_in) {
    throw new Error("Invalid M2M token response");
  }
  return {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function getWorkspaceToken(auth: AuthStrategy): Promise<string> {
  if (auth.kind === "token") {
    return auth.token;
  }
  if (isFresh(cachedWorkspaceToken)) {
    return cachedWorkspaceToken.value;
  }
  if (!workspaceRefreshPromise) {
    workspaceRefreshPromise = fetchWorkspaceTokenM2M(
      auth.host,
      auth.clientId,
      auth.clientSecret,
    )
      .then((token) => {
        cachedWorkspaceToken = token;
        return token;
      })
      .finally(() => {
        workspaceRefreshPromise = null;
      });
  }
  return (await workspaceRefreshPromise).value;
}

async function fetchLakebaseCredential(
  databricksHost: string,
  workspaceToken: string,
): Promise<CachedToken> {
  const response = await fetch(
    `${databricksHost}/api/2.0/postgres/credentials`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workspaceToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ endpoint: env.LAKEBASE_ENDPOINT }),
    },
  );
  if (!response.ok) {
    throw new Error(`Lakebase credential request failed: ${response.status}`);
  }
  const data = (await response.json()) as {
    token?: string;
    expire_time?: string;
  };
  if (!data.token || !data.expire_time) {
    throw new Error("Invalid Lakebase credential response");
  }
  return {
    value: data.token,
    expiresAt: new Date(data.expire_time).getTime(),
  };
}

export async function getLakebasePostgresToken(): Promise<string> {
  if (isFresh(cachedLakebaseToken)) {
    return cachedLakebaseToken.value;
  }
  if (!lakebaseRefreshPromise) {
    lakebaseRefreshPromise = (async () => {
      const auth = authStrategyFromEnv();
      const workspaceToken = await getWorkspaceToken(auth);
      return fetchLakebaseCredential(
        env.DATABRICKS_HOST.replace(/\/$/, ""),
        workspaceToken,
      );
    })()
      .then((token) => {
        cachedLakebaseToken = token;
        return token;
      })
      .finally(() => {
        lakebaseRefreshPromise = null;
      });
  }
  return (await lakebaseRefreshPromise).value;
}
```

### 2. Add a script to refresh `DATABRICKS_TOKEN` for local dev

CLI-issued tokens expire after about one hour. Create `scripts/refresh-lakebase-token.ts` to write a fresh token into your local env file:

```typescript
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const envFile = process.argv[2] ?? ".env.local";
const profile = process.env.DATABRICKS_CONFIG_PROFILE ?? "DEFAULT";

const raw = execSync(`databricks auth token --profile "${profile}" -o json`, {
  encoding: "utf-8",
});
const parsed = JSON.parse(raw) as { access_token?: string };
if (!parsed.access_token) {
  throw new Error("Failed to get access token from Databricks CLI");
}

if (!existsSync(envFile)) {
  throw new Error(`Env file not found: ${envFile}`);
}

const content = readFileSync(envFile, "utf-8");
const tokenLine = `DATABRICKS_TOKEN="${parsed.access_token}"`;
const updated = content.includes("DATABRICKS_TOKEN=")
  ? content.replace(/^DATABRICKS_TOKEN=.*/m, tokenLine)
  : `${content.trimEnd()}\n${tokenLine}\n`;

writeFileSync(envFile, updated);
console.log(`Updated DATABRICKS_TOKEN in ${envFile}`);
```

### 3. Verify token and credential flow

```bash
databricks auth token --profile <PROFILE> -o json

curl -sS -X POST "https://<workspace-host>/api/2.0/postgres/credentials" \
  -H "Authorization: Bearer <workspace-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"projects/<project>/branches/<branch>/endpoints/<endpoint>"}'
```

The response should include `token` and `expire_time`.

#### References

- [Databricks CLI auth token command](https://docs.databricks.com/aws/en/dev-tools/cli/reference/auth-commands)
- [Lakebase credentials API](https://docs.databricks.com/api/workspace/postgres/credentials)
