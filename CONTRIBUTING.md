# Contributing to Strata Agent Framework

Rules and execution commands for AI agents live in [AGENTS.md](AGENTS.md). What follows binds people and agents alike.

## How to Contribute

- **Bugs and small fixes:** Open a pull request directly with a clear reproduction or test case in `tests/*.test.mjs`.
- **Rule, skill, or agent changes:** Open an issue first to discuss the behavioral trade-off and token budget impact before changing `AGENTS.md`, `steering/`, `agents/`, or `skills/`.
- **AI assistance:** AI-assisted pull requests are welcome. Disclose the harness/model used in the pull request description, and confirm that a human reviewed the diff and verified `node gate.mjs`.

## Git

- Branch model: trunk only
- Release branch: `main`
- Engineer branches: `dev/<engineer>` (or fork branches for external contributors)
- Each logical checklist item in a plan is one commit using Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Maintainer integration pushes run through `node skills/strata-lifecycle/scripts/push.mjs --integrate` from a clean tree.
- Never force-push or delete remote branches; release tags are created by the repository owner.

## Verification Checklist

Before opening a pull request or integrating to `main`:

- [ ] `node gate.mjs` passes with zero warnings or leftover temporary files.
- [ ] `node scripts/distribute.mjs --dry-run` (and `node scripts/distribute.mjs --check` when deployed) succeeds cleanly.
- [ ] Every changed or added script behavior has a matching test in `tests/*.test.mjs`.
- [ ] Always-on steering stays within the Ring 1 token budget verified by `node skills/strata-lifecycle/scripts/steering-lint.mjs`.
- [ ] No secrets, personal paths, or machine-local state are included in the diff.
