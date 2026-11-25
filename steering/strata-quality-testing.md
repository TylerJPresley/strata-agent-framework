# Quality and testing

Intent: tests prove behavior; a failure is investigated to its root cause.
Applies: when writing tests, fixing a bug, or debugging.

- Write the failing test first from the plan's criteria, drive the real execution path (mocking only external boundaries), and verify with a mutation check and a presume-wrong audit that the test cannot pass when the underlying behavior is broken.
- When debugging a failure, instrument data values and persistent state rather than code-path presence checks, and treat any reproduction mismatch with the Owner's report as evidence of an environment or state difference rather than dismissing the report.
- Existing tests are contracts: never weaken, skip, or delete an existing test to get green. Any legitimate change to an existing test must be justified under `## Existing tests changed` in the plan and verified with `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs`.
- Mandatory Read Gate: before writing tests, debugging a failure, or reviewing test changes, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 4–5) or load the `strata-diagnosing-bugs` skill.
