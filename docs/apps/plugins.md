---
title: Plugins
---

# Apps Plugins

Use plugins to add reusable behavior to your application architecture without coupling core business logic.

## What belongs in a plugin

- infrastructure adapters (for example data/query access layers)
- cross-cutting concerns (telemetry, auth middleware, validation)
- framework extension points that are shared across features

## Design principles

- keep plugin interfaces small and explicit
- prefer configuration over hidden runtime magic
- isolate side effects at plugin boundaries
- keep domain logic in app/library code, not in plugin wiring

## Validation checklist

- plugin startup failures are visible and actionable
- plugin dependencies are declared and versioned
- plugin contracts are covered by integration tests

## Minimal plugin example (shape)

A plugin should expose a small setup surface, receive explicit config, and return registered capabilities used by app features.

Keep runtime side effects (network, DB, telemetry) inside plugin boundaries, and keep business rules in app/library modules.

## Related pages

- `tools/appkit`
- `apps/development`
- `references/appkit`
