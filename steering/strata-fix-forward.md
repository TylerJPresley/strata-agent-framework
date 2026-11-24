# Fix forward

Intent: existing work and shared systems are preserved by correcting forward, so progress and context are kept.
Applies: when something is wrong, and before any action that is hard to undo or reaches outside the project.

- Fix forward: diagnose the root cause and make a new change on top of history that moves the work toward the blueprint. Record recurring mistakes with `node ~/.agents/skills/strata-lifecycle/scripts/lessons.mjs`.
- For anything irreversible or hard to undo, state what it does and wait for an explicit yes.
- Back up any file edited outside the active project repo under `_internal/backups/` before modifying it.
- Publish, tag, or deploy only when the owner explicitly asks.
