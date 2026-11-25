# Structure: Repository & Project Anatomy

Intent: define the exact directory layout of `~/.agents`, the required file anatomy of every project repository, and how each concern lives in one home.
Applies: when maintaining `~/.agents`, bootstrapping or auditing a project repository, or resolving where a rule, state artifact, or script lives.

## 1. Layout of the Strata Agent Framework & Deployed Harnesses

Strata Agent Framework organizes all capabilities into self-contained skills (`skills/strata-*/`), specialist subagents (`agents/strata-*.md`), and always-on Ring 1 conductors (`steering/strata-*.md` for Kiro; a managed `<!-- STRATA:START --> ... <!-- STRATA:END -->` block in `AGENTS.md`, `CLAUDE.md`, `QWEN.md`, `GEMINI.md`, or `SOUL.md` for Pi, Claude Code, Qwen Code, Gemini CLI, OpenCode, Codex, and Hermes).

```text
strata-agent-framework/
├── templates/AGENTS.md # Compiled Ring 1 conductor block (deployed into AGENTS.md / CLAUDE.md / QWEN.md / GEMINI.md / SOUL.md)
├── steering/           # Ring 1: 18 atomic always-on rules for Kiro (Intent / Applies + Mandatory Read Gates)
├── agents/             # Ring 2: Per-app subagent definitions compiled from agents/prompts/ by scripts/sync-agents.mjs
│   ├── prompts/        # Canonical prompt sources (Director + 7 Specialists)
│   ├── kiro/           # Kiro JSON permission templates (strata-*.json)
│   ├── pi/             # Pi subagents with Pi tool names & extension exclusions (strata-*.md)
│   ├── claude/         # Claude Code subagents with Claude tool names (strata-*.md)
│   ├── qwen/           # Qwen Code subagents with Qwen tool names & color enum (strata-*.md)
│   └── opencode/       # OpenCode subagents (strata-*.md)
├── hooks/              # Kiro SessionStart handoff hook (strata-handoff-start.json)
├── skills/             # Ring 2 & Ring 3: Self-contained capability routers (SKILL.md + references/ + assets/ + scripts/)
│   ├── strata-blueprints/       # 3-layer specification standard, guides, templates, linter, and publish tool
│   ├── strata-lifecycle/        # Master lifecycle router:
│   │   ├── references/          # vision.md, structure.md, lifecycle.md, roles-and-standing-rules.md, engineering-craft.md
│   │   ├── assets/              # Starter templates (AGENTS, CONTRIBUTING, README, gate.mjs, plan, handoff, discovery)
│   │   └── scripts/             # verify-plan.mjs, test-diff.mjs, progress.mjs, lessons.mjs, research-index.mjs, push.mjs, ctx.mjs
│   ├── strata-security-audit/   # references/{security-and-audit.md, audit-ecosystems.md} + scripts/audit.mjs
│   ├── strata-diagnosing-bugs/  # Fast-feedback bug reproduction & root-cause workflow
│   ├── strata-optimization-loop/# Measure-change-verify optimization loop
│   └── strata-teach/            # Primary-source spaced-retrieval teaching workspace
├── scripts/            # Repo maintainer scripts (distribute.mjs, sync-skill.mjs, version-check.mjs)
└── tests/              # Repo unit test suite (*.test.mjs — never distributed to target harnesses)
```

## 2. Standard Project Repository Anatomy

Every project repository separates human governance, agent execution rules, product specifications, and ephemeral working state into distinct homes. Neither file copies another:

| Path | Owner / Writer | Purpose |
|------|----------------|---------|
| `docs/blueprints/` | `strata-architect` (with Owner approval) | Product specifications in `strata-blueprints` format (`sbp-vision.md`, `sbp-structure.md`, `sbp-detail-<part>.md`, or single blueprint file) plus `questions.md`. Configurable in `AGENTS.md` via `Strata Blueprints Directory:`. |
| `AGENTS.md` | `documenter` (only on Owner direction) | Agent execution rules: exact build/test/lint commands with flags, tech stack, directory map, conventions, license allow-list (`Licenses allowed:`), and boundaries (`Always`, `Ask first`, `Never`). Links to `CONTRIBUTING.md`. |
| `CONTRIBUTING.md` | `documenter` (with Owner approval) | Human workflow and governance binding every contributor (human or agent): `## Git` branch model (`gitflow` or `trunk only`), engineer branch pattern (`dev/<engineer>`), PR checklist, testing bar, and dependency rules. |
| `README.md` | `documenter` | For people: what the project is, installation, and usage. Carries the bold agents pointer line right after the title linking to `AGENTS.md` and `CONTRIBUTING.md`. |
| `gate.mjs` | `implementer` (reviewed by `reviewer`) | Executable root project quality gate (`node gate.mjs`). Runs typecheck, lint, and tests; exits `0` on pass. Any loosening requires explicit Owner approval. |
| `_internal/` | All agents (by write scope) | Gitignored working folder ("the thinking folder") holding cross-session continuity and verification verdicts. Never shipped. |

## 3. Bootstrapping Missing Project Files

