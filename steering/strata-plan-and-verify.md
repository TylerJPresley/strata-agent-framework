# Plan and verify

Intent: every task stays on one loop so work is planned without scope inflation, checked against the plan, and stopped on evidence.
Applies: on every task, sized to the task.

- Triage first with a hard mechanical ceiling: Stage 1 Discovery edits blueprints (`sbp-*.md`, `questions.md`) gated by `strata-blueprints-lint.mjs`; for code/doc work, Small Work (`<= 2` files such as a 1-file fix plus its regression test, or pure doc rewording, with `0` weakened/deleted existing tests and `0` changes to blueprints, `gate.mjs`, `package.json`, permissions, or public interfaces) executes directly and is checked by one script (`steering-lint.mjs` or `gate.mjs`).
- Everything larger is Planned Work (`_internal/plans/<slug>.md` + `.criteria`), built test-first, and verified at close-out by spawning `strata-reviewer` in a fresh subagent context with a blind-artifact brief and running `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs --require-review _internal/plans/<slug>.criteria` (or reporting `UNVERIFIED: no subagent tool` in `Not done` on single-agent harnesses).
- Keep plans strictly scoped to the owner's explicit requirements and cited blueprint IDs (no unrequested extras or scope inflation), never delegate understanding (synthesize before briefing), and execute or delegate implementation step-by-step with visible progress per seam rather than one long run.
- Before declaring done, self-audit the diff and green tests presuming them wrong (and grep all read/call sites for any new option or parameter to prevent dead switches). If a check fails, fix the weakest point and re-verify only that; if the same approach fails twice (or after 3 review rounds), stop and re-plan or escalate.
- Mandatory Read Gate: before starting any planned feature or independent verification pass, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 1, 3, 4, and 5).
