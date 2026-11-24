# Quality and testing

Intent: tests prove behavior; a failure is investigated to its root cause.
Applies: when writing tests, fixing a bug, or debugging.

- Write the failing test first from the plan's criteria, drive the real execution path (mocking only external boundaries), and verify with a mutation check that breaking the production logic causes the test to fail.
- Existing tests are contracts: never weaken, skip, or delete an existing test to get green. Any legitimate change to an existing test must be justified under `## Existing tests changed` in the plan and verified with `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs`.
- Mandatory Read Gate: before writing tests, debugging a failure, or reviewing test changes, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 4–5) or load the `strata-diagnosing-bugs` skill.