When starting work in a project that lacks `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, or `gate.mjs`:

1. **Name and ask first:** Name the missing file and offer to create it from `~/.agents/skills/strata-lifecycle/assets/`. Never write a starter file without the Owner's explicit yes.
2. **Load the template and guide:**
   - For `AGENTS.md`: read `~/.agents/skills/strata-lifecycle/assets/agents-guide.md` and copy `~/.agents/skills/strata-lifecycle/assets/AGENTS.template.md`. Include `Licenses allowed:` with accepted SPDX IDs for `audit.mjs`.
   - For `CONTRIBUTING.md`: read `~/.agents/skills/strata-lifecycle/assets/contributing-guide.md` and copy `~/.agents/skills/strata-lifecycle/assets/CONTRIBUTING.template.md`.
   - For `README.md`: read `~/.agents/skills/strata-lifecycle/assets/readme-guide.md` and copy `~/.agents/skills/strata-lifecycle/assets/README.template.md`.
   - For `gate.mjs`: copy `~/.agents/skills/strata-lifecycle/assets/gate.template.mjs` and populate the project's real checks.
3. **Fill from real project sources:** Inspect `package.json`, build files, and existing docs to fill every placeholder. Ask once for any fact not present in the repo.
4. **Resolve missing Git facts:** When a git repo's `CONTRIBUTING.md` lacks a `## Git` section, ask the Owner in one round of at most three questions with recommended defaults:
   - `1.` Branch model: `a*` gitflow (`main` + `develop` + `dev/<engineer>`) or `b` trunk only (`main` + `dev/<engineer>`).
   - `2.` Release and integration branch names (default: `main` and `develop`).
   - `3.` Engineer branch pattern (default: `dev/<engineer>` derived from `git config user.name`).
   Write the confirmed answers to `## Git` in `CONTRIBUTING.md`.
5. **Shared Markdown rules for project files:**
   - Structure comes from headings; bold and italics carry no structural weight (except the bold agents pointer line at the top of `README.md`).
   - Backticks wrap only real identifiers, paths, and runnable commands.
   - Setup, build, test, and lint commands live once in `AGENTS.md`; `README.md` and `CONTRIBUTING.md` link to `AGENTS.md` rather than duplicating commands.

## 4. The Thinking Folder (`_internal/`)

All working state lives inside `<project>/_internal/` (gitignored), never in `/tmp` or scattered in the repo root. The test for what stays in `_internal/`: **a future session would otherwise have to pay tokens or time to recreate it.**

```text
<project>/_internal/
├── handoff.md          # Short active state note (<6000 chars) read at session start (managed via progress.mjs)
├── decisions.md        # Append-only log: one dated line per agent decision with reason
├── lessons.md          # Recurring mistake tracker (managed via lessons.mjs; promoted at count >= 3)
├── plans/              # Active feature plans and independent verification verdicts
│   ├── <slug>.md       # Feature plan written by Planner
│   ├── <slug>.criteria # Runnable acceptance criteria (name :: command) checked by verify-plan.mjs
│   ├── <slug>.review.md   # Independent Reviewer verdict (first line PASS or FAIL)
│   ├── <slug>.security.md # Security Reviewer report (first line PASS, FAIL, or ESCALATE)
│   └── archive/        # Closed or dropped plans moved here upon feature completion
├── proposals/          # Proposed steering/skill/script improvements waiting for Owner approval
├── research/           # Durable research cache (managed via research-index.mjs)
│   ├── index.md        # Generated index of all cached sources and findings
│   ├── sources/        # Fetched external docs or local file snapshots with frontmatter & sha256
│   └── findings/       # Synthesized answers citing source slugs in `from:` frontmatter
├── tools/              # Reusable project-specific test/verification helpers (e.g., loopback fakes, pty drivers)
├── scratch/            # Temporary working files and isolated HOME environments (cleared when done)
└── backups/            # Pre-edit backups of files outside the project repo (cleared when done)
```

## 5. Deterministic Scripts (`~/.agents/skills/strata-lifecycle/scripts/`)

Run scripts from the target project's working directory (`node ~/.agents/skills/strata-lifecycle/scripts/<script>.mjs`):

| Script | Purpose | Command |
|--------|---------|---------|
| `verify-plan.mjs` | Executes a plan's `.criteria` file and prints a pass/fail summary (logs full output). | `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <plan-slug>` |
| `test-diff.mjs` | Lists existing tests modified in a commit range so the Reviewer can verify against the plan. | `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs [--from HEAD~N] [--to HEAD]` |
| `audit.mjs` | Scans dependencies, licenses, install scripts, secrets, and code patterns into `_internal/scratch/audit/`. | `timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs` |
| `progress.mjs` | Updates or checks `_internal/handoff.md` state. | `node ~/.agents/skills/strata-lifecycle/scripts/progress.mjs` |
| `lessons.mjs` | Records recurring friction (`add`), lists patterns seen ≥3 times (`list ready`), or marks promoted (`promote`). | `node ~/.agents/skills/strata-lifecycle/scripts/lessons.mjs list ready` |
| `research-index.mjs` | Rebuilds and validates `_internal/research/index.md` frontmatter and dates. | `node ~/.agents/skills/strata-lifecycle/scripts/research-index.mjs [--check]` |
| `steering-lint.mjs` | Lints `steering/` (`Intent:`/`Applies:` headers, duplicate 60+ char lines) and `skills/` frontmatter. | `node ~/.agents/skills/strata-lifecycle/scripts/steering-lint.mjs` |
| `push.mjs` | Safely pushes a completed branch to `origin` from a clean tree (refuses `main`/`develop` without `--integrate`, never forces). | `node ~/.agents/skills/strata-lifecycle/scripts/push.mjs [--dry-run] [--integrate]` |
| `ctx.mjs` | Reports active session context utilization percentage and reset recommendation. | `node ~/.agents/skills/strata-lifecycle/scripts/ctx.mjs` |
