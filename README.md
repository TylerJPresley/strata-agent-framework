# Strata Agent Framework

**AI agents:** start with [AGENTS.md](AGENTS.md) for commands, project map and rules.

Version: `0.1.2` · License: [MIT](LICENSE)

Harness-agnostic framework for AI coding agents—3-ring progressive context, living blueprints, specialist subagents, and deterministic verification gates.

## Table of Contents

- [Why AI Coding Agents Drift—and How Strata Fixes It](#why-ai-coding-agents-driftand-how-strata-fixes-it)
- [How It Works: The Five Pillars](#how-it-works-the-five-pillars)
  - [1. Three Rings of Exposure & Mandatory Read Gates](#1-three-rings-of-exposure--mandatory-read-gates)
  - [2. Spec-Driven Development with Strata Blueprints](#2-spec-driven-development-with-strata-blueprints)
  - [3. The Single Evidence-Gated Development Loop](#3-the-single-evidence-gated-development-loop)
  - [4. Strict Role Separation (Builders Never Grade Their Own Homework)](#4-strict-role-separation-builders-never-grade-their-own-homework)
  - [5. Disk Memory (`_internal/`) & Deterministic Scripts](#5-disk-memory-_internal--deterministic-scripts)
- [Supported Tools & Native Layouts](#supported-tools--native-layouts)
- [Install](#install)
- [Usage](#usage)
- [Core Documentation](#core-documentation)
- [High-Signal Skills](#high-signal-skills)
- [Quality Gate](#quality-gate)
- [Contributing](#contributing)
- [License](#license)

## Why AI Coding Agents Drift—and How Strata Fixes It

AI coding agents start fast and break down as a project grows. You add more rules to `AGENTS.md` or `CLAUDE.md`, keep prompting in long sessions, and switch between Claude Code, Gemini CLI, Kiro, Antigravity, or Codex. Soon the cracks appear:

- **Attention dilution:** Once always-on instructions pass ~3,000 tokens, models start selectively dropping constraints.
- **Unpinned specs:** What looks like a coding bug is almost always an unstated requirement the agent guessed silently.
- **Self-graded homework:** An agent tasked with both writing and verifying code will happily pass unit tests with convoluted logic—or weaken an existing test assertion just to get a green check.
- **Stateless amnesia:** When architectural decisions, plans, and lessons live in chat history, every context reset or harness switch wipes the slate clean.

**You cannot prompt-engineer your way out of statelessness and attention dilution. Strata replaces prompt hope with artifact and constraint engineering:**

1. **Keep always-on context razor-thin (~3k tokens)** and gate deep methodology behind **Mandatory Read Gates** that load only when needed.
2. **Pin intent in a living 3-layer blueprint** ([Strata Blueprints](https://stratablueprints.com)) before writing code—agents never guess an unstated requirement (`Not supplied:`), and a deterministic impact linter traces every spec change down to the exact rules it reopens.
3. **Separate the spec keeper, the planner, the builder, and the verifier** into isolated specialist subagents with hard write boundaries.
4. **Move state out of chat and onto disk (`_internal/`)** while shifting every countable, repeatable check out of model tokens and into zero-dependency Node.js (`.mjs`) verification scripts.

---

## How It Works: The Five Pillars

### 1. Three Rings of Exposure & Mandatory Read Gates

Models treat passive `"see docs/foo.md"` links as optional suggestions, yet stuffing every procedure into always-on steering bloats context and degrades compliance (`A1`, `A6`). Strata organizes guidance into three concentric rings so agents pay only for the context a task requires:

| Ring | Location | Exposure | Role |
|------|----------|----------|------|
| **Ring 1: Always-On Posture** | [`AGENTS.md`](AGENTS.md) & [`steering/*.md`](steering/) | **100% (Every turn, ~2k–4.1k tokens)** | Non-negotiable behavioral invariants, safety boundaries, and **Mandatory Read Gates** into Ring 3. |
| **Ring 2: Triggered Entry Points** | [`agents/*.md`](agents/) & [`skills/*/SKILL.md`](skills/) | **Descriptions at startup; body on demand** | 8 specialist subagent contracts and 6 consolidated, self-contained high-signal skills (`A5`). |
| **Ring 3: Self-Contained Skill Docs & Scripts** | [`skills/*/references/`](skills/), [`assets/`](skills/), & [`scripts/*.mjs`](skills/) | **0% until read or executed** | Authoritative lifecycle methodology, domain engineering checklists, starter templates, and deterministic `.mjs` scripts bundled inside each owning skill. |

### 2. Spec-Driven Development with Strata Blueprints

A stale specification is worse than no specification (`A3`). Strata embeds **[Strata Blueprints](https://stratablueprints.com)** ([`skills/strata-blueprints/`](skills/strata-blueprints/SKILL.md), maintained upstream in [`TylerJPresley/strata-blueprints`](https://github.com/TylerJPresley/strata-blueprints)) as its core specification engine.

Every project's specification lives in `docs/blueprints/` across three zoom layers:
- **Layer 1: Vision (`sbp-vision.md`)** — Why the subject exists, target audience, Given/When/Then value scenarios (`vision-3.1`), success measures, and limits.
- **Layer 2: Structure (`sbp-structure.md`)** — How the system divides into parts, seams between parts, and scenario paths that realize Vision IDs.
- **Layer 3: Detail (`sbp-detail-<part>.md`)** — Rules, concepts/states, limits, and construction for a single part.

Unknowns are explicitly marked `Not supplied:`—agents are forbidden from guessing them and instead interview the Owner in structured discovery rounds. When any requirement changes, `strata-blueprints-lint.mjs --impact <id>` mechanically identifies every downstream path and rule that must be revisited.

### 3. The Single Evidence-Gated Development Loop

Every task flows through one predictable loop ([`skills/strata-lifecycle/references/lifecycle.md`](skills/strata-lifecycle/references/lifecycle.md)):

```mermaid
flowchart LR
    T["Triage\n(Small vs. Planned)"] -->|Small Work| Fast["Fast Path\nSingle check + commit"]
    T -->|Planned Feature| S1["1. Discovery & Blueprint\n(strata-keeper)"]
    S1 --> S2["2. Systems Map & Plan\n(strata-planner)"]
    S2 --> S3["3. Test-First Build\n(strata-implementer)"]
    S3 --> S4["4. Independent Review\n(strata-reviewer / security)"]
    S4 -->|PASS| S5["5. Close-Out & Squash-Merge\n(strata-director / documenter)"]
    S4 -->|FAIL / 2x Strike| S2
```

- **Stage 1 (Discovery & Grilling):** `strata-keeper` interviews the Owner for product decisions, updates the blueprint, and runs `strata-blueprints-lint.mjs`.
- **Stage 2 (Systems Mapping & Pinned Planning):** `strata-planner` maps callers, second-order effects, and predicted file touches, then writes `_internal/plans/<slug>.md` and runnable acceptance criteria (`_internal/plans/<slug>.criteria`). **Every decision and edge case is pinned in the plan; the Implementer decides nothing.**
- **Stage 3 (Red → Green → Mutate Build):** On `feature/<slug>`, `strata-implementer` writes the failing test first, builds the code to pass, mutates production logic to prove the test actually catches regressions, and commits at each logical seam after `node gate.mjs` and `verify-plan.mjs` pass. If an approach fails twice (**Two-Strike Rule**), execution stops for re-planning.
- **Stage 4 (Fresh-Context Verification):** `strata-reviewer` audits the diff in a fresh context window, runs `test-diff.mjs` to ensure existing tests were not silently weakened, verifies `gate.mjs` was not loosened, and runs real-environment checks in an isolated `_internal/scratch/` sandbox.
- **Stage 5 (Close-Out & Safe Git Integration):** `strata-documenter` updates docs, and `strata-director` archives the plan, updates `_internal/handoff.md`, squash-merges `feature/<slug>`, and pushes via `push.mjs`.

### 4. Strict Role Separation (Builders Never Grade Their Own Homework)

One global specialist roster ([`agents/`](agents/)) governs every project with strict write isolation ([`skills/strata-lifecycle/references/roles-and-standing-rules.md`](skills/strata-lifecycle/references/roles-and-standing-rules.md)):

| Specialist | Role | Allowed Writes | Hard Denies |
|------------|------|----------------|-------------|
| [`strata-director`](agents/strata-director.md) | Team lead & router | `_internal/handoff.md`, `decisions.md`, `lessons.md`, `plans/archive/**` | Source code, tests, blueprints, repo docs |
| [`strata-keeper`](agents/strata-keeper.md) | Blueprint guardian | `**/sbp-*.md`, `**/*blueprint*.md`, `**/questions.md` | Never guesses `Not supplied:`, no code/tests/plans |
| [`strata-planner`](agents/strata-planner.md) | Systems designer | `_internal/plans/<slug>.md`, `<slug>.criteria`, `proposals/**` | No shell execution, no code/test/doc edits |
| [`strata-implementer`](agents/strata-implementer.md) | Test-first builder | Source code, tests, `gate.mjs`, commits on `feature/<slug>` | Blueprints, `AGENTS.md`, `README.md`, `*.review.md` |
| [`strata-reviewer`](agents/strata-reviewer.md) | Independent verifier | `_internal/plans/<slug>.review.md`, `_internal/scratch/**` | Read-only on source, tests, blueprints, plans, docs |
| [`strata-security-reviewer`](agents/strata-security-reviewer.md) | Supply-chain & security auditor | `_internal/plans/<slug>.security.md`, `_internal/scratch/audit/**` | Read-only on project files; judges `audit.mjs` hits |
| [`strata-researcher`](agents/strata-researcher.md) | Primary-source investigator | `_internal/research/**` (sources, findings, SHA-256 index) | Never edits code, specs, plans, or repo docs |
| [`strata-documenter`](agents/strata-documenter.md) | Documentation keeper | `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/**` | Blueprints (`sbp-*.md`), source code, tests |

### 5. Disk Memory (`_internal/`) & Deterministic Scripts

Continuity lives on disk in `<project>/_internal/` (gitignored, never in chat or `/tmp`):
- **`handoff.md` (`progress.mjs` & `ctx.mjs`):** A `<6000`-character state checkpoint read automatically at session start and updated before context fullness crosses `30%`.
- **`lessons.md` (`lessons.mjs`):** Tracks recurring friction. When a pattern is recorded 3 times (`READY`), a retrospective promotes it into a deterministic script check first, a doc/skill second, and an always-on steering rule only as a last resort.
- **`research/` (`research-index.mjs`):** Durable cache of primary sources and cited findings verified by SHA-256 hash so future sessions never pay tokens to re-research the same API or library.
- **Zero-Dependency Verification Scripts ([`skills/strata-lifecycle/scripts/`](skills/strata-lifecycle/scripts/) & [`skills/strata-security-audit/scripts/`](skills/strata-security-audit/scripts/)):** Pure Node.js (`.mjs`) tools (`verify-plan.mjs`, `test-diff.mjs`, `audit.mjs`, `steering-lint.mjs`, `push.mjs`, `progress.mjs`, `lessons.mjs`, `research-index.mjs`, `ctx.mjs`) execute all mechanical checks with zero external `npm` packages.

---

## Supported Tools & Native Layouts

`node scripts/distribute.mjs` deploys directly into each selected tool's native directory in the exact format that tool expects, rewriting internal skill and script paths to that tool's own directory so every deployment is 100% self-contained:

| Target Name | Default Path | Ring 1 Conductor (Always-On) | Ring 2 Specialist Subagents | Ring 2 & 3 Self-Contained Skills | Hooks |
|-------------|--------------|------------------------------|-----------------------------|----------------------------------|-------|
| **`kiro`** | `~/.kiro` | `steering/strata-*.md` (18 atomic rules) | `agents/strata-*.json` (compiled JSON with permissions) | `skills/strata-*/` (`SKILL.md`, `references/`, `assets/`, `scripts/`) | `hooks/strata-handoff-start.json` |
| **`pi`** | `~/.pi/agent` | `AGENTS.md` (managed `<!-- STRATA -->` bottom block) | `agents/strata-*.md` | `skills/strata-*/` | — |
| **`claude`** | `~/.claude` | `CLAUDE.md` (managed `<!-- STRATA -->` bottom block) | `agents/strata-*.md` | `skills/strata-*/` | — |
| **`gemini`** | `~/.gemini` | `GEMINI.md` (managed `<!-- STRATA -->` bottom block) | — | `config/skills/strata-*/` | — |
| **`opencode`** | `~/.config/opencode` | `AGENTS.md` (managed `<!-- STRATA -->` bottom block) | `agents/strata-*.md` | `skills/strata-*/` | — |
| **`codex`** | `~/.codex` | `AGENTS.md` (managed `<!-- STRATA -->` bottom block) | — | `skills/strata-*/` | — |
| **`hermes`** | `~/.hermes` | `AGENTS.md` (managed `<!-- STRATA -->` bottom block) | — | `skills/strata-*/` | — |
| **`agents-global`** | `~/.agents` | `steering/strata-*.md` (optional shared store) | `agents/strata-*.md` | `skills/strata-*/` | `hooks/strata-handoff-start.json` |
| **Custom (`--add`)** | `<dir>[:<layout>]` | Inferred or specified layout (`pi`, `claude`, `kiro`, `gemini`, `codex`, `opencode`, `agents`) | Per layout | Per layout | Per layout |

- **Non-destructive root file registration:** For tools that use a single root instruction file (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), `distribute.mjs` appends and updates a fenced `<!-- STRATA:START --> ... <!-- STRATA:END -->` block at the bottom of the file, preserving any custom rules or project commands above it. Unchecking the tool cleanly removes only that block.

---

## Install

Requires Node.js 20+ (Node.js 22+ recommended for blueprint linting) and Git.

Clone the repository and preview what will be deployed across your installed tools (`~/.kiro`, `~/.pi/agent`, `~/.claude`, `~/.gemini`, etc.):

```bash
git clone https://github.com/TylerJPresley/strata-agent-framework.git
cd strata-agent-framework
node scripts/distribute.mjs --dry-run
```

Run `node scripts/distribute.mjs` to open the **interactive target checklist**, showing every supported tool location (`~/.kiro`, `~/.pi/agent`, `~/.claude`, `~/.gemini`, `~/.hermes`, `~/.codex`, `~/.config/opencode`, `~/.agents`), its currently deployed version, and which files need updating:

```bash
# Interactive checklist (↑/↓ move, Space toggle, c add custom dir, Enter confirm)
node scripts/distribute.mjs

# Add a custom target or project directory (optionally specifying :pi, :claude, :gemini, :kiro, :codex, :opencode, or :agents layout)
node scripts/distribute.mjs --add ~/.config/voidrift

# Non-interactive deploy using your saved target selection (~/.agents/.strata-targets.json)
node scripts/distribute.mjs --yes
```

Unchecking a previously deployed harness (or passing `--remove ~/.config/voidrift`) automatically reads its `.strata-manifest.json` and cleanly uninstalls only the Strata-managed files while leaving your other configs, MCP servers, and runtime state untouched.

> [!NOTE]
> **Embedded `strata-blueprints` Skill (`v0.4.0`):** This repository ships with [`strata-blueprints`](skills/strata-blueprints/SKILL.md) `0.4.0` embedded out of the box. If you maintain a local checkout of the standalone [`strata-blueprints`](https://github.com/TylerJPresley/strata-blueprints) repository, `node scripts/distribute.mjs` automatically syncs from `../strata-blueprints/skills/strata-blueprints` (or `STRATA_BP_SOURCE`), or you can sync manually with:
> `node scripts/sync-skill.mjs <path-to-strata-blueprints>/skills/strata-blueprints --target ./skills`

## Usage

Once deployed, your AI harnesses automatically load Ring 1 (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or `steering/*.md`) and discover Ring 2 skills and subagents from `~/.agents`:

```bash
# Verify that all installed harnesses match the repository manifest and pass steering-lint
node scripts/distribute.mjs --check

# Inside any software project, run the project's quality gate
node gate.mjs

# Run a deterministic acceptance-criteria check for an active feature plan
node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs _internal/plans/<slug>.criteria

# Audit modified tests in a commit range against the plan's "## Existing tests changed"
node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs

# Run a deterministic dependency, license, secret, and code-pattern audit
timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs

# Lint a Strata Blueprint directory or run an upstream change impact check
node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs docs/blueprints
node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs --impact vision-3.1 docs/blueprints
```

## Core Documentation

- **[`skills/strata-lifecycle/references/vision.md`](skills/strata-lifecycle/references/vision.md)** — The problem statement, the 7 Core Assertions (`A1`–`A7`), and the Rings of Exposure.
- **[`skills/strata-lifecycle/references/structure.md`](skills/strata-lifecycle/references/structure.md)** — Anatomy of `~/.agents`, required project repository files (`AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `docs/blueprints/`, `gate.mjs`), `_internal/` working folder layout, and script reference table.
- **[`skills/strata-lifecycle/references/lifecycle.md`](skills/strata-lifecycle/references/lifecycle.md)** — The single development loop from Triage through Discovery, Planning, Test-First Implementation, Independent Verification, and Feature Close-Out.
- **[`skills/strata-lifecycle/references/roles-and-standing-rules.md`](skills/strata-lifecycle/references/roles-and-standing-rules.md)** — Specialist write scopes, the 7-Part Specialist Brief, universal standing rules, `CONFLICT` protocol, structured reply format (`D1/C1/A1/P1/N1`), context handoffs, research cache, and retrospective lesson promotion.
- **[`skills/strata-security-audit/references/security-and-audit.md`](skills/strata-security-audit/references/security-and-audit.md)** — Secure-by-default principles, 9-point security review checklist, and mechanical dependency/license/secret auditing via `skills/strata-security-audit/scripts/audit.mjs`.
- **[`skills/strata-lifecycle/references/engineering-craft.md`](skills/strata-lifecycle/references/engineering-craft.md)** — Domain engineering checklists (Requirements/EARS, Architecture, Backend/APIs, Data, Systems/CLI, Web/Frontend, Cloud Ops, Reliability/SRE, Product).
- **[`skills/strata-lifecycle/assets/`](skills/strata-lifecycle/assets/)** & **[`skills/strata-lifecycle/references/`](skills/strata-lifecycle/references/)** — Starter templates (`AGENTS.template.md`, `CONTRIBUTING.template.md`, `README.template.md`, `gate.template.mjs`, `plan-template.md`, `handoff-template.md`, `discovery-round-template.md`, `ears-gwt.md`) and reference tables.

## High-Signal Skills

To avoid skill-routing degradation (`A5`), global skills are consolidated into 6 distinct entry points:

1. **[`strata-blueprints`](skills/strata-blueprints/SKILL.md)** — Author, lint, condense, publish, and build from 3-layer Strata Blueprints (`Vision`, `Structure`, `Detail`).
2. **[`strata-lifecycle`](skills/strata-lifecycle/SKILL.md)** — Master router for project file bootstrap, triage, discovery/grilling, feature planning, test-first builds, independent review, and session handoffs.
3. **[`strata-security-audit`](skills/strata-security-audit/SKILL.md)** — Deterministic dependency, license, secret, and security review workflow (`skills/strata-security-audit/scripts/audit.mjs` + `skills/strata-security-audit/references/security-and-audit.md`).
4. **[`strata-diagnosing-bugs`](skills/strata-diagnosing-bugs/SKILL.md)** — Fast-feedback reproduction, root-cause hypothesis testing, and regression test verification.
5. **[`strata-optimization-loop`](skills/strata-optimization-loop/SKILL.md)** — Measure-change-verify loop for moving a single metric toward a target at minimum cost.
6. **[`strata-teach`](skills/strata-teach/SKILL.md)** — Long-term retention teaching workspace driven by primary sources and spaced retrieval practice.

## Quality Gate

Run the repository quality gate (steering/skill linter + 193 deterministic script unit tests in `tests/`) from the repo root:

```bash
node gate.mjs
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT (see [LICENSE](LICENSE)).
