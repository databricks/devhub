---
date: 2026-05-18
topic: agent-skills-unification
---

# Unifying Agent Skills with DevHub Templates

## Problem Frame

DevHub templates (recipes, cookbooks, examples) and agent skills both contain implementation guidance -- CLI commands, code patterns, configuration. The content overlaps significantly, causing:

1. **Contradictions** -- recipe says CLI 0.296+, skill says 0.292+. Agents receiving both must reconcile.
2. **Drift** -- when one side updates, the other gets stale. No sync mechanism exists.
3. **Bloated agent prompts** -- agents receive full step-by-step recipe content AND skills covering the same topic. Redundant tokens, conflicting instructions.

PR #95 partially addressed this by adding "skills = source of truth" directives to intent blocks and converting examples to outcome-only. But recipes still send full implementation content to agents, creating the contradiction window.

## Key Decisions

- **Skills are the source of truth** for implementation (CLI commands, code patterns, configuration). Recipe content is authoritative for human-facing tutorials but not for agent prompts.
- **Agent-first does not mean human-hostile.** Humans keep full step-by-step instructions on the web page. The change is what agents receive, not what humans see.
- **Physical file boundary** separates agent content from human content. No section markers or parsing -- different files for different audiences.

## Requirements

**File Structure**

- R1. All template types (recipes, cookbooks, examples) use `goal.md` for the outcome description. This file describes WHAT you'll build, key decisions, services involved, and what the result looks like.
- R2. Recipes have a second file `content.md` containing human-targeted step-by-step instructions. This includes prerequisites (folded in from current `prerequisites.md`) and implementation steps.
- R3. Cookbooks have only `goal.md` (replaces the current `intro.md`). It describes the overall composed app and how the pieces fit together.
- R4. Examples have only `goal.md` (renamed from current `content.md`). Examples are already outcome-only.
- R5. Delete all `prerequisites.md` files. Their content moves into the top of each recipe's `content.md`.

**Agent Prompt Composition**

- R6. Agent prompt for recipes includes only `goal.md` (not `content.md`). Skills handle implementation.
- R7. Agent prompt for cookbooks includes the cookbook's `goal.md` followed by each constituent recipe's `goal.md`. No recipe `content.md` is sent.
- R8. Agent prompt for examples includes only `goal.md` (no behavioral change since examples are already outcome-only, just reads from the renamed file).
- R9. The local bootstrap recipe (`set-up-your-local-dev-environment`) agent prompt also sends only `goal.md`. Skills and the dev-guidelines preamble handle environment verification.

**Human Page Rendering**

- R10. Recipe detail pages render `goal.md` + `content.md` joined together. The outcome description appears at the top, followed by the full step-by-step instructions. Visual separation uses existing `prose-solution` CSS heading borders (h2 gets `border-b` automatically) -- no new components needed.
- R11. Cookbook detail pages keep inline composition: cookbook `goal.md` at top, then each recipe's `goal.md` + `content.md` inlined (same reading experience as today).
- R12. Example detail pages render `goal.md` (no behavioral change, just reads from the renamed file).

**Cookbook Composition**

- R13. `composeCookbookMarkdown()` gains an optional mode parameter (defaulting to current behavior) to compose agent-only output (goals only) vs human output (goals + content). Single function with mode parameter preferred over two separate functions to avoid duplicating ~40 lines of shared composition logic.
- R14. All 5 cookbooks get a `goal.md`. The existing `ai-chat-app/intro.md` becomes `ai-chat-app/goal.md`. The other 4 cookbooks need new `goal.md` files written.
- R20. Cookbook `goal.md` explicitly frames the overall outcome as composed of multiple components and lists the constituent recipe goals. The agent prompt composition function wraps each recipe's `goal.md` with a labeled heading (e.g., "Component: Set Up Model Serving") so agents understand the hierarchy -- big goal at the top, sub-goals below.

**Content Migration**

