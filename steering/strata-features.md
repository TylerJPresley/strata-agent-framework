# Features

Intent: work is organized into self-standing features, each carried by one plan with a clear outcome.
Applies: when scoping, planning, closing or releasing work.

- Larger work is organized into self-standing features, each carried by one plan (`_internal/plans/<slug>.md`) with a one-sentence outcome. When a feature closes, the system works cleanly without needing any later feature.
- A feature too large for one plan is split into smaller self-standing features; the ordered plans form the roadmap.
- Closing a feature requires passing criteria, independent review (and real-environment verification if user-visible behavior changed), a changelog entry, an archived plan, an updated handoff, and a squash-merge to the engineer branch.
- Mandatory Read Gate: before scoping, planning, or closing a feature, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 1, 3, and 6).
