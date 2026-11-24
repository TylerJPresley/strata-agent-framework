# Session tracking

Intent: the handoff carries state, so a new session resumes where the last one stopped with zero context.
Applies: at the start and end of every session and after each finished work item.

- Start every session in a project by reading `_internal/handoff.md`.
- Update `_internal/handoff.md` (`node ~/.agents/skills/strata-lifecycle/scripts/progress.mjs`) after each completed work item, before stopping, and whenever context fullness (`node ~/.agents/skills/strata-lifecycle/scripts/ctx.mjs`) reaches 25%–30%.
- Keep the handoff concise (<6000 chars): goal, current state, concrete next step, pending decisions, and links to active plans and research.
- Mandatory Read Gate: before writing or updating a handoff, read `~/.agents/skills/strata-lifecycle/references/roles-and-standing-rules.md` (Section 5.1) and `~/.agents/skills/strata-lifecycle/assets/handoff-template.md`.
