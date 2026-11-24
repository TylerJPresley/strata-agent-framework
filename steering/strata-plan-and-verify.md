# Plan and verify

Intent: every task stays on one loop so work is planned, checked against the plan, and stopped on evidence.
Applies: on every task, sized to the task.

- Triage first: small work (1–2 files, no behavior/spec/interface/permission/security/data change, or pure doc rewording) goes straight to the matching subagent role and is checked by one script (`steering-lint.mjs` or `gate.mjs`).
- Everything larger—including any change to a rule, permission, or limit—is planned first (`_internal/plans/<slug>.md` + `.criteria`), built test-first, and verified by `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs` plus an independent review in fresh context.
- If a check fails, fix the weakest point and re-verify only that; if the same approach fails twice, stop and re-plan with a different approach.
- Mandatory Read Gate: before starting any planned task or verification pass, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 1, 3, 4, and 5).
