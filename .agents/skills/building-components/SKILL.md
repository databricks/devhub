---
name: building-components
description: "Guide for building modern, accessible, and composable UI components. Use when building new components, implementing accessibility, creating composable APIs, setting up design tokens, publishing to npm/registry, or writing component documentation."
---

# Building Components

## Workflow

Follow this sequence when building a new component:

1. **Define the API** -- Decide on props, slots, and controlled/uncontrolled state. See [composition.mdx](./references/composition.mdx) and [state.mdx](./references/state.mdx).
2. **Implement the component** -- Use composition patterns (children over render props, explicit variants over boolean flags). See [principles.mdx](./references/principles.mdx).
3. **Add accessibility** -- Add ARIA roles, keyboard navigation, and focus management. See [accessibility.mdx](./references/accessibility.mdx).
4. **Style with data attributes** -- Use `data-*` attributes for state-driven styling rather than className toggling. See [data-attributes.mdx](./references/data-attributes.mdx) and [styling.mdx](./references/styling.mdx).
5. **Export types** -- Co-locate TypeScript types with the component. See [types.mdx](./references/types.mdx).
6. **Validate** -- Verify: ARIA roles present, keyboard navigation works, TypeScript types exported, design tokens used (no raw color values).
7. **Publish** -- Publish to npm or a registry. See [npm.mdx](./references/npm.mdx) or [registry.mdx](./references/registry.mdx).

## Quick Example

```tsx
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", children, ...props }, ref) => (
    <button
      ref={ref}
      data-variant={variant}
      data-size={size}
      role="button"
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
```

## Decision Tree

- **Building a primitive** -- See [definitions.mdx](./references/definitions.mdx) + [composition.mdx](./references/composition.mdx)
- **Adding polymorphism** -- See [as-child.mdx](./references/as-child.mdx) + [polymorphism.mdx](./references/polymorphism.mdx)
- **Setting up theming** -- See [design-tokens.mdx](./references/design-tokens.mdx)
- **Publishing to a registry** -- See [registry.mdx](./references/registry.mdx) or [npm.mdx](./references/npm.mdx)
- **Writing docs** -- See [docs.mdx](./references/docs.mdx)
- **Marketplace distribution** -- See [marketplaces.mdx](./references/marketplaces.mdx)

## References

- [definitions.mdx](./references/definitions.mdx) - Artifact taxonomy (primitives, components, blocks, templates)
- [principles.mdx](./references/principles.mdx) - Core principles for component design
- [accessibility.mdx](./references/accessibility.mdx) - ARIA, keyboard navigation, WCAG compliance
- [composition.mdx](./references/composition.mdx) - Composable component patterns
- [as-child.mdx](./references/as-child.mdx) - The as-child pattern for element polymorphism
- [polymorphism.mdx](./references/polymorphism.mdx) - Polymorphic component patterns
- [types.mdx](./references/types.mdx) - TypeScript typing patterns for components
- [state.mdx](./references/state.mdx) - Controlled vs uncontrolled state management
- [data-attributes.mdx](./references/data-attributes.mdx) - Using data attributes for styling and state
- [design-tokens.mdx](./references/design-tokens.mdx) - Design token systems and theming
- [styling.mdx](./references/styling.mdx) - Component styling approaches
- [registry.mdx](./references/registry.mdx) - shadcn-style registry distribution
- [npm.mdx](./references/npm.mdx) - Publishing components to npm
- [marketplaces.mdx](./references/marketplaces.mdx) - Component marketplace distribution
- [docs.mdx](./references/docs.mdx) - Writing component documentation
