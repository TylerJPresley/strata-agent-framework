# Strata Agent Framework

Harness-agnostic framework for AI coding agents—3-ring progressive context, living blueprints, specialist subagents, and deterministic verification gates.

Overview for people: [README.md](README.md).

## Commands

- Gate (lint + all unit tests): `node gate.mjs`
- Test (all): `node --test tests/*.test.mjs`
- Test (single): `node --test tests/<name>.test.mjs`
- Steering & skill lint: `node skills/strata-lifecycle/scripts/steering-lint.mjs --steering-dir steering --skills-dir skills`
- Distribute (interactive checklist): `node scripts/distribute.mjs`
- Distribute (non-interactive / saved targets): `node scripts/distribute.mjs --yes`
- Distribute (verify deployed targets): `node scripts/distribute.mjs --check`
- Sync embedded `strata-blueprints`: `node scripts/sync-skill.mjs ../strata-bp/skills/strata-blueprints --target ./skills`

Pre-flight: run `node gate.mjs` before every commit, and `node scripts/distribute.mjs --check` after distributing.

## Stack

Node.js 20+ (ES modules `.mjs`, zero external `npm` dependencies, built-in `node:test` runner) and Markdown (`.md`).

## Map

- `steering/` — Ring 1 atomic steering rules for Kiro (`strata-*.md`).
- `templates/AGENTS.md` — Ring 1 compiled global template distributed into `<!-- STRATA:START --> ... <!-- STRATA:END -->` blocks in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
- `agents/` — Ring 2 specialist subagent Markdown contracts (`strata-*.md`).
- `agents-kiro/` — Kiro JSON permission templates compiled with `agents/*.md` into `~/.kiro/agents/strata-*.json`.
- `skills/` — Self-contained Ring 2 & Ring 3 skills (`strata-blueprints`, `strata-lifecycle`, `strata-security-audit`, `strata-diagnosing-bugs`, `strata-optimization-loop`, `strata-teach`), each holding its own `SKILL.md`, `references/`, `assets/`, and runtime `scripts/`.
- `hooks/` — Session hooks (`strata-handoff-start.json`).
- `scripts/` — Repository maintainer tools (`distribute.mjs`, `sync-skill.mjs`, `version-check.mjs`, `install.mjs`).
- `tests/` — Repository unit test suite (`*.test.mjs` — never distributed to target harnesses).

## Conventions

- All runtime and maintainer scripts use zero-dependency Node.js ES modules (`.mjs`) and array-based `execFileSync`/`spawnSync` without a shell.
- Every test in `tests/*.test.mjs` creates temporary fixtures inside `os.tmpdir()` and cleans them up on exit (`gate.mjs` fails if any test leaves a temp entry behind).
- `skills/strata-lifecycle/references/vision.md` is the single source of truth for the framework `Version:` and `Embedded Strata Blueprints:` version, verified mechanically by `scripts/version-check.mjs`.

## Boundaries

- Always: run `node gate.mjs` before committing; keep runtime scripts inside their owning `skills/strata-*/scripts/` folder and unit tests inside `tests/`.
- Ask first: changing `AGENTS.md`, `templates/AGENTS.md`, `steering/*.md`, `agents/*.md`, or loosening `gate.mjs`.
- Never: commit secrets, personal paths (`/home/...`, `file:///...`), or `_internal/` working files; never add external `npm` runtime dependencies; never edit `skills/strata-blueprints/` directly without syncing from the upstream `strata-blueprints` repository.

## PR review guidelines

- Flag: failing or missing `node gate.mjs` checks, changed or weakened test assertions in `tests/*.test.mjs`, external dependencies, secrets or personal paths, out-of-scope changes, or version mismatches across `vision.md`, `package.json`, `CHANGELOG.md`, and `README.md`.
- Ignore: generated `.strata-manifest.json` timestamps in deployed local harnesses.

Licenses allowed: MIT

Git, changelog, dependencies and review rules: [CONTRIBUTING.md](CONTRIBUTING.md).
