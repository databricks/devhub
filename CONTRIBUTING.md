# Contributing to DevHub

Keep changes small, clear, and easy to review.

## Before You Start

- Read `AGENTS.md` for project conventions and agent guidance.
- Use the scripts in `package.json` to validate your changes.

## Local Workflow

1. Install dependencies:

```bash
npm install
```

2. Start the site locally:

```bash
npm run dev
```

This will run both the Docusaurus and the API functions locally.

3. Run formatting:

```bash
npm run fmt
```

4. Run type checking:

```bash
npm run typecheck
```

5. Run smoke tests (builds production site, serves it, verifies sitemap, robots.txt, and llms.txt):

```bash
npm run test
```

## Useful Scripts

From `package.json`:

- `npm run start` - run local dev server
- `npm run build` - build production site
- `npm run test` - build, serve, and run smoke tests
- `npm run typecheck` - run TypeScript checks
- `npm run fmt` - format files with Prettier
- `npm run sync:appkit-docs` - sync AppKit docs content

## Pull Request Notes

- Keep docs accurate and concise.
- Include a short description of what changed and why.
- Ensure formatting, typecheck, and tests pass before opening a PR.
