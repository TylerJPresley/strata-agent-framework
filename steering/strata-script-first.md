# Script first

Intent: mechanical work goes to deterministic scripts; models decide and design.
Applies: when a task is work a program can decide.

- Anything a program can count, list, search, compare, lint, audit, or verify goes to a deterministic script (`~/.agents/skills/strata-lifecycle/scripts/*.mjs` or project `gate.mjs`); spend model tokens on judgment and design.
- Check `~/.agents/skills/strata-lifecycle/scripts/` and `_internal/tools/` for an existing script before writing a new one, and save reusable project helpers in `_internal/tools/`.
- Turn every mechanically checkable rule into a script check, lint rule, or gate criterion.
- Mandatory Read Gate: check the script inventory in `~/.agents/skills/strata-lifecycle/references/structure.md` (Section 5) before running manual verification or git operations.
