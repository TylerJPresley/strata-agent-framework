# Script first

Intent: mechanical work goes to deterministic scripts; models decide and design.
Applies: when a task is work a program can decide.

- Anything a program can count, list, search, compare, lint, audit, or verify goes to a deterministic script (`~/.agents/skills/strata-lifecycle/scripts/*.mjs` or project `gate.mjs`); spend model tokens on judgment and design.
- Check `~/.agents/skills/strata-lifecycle/scripts/` and `_internal/tools/` for an existing script before writing a new one, and save reusable project helpers in `_internal/tools/`.
- Turn every mechanically checkable rule into a script check, lint rule, or gate criterion.
- Be direct and never waste execution cycles boiling the ocean: run existing deterministic scripts first, batch native read and search tools upfront (finishing cross-checks on loaded files before compacting context so you never re-read the same file twice), verify the requested scope directly without spinning through speculative edge permutations, and record any uninspected surface under `Not done` (and in the `_internal/` artifact) so the owner decides whether a deeper pass is worth the time.
