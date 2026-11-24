# Project files

Intent: each concern has one home, so a rule lives in one place and stays consistent.
Applies: when starting work in a project, and before committing, testing, adding a dependency or documenting.

- Keep each concern in one file without duplication: `docs/blueprints/` holds product specs; `README.md` explains what the project is and how to use it; `CONTRIBUTING.md` holds human governance and `## Git` rules; `AGENTS.md` holds agent execution commands, stack, map, license allow-list, and boundaries.
- Agents read `AGENTS.md` and `CONTRIBUTING.md` at session start and modify `AGENTS.md` only when explicitly directed by the owner.
- Mandatory Read Gate: when a project is missing `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `gate.mjs`, or its `## Git` section, read `~/.agents/skills/strata-lifecycle/references/structure.md` (Sections 2–3) and offer the starter from `~/.agents/skills/strata-lifecycle/assets/` before writing.
