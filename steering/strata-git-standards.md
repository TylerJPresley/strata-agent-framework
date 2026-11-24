# Git standards

Intent: a small, tested, readable history, where each commit stands on its own.
Applies: whenever an agent commits, branches, merges or pushes.

- Commit at each verified seam defined in the plan, staging files explicitly by name with a Conventional Commit message (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`) citing the blueprint section. Blueprint edits and the code realizing them are separate commits.
- Read the `## Git` section of the project's `CONTRIBUTING.md` before branching or committing. Never commit directly to `main` or `develop` without explicit owner command, never create git tags, and never rewrite pushed history.
- Planned work runs on local branch `feature/<plan-slug>` cut from `dev/<engineer>`, squash-merges into `dev/<engineer>` once verified, and pushes via `node ~/.agents/skills/strata-lifecycle/scripts/push.mjs`.
- Any change to `gate.mjs` must pass independent review, which fails on any unapproved loosening.
- Mandatory Read Gate: before branching, merging, modifying `gate.mjs`, or pushing, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 4–6).
