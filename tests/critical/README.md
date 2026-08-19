# Critical user flow tests

This suite is the release gate for the smallest set of DevHub journeys whose
failure prevents a developer or coding agent from getting useful content. It
runs against a local production build. It does not poll the production site,
send alerts, or run on a schedule.

## Test plan

| ID           | Priority | User flow                                               | Required outcome                                                                                                        |
| ------------ | -------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| TC-WEB-001   | P0       | Home → Copy agent prompt                                | The real bootstrap API returns a complete prompt and Chromium copies it through the browser Clipboard API.              |
| TC-WEB-002   | P0       | Global search → Databricks CLI docs → Copy Markdown     | Cmd/Ctrl-K on desktop or the mobile-menu trigger opens search, navigates to the right doc, and exports useful Markdown. |
| TC-WEB-003   | P0       | Templates → search → SaaS Tracker → agent handoff       | The selected template copies a complete prompt and generates a valid Replit URL.                                        |
| TC-WEB-004   | P1       | Template copy → simulated clipboard error → retry       | The failure is visible and a second attempt succeeds without reloading.                                                 |
| TC-AGENT-001 | P0       | Agent requests bootstrap, llms.txt, raw docs, and tools | Machine-readable entry points respond, and the MCP server advertises and executes its required tools.                   |

The four browser journeys run in desktop Chromium, Playwright's emulated Pixel
7 Chromium profile, desktop WebKit, and Playwright's emulated iPhone 15 WebKit
profile. Device profiles emulate browser settings such as viewport, user agent,
touch input, and device scale factor; they are not physical devices or installed
mobile Safari/Chrome. The browser-independent API contract runs once in desktop
Chromium.

Successful copy flows use Chromium's browser Clipboard API with explicit
permissions in the desktop Chromium project. Other browser profiles use a
deterministic clipboard implementation because headless clipboard permission
support differs by engine. The clipboard failure and retry flow always uses a
controlled failure so the error state is reproducible.

## Commands

```bash
# Production build plus only the release-gating journeys
pnpm test:critical

# Unit tests and the broad Chromium regression suite
pnpm test

# The same two release gates CI runs
pnpm test:critical && pnpm test
```

On CI, a failed critical journey keeps its screenshot, trace, and video as a
short-lived workflow artifact. The broader Playwright and Vitest suites remain
the regression layer; tests should only move into this folder when a failure
blocks the core developer outcome described above.
