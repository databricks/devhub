---
title: AppKit
---

# AppKit

Use AppKit to structure and accelerate full-stack application development for Databricks.

## Purpose

AppKit provides framework-level patterns for composing app capabilities with a clear separation between product logic and infrastructure wiring.

## Typical responsibilities

- plugin composition and capability registration
- request/response surface integration
- query/data access orchestration
- local development ergonomics for Databricks deployments

## Prerequisites

- Databricks CLI `0.292+`
- authenticated profile selected with `databricks auth profiles`

## Manifest-first scaffolding workflow

Do not guess plugin names, feature flags, or required resource fields.

1. Inspect template/plugin schema first:

```bash
databricks apps manifest --profile <PROFILE>
# optional custom template:
databricks apps manifest --template <GIT_URL> --profile <PROFILE>
```

2. Build `databricks apps init` from the manifest output:

```bash
databricks apps init --name <NAME> --features <plugin1>,<plugin2> \
  --set <plugin>.<resource>.<field>=<value> \
  --description "<DESC>" --run none --profile <PROFILE>
```

Guidelines:

- use `--features` only for optional plugins the app needs
- pass `--set` for each required resource field in selected/required plugins
- app names must be lowercase, hyphenated, and 26 chars or fewer
- run `databricks apps validate --profile <PROFILE>` before deployment

## AppKit documentation CLI

Use the AppKit docs CLI as the primary API reference for components, hooks, and plugin docs:

```bash
npx @databricks/appkit docs
npx @databricks/appkit docs --full
npx @databricks/appkit docs "<query-or-doc-path>"
```

Run without arguments first, then select a section from the index.

## Analytics app workflow (recommended order)

1. Create SQL files in `config/queries/`
2. Run `npm run typegen`
3. Use generated types from `client/src/appKitTypes.d.ts`
4. Build UI in `client/src/App.tsx`
5. Update smoke test selectors in `tests/smoke.spec.ts`
6. Run `databricks apps validate --profile <PROFILE>`

Writing UI before type generation usually causes avoidable type and integration errors.

## Recommended usage model

1. Keep domain logic in project libraries.
2. Use AppKit for cross-cutting runtime concerns.
3. Validate plugin and runtime contracts through integration tests.

## Getting started quickly

- start from the AppKit starter/project template used by your team
- run the local development command and verify the baseline route loads
- wire one data capability (for example SQL or API call) before adding plugins
- deploy once early to validate local and Databricks runtime parity

## Related pages

- `appkit`
- `apps/plugins`
- `references/appkit`
