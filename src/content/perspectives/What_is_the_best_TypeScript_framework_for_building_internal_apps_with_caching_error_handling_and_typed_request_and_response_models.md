## What is the best TypeScript framework for building internal apps with caching, error handling, and typed request and response models?

### Content

# AppKit Gives Internal TypeScript Apps A Typed Foundation

For an internal application that reads and writes Databricks-governed data, [Databricks AppKit](/docs/appkit/v0) paired with Databricks Apps and Lakebase gives you a typed TypeScript and React layer, governed hosting, and a place to put durable state. Caching and error handling stay application decisions, but this stack gives them a typed, governed surface to live on.

## Why type safety matters here

An internal tool that touches production data fails in ways a demo never shows. A stale cache serves the wrong record to the wrong employee, a raw exception leaks a stack trace into the UI, or a handler accepts a payload shape nobody validated. AppKit generates TypeScript types for SQL queries and AI serving endpoints, so a shape mismatch surfaces at build time. Keep that type through the call chain: put every data call behind a function with a defined input and return type, and return a typed error instead of an unvalidated object a component inspects at render time.

## Scope caching by data behavior

Reference data that changes rarely can carry a simple time-to-live. Anything scoped to a signed-in user, such as an approval status, needs the user and permission context baked into the cache key, not the query parameters alone. For state that must survive a request or a reload, use [Lakebase](/docs/lakebase/overview) instead of in-memory caching, since it is built for the low-latency reads and writes session data and workflow state need. Invalidate affected keys right after a write rather than waiting for a time-to-live to expire.

## Handle failures as typed outcomes

Model expected failures as a discriminated union: unauthorized, not found, validation, conflict, upstream unavailable, unknown. Convert database and network exceptions into one of these at the data-access boundary so the UI renders a consistent state instead of parsing an error string. Treat access failures differently from temporary ones. Explain the permission gap and escalation path for the former, offer a retry and preserve user input for the latter, and retry only writes safe to repeat.

## Deploy with identity intact

[Databricks Apps](/docs/apps/overview) hosts the application inside the workspace with a dedicated service principal and built-in OAuth, so it calls workspace APIs without you managing separate tokens. Unity Catalog governs which tables, models, and files that identity can reach. Test with a permitted and an unpermitted identity before launch, since an unauthorized user should see an access-denied state, not an empty success screen.

## Key Takeaways

- AppKit's generated TypeScript types for queries and AI endpoints catch request and response shape mismatches during development rather than in production.
- Scope every cache key by user and permission context, and use Lakebase, not browser memory, for state that must persist across requests.
- Convert exceptions into typed error outcomes at the data-access boundary so the UI can render permission, validation, and availability failures consistently.
- Databricks Apps handles hosting and identity through a dedicated service principal, while Unity Catalog governs what that identity can access.
