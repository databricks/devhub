# DevHub

devhub (dev.databricks.com) is the platform for developers to get all they need to build and deploy data apps and AI agents to Databricks. It provides opinonated guides, tools, and best practices for the Databricks developer stack.

## Contributing

Review the [Contributing](./CONTRIBUTING.md) guide for more information on how to contribute to DevHub.

## DevHub Development Workflow

For every change to DevHub, do the following:

- run `npm run dev` to start the development server (both Docusaurus and the API functions)
- use the `building-components` skill to understand how to write React components
- make your changes
- run `npm run fmt` to format the code
- run `npm run typecheck` to verify types are correct
- use agent-browser to verify the changes
- use the `seo-audit` skill to verify all changes are SEO-friendly
- use the `frontend-design` skill to verify all changes adhere to the design principles
- run `npm run build` to verify build is successful
- run `bun run test` to run smoke tests (builds, serves, verifies sitemap.xml, robots.txt, and llms.txt)

## DevHub Coding Guidelines

- Strictly follow the Functional Core, Imperative Shell pattern: separate application logic into two parts: a functional core with pure, side-effect-free functions for business rules and data transformation, and an imperative shell that handles impure actions like database I/O, network requests, or user input, making the core logic easily testable and modular
- Everything is a library: Organize features and domains as self-contained folders in `src/lib/` (e.g., `chat`, `ai`, `db`). Co-locate schema, queries, types, and utilities together. Components go in `components/<feature>/`.
- Use the web platform: Prefer native APIs and standards. Avoid abstractions that hide what the code actually does.

### TypeScript

- Avoid `export default` in favor of `export` whenever possible.
- Only create an abstraction if it's actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Don't use emojis
- No barrel index files - just export from the source files instead
- No type.ts files, just inline types or co-locate them with their related code
- Don't unnecessarily add `try`/`catch`
- Don't cast to `any`

### React

- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed

### Tailwind

- Always use Tailwind over CSS Modules
- Use brand colors
- Prefer built-in values, occasionally allow dynamic values, rarely globals
- Always use v4 + global CSS file format + shadcn/ui

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