- R15. For each of the 21 recipes: extract the outcome description from current `content.md` into a new `goal.md`, leave the implementation in `content.md`, fold `prerequisites.md` content into the top of `content.md`. Effort breakdown: 8 recipes have clear outcome intros (easy extraction), 10 dive into steps (need 2-3 sentence outcomes written), 3 need significant writing (Lakehouse Sync CDC, Token Management, Sync Tables).
- R16. For each of the 6 examples: rename `content.md` to `goal.md`.
- R17. The `rag-chat` example's `deployment.md` is implementation-oriented (npm commands, env hydration, workspace ID injection). It should NOT fold into `goal.md`. Since the example points to a GitHub repo and `template/README.md` is the deployment runbook, delete `deployment.md` (it's redundant with the repo README).

**Intent Blocks and Preamble**

- R18. Update `content/intent-recipe.md` to reflect that the agent receives only the goal, not implementation steps. Remove references to "follow the recipe step by step" for the implementation path; instead direct agents to use installed skills.
- R19. Update `content/intent-cookbook.md` similarly -- the agent receives goals for each recipe, not full content.

## Flow Diagram

```
                    Recipe folder
                   /             \
              goal.md          content.md
            (outcome)      (human instructions)
                |                  |
        +-------+-------+         |
        |               |         |
   Agent prompt    Human page  Human page
   (goal only)    (goal + content joined)
        |
        v
   Installed skills
   (implementation)
```

```
                  Cookbook folder
                       |
                    goal.md
                  (overall outcome)
                       |
              +--------+--------+
              |                 |
         Agent prompt      Human page
    (cookbook goal +      (cookbook goal +
     recipe goals)        recipe goals +
              |            recipe content
              v             inlined)
        Installed skills
```

## Success Criteria

- Agent prompts for recipes contain zero implementation details (no CLI commands, no code blocks, no version requirements). Only outcome descriptions and key decisions.
- Human recipe pages render identically to today's experience (same content, same structure, same reading flow) except the outcome section appears prominently at the top.
- No contradictions possible between recipe agent content and skills -- they cover different concerns (scope vs implementation).
- Cookbook agent prompts are significantly shorter (goal descriptions only, not full recipe bodies).

## Scope Boundaries

- **Not changing recipe content for humans.** The step-by-step instructions stay on the web page. We're changing what agents receive, not what humans read.
- **Not syncing content between repos.** Skills and recipe content are maintained independently. They serve different audiences with different formats.
- **Not changing the agent-skills repo.** The incorporate-devhub-recipes branch is a separate workstream. This PR focuses on the DevHub side.
- **Not changing the example template/GitHub repo pattern.** Examples already work well.

## Dependencies / Assumptions

- Agent skills are installed in the user's environment (dev-guidelines already requires this).
- The incorporate-devhub-recipes branch in the agent-skills repo lands independently. It already contains the implementation content that agents need.
- The `goal.md` content for each recipe needs to be written well enough that agents understand the scope without implementation details.

## Resolved Questions

All questions originally deferred to planning have been investigated and resolved:

- **Local bootstrap (R9):** `databricks-core` skill fully covers CLI install (all OS paths), OAuth auth, profile verification, and smoke testing. Actually more comprehensive than the recipe. No special treatment needed.
- **Cookbook composition (R13):** Mode parameter on existing function. Avoids duplicating ~40 lines of shared logic. Backward-compatible default.
- **Recipe outcome boundaries (R15):** 8 recipes have clear outcome intros (easy extraction), 10 dive into steps (need short outcomes written), 3 need significant writing.
- **rag-chat deployment.md (R17):** Implementation-oriented, not outcome-oriented. Redundant with `template/README.md` in the GitHub repo. Delete it.
- **Visual separation (R10):** Existing `prose-solution` CSS heading borders provide natural separation. No new components.

## Next Steps

-> `/ce:plan` for structured implementation planning
