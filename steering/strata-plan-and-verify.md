# Plan and verify

Intent: every task stays on one loop so work is planned without scope inflation, checked against the plan, and stopped on evidence.
Applies: on every task, sized to the task.

- Triage first: small work (1–2 files, no behavior/spec/interface/permission/security/data change, or pure doc rewording) executes directly and is checked by one script (`steering-lint.mjs` or `gate.mjs`).
- Everything larger—including any change to a rule, permission, or limit—is planned first (`_internal/plans/<slug>.md` + `.criteria`), built test-first, and verified by `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs` plus an independent review in fresh context.
- Keep plans strictly scoped to the owner's explicit requirements and cited blueprint IDs (no unrequested extras or scope inflation), never delegate understanding (synthesize before briefing), and execute or delegate implementation step-by-step with visible progress per seam rather than one long run.
- Before declaring done, self-audit the diff and green tests presuming them wrong (and grep all read/call sites for any new option or parameter to prevent dead switches). If a check fails, fix the weakest point and re-verify only that; if the same approach fails twice (or after 3 review rounds), stop and re-plan or escalate.
- Mandatory Read Gate: before starting any planned feature or independent verification pass, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 1, 3, 4, and 5).
