# Recipe And Cookbook Quality Checklist

Use this checklist after drafting and before final handoff.

## Scope Correctness

- Confirm a recipe solves exactly one outcome.
- Confirm a cookbook covers an end-to-end use case.
- Confirm cookbook content does not depend on cookbook-level prerequisites.

## Metadata Correctness

- Confirm each recipe has `id`, `name`, `description`, and `tags`.
- Confirm prerequisite recipe ids exist and are minimal.
- Confirm each template uses valid `recipeIds` in intended order.
- Confirm names and descriptions are specific enough to scan quickly on `/resources`.

## Execution Quality

- Confirm every command block is copy-pastable.
- Confirm user-specific values are placeholders (`<...>`), not guessed values.
- Confirm auth/profile requirements appear before commands that depend on them.
- Confirm there are no hidden assumptions between steps.

## Readability Quality

- Confirm sections are clearly numbered in execution order.
- Confirm each step has short explanatory context before commands.
- Confirm text remains understandable without requiring code execution.
- Confirm reference links are minimal and relevant.

## Cookbook Composition Quality

- Confirm `rawMarkdown` concatenation uses `\n\n---\n\n`.
- Confirm JSX render order matches `template.recipeIds`.
- Confirm every imported markdown component is rendered exactly once unless intentional.
