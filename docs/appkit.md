---
title: AppKit
---

# AppKit

AppKit is the developer framework for building full-stack Databricks applications with opinionated defaults.

Use AppKit when you want a structured way to combine:

- frontend UI
- backend APIs
- SQL and Lakehouse access
- deployment to Databricks Apps

## What AppKit gives you

- a plugin-oriented architecture for composing app capabilities
- TypeScript-first development patterns
- local development workflows that map to Databricks deployment targets
- integration points for AI, analytics, and operational data services

## Core areas in this section

- `tools/appkit`: how AppKit fits into the tooling stack.
- `apps/plugins`: how plugin composition is used in application development.
- `references/appkit`: where to find API-level reference material.

## Start here

If your immediate goal is shipping an app:

1. read `apps/getting-started`
2. use `tools/appkit` for architecture boundaries
3. use `apps/plugins` when extracting shared runtime behavior

## Source of truth

For runtime and deployment behavior, align with Databricks Apps docs:

- [Databricks Apps get started](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/get-started)
- [Databricks Apps app.yaml runtime](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/app-runtime)
