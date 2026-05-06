---
name: vercel-composition-patterns
description: "React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes."
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# React Composition Patterns

## Refactoring Workflow

1. **Identify** -- Find components with 3+ boolean props or complex conditional rendering
2. **Choose pattern** -- Use the priority table below to select the right approach
3. **Refactor** -- Apply the pattern; prefer compound components for complex UI, explicit variants for mode switches
4. **Validate** -- Confirm: no boolean prop proliferation, state lifted to providers, children used over render props
5. **Review** -- Read the relevant rule file for edge cases before finalizing

## Core Pattern: Boolean Props to Compound Components

```tsx
// BEFORE: boolean prop proliferation
<Card showHeader showFooter isCollapsible hasBorder />

// AFTER: compound components via composition
<Card>
  <Card.Header />
  <Card.Body collapsible>{content}</Card.Body>
  <Card.Footer />
</Card>
```

## Core Pattern: Explicit Variants Over Boolean Modes

```tsx
// BEFORE: boolean mode switching
<Button primary />
<Button secondary />
<Button ghost />

// AFTER: explicit variant components or union prop
<Button variant="primary" />
<PrimaryButton />
```

## Core Pattern: React 19 -- Drop forwardRef

```tsx
// React 18 (old)
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

// React 19 (new) -- ref is a regular prop
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

## Rules by Priority

| Priority | Rule | What to do |
| -------- | ---- | ---------- |
| 1 (HIGH) | `architecture-avoid-boolean-props` | Replace boolean props with composition |
| 1 (HIGH) | `architecture-compound-components` | Structure complex components with shared context |
| 2 | `state-decouple-implementation` | Provider is the only place that knows state impl |
| 2 | `state-context-interface` | Generic interface: state, actions, meta |
| 2 | `state-lift-state` | Move state into providers for sibling access |
| 3 | `patterns-explicit-variants` | Variant components instead of boolean modes |
| 3 | `patterns-children-over-render-props` | Use children, not renderX props |
| 4 | `react19-no-forwardref` | Drop `forwardRef`; use `use()` instead of `useContext()` |

Read individual rule files in `rules/` for detailed explanations with incorrect/correct code examples.

For the complete compiled guide with all rules expanded: `AGENTS.md`
