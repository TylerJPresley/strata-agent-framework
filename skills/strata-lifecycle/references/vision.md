# Vision: The Agent Guidance Repository (`~/.agents`)

Version: 0.1.5
Embedded Strata Blueprints: 0.4.1

Intent: provide one portable, harness-agnostic development and project-handling framework that governs every coding agent through progressive disclosure, disk artifacts, and mechanical verification.
Applies: every harness, agent, skill, steering rule, and project workflow connected to `~/.agents`.

## 1. The Need

Strata exists to solve two problems that appear across both local and cloud AI coding workflows:
1. **Closing the harness gap for local models:** Commercial cloud harnesses (Claude Code, Kiro, Antigravity) rely on heavy internal system prompts for tool batching, scope control, and concise formatting. Lighter open harnesses (`pi.dev`, `qwen-code`, `opencode`, `codex`) driving local or self-hosted models lack that baseline craft and quickly produce unreadable walls of text, scope inflation, or unverified edits unless the framework supplies that foundational guidance and native per-app subagent tool schemas.
2. **Stopping plan drift and self-grading bias (even on frontier cloud models):** Even top cloud harnesses deviate from plans over multi-step sessions, silently guessing missing requirements, weakening failing tests to get green, and overwhelming the human with verbose self-congratulatory summaries. Strata introduces living 3-layer specifications (`strata-blueprints`), deterministic script gates (`verify-plan.mjs`, `test-diff.mjs`, `gate.mjs`), and independent fresh-context judging (`strata-reviewer`, `strata-security-reviewer`) so work is verified against evidence before the user ever sees a report.

Modern software work spans multiple AI harnesses (Kiro, Antigravity, Claude Code, Qwen Code, Gemini CLI, Codex, Hermes, OpenCode, Pi). Each harness has its own configuration folder, context limits, and tool conventions. Maintaining separate prompts, steering rules, and workflows per harness creates rule drift, bloats always-on context windows, and loses hard-won lessons whenever a session resets or switches tools.

`~/.agents` (and per-app native deployments via `scripts/distribute.mjs`) is the single source of truth for agent guidance. Every harness either loads `steering/strata-*.md` natively or mounts a managed `<!-- STRATA:START --> ... <!-- STRATA:END -->` block in its root instruction file (`AGENTS.md`, `CLAUDE.md`, `QWEN.md`, `GEMINI.md`, `SOUL.md`), per-app specialist subagents (`agents/<app>/`), and self-contained skills (`skills/strata-*/`).

## 2. Core Assertions (Hard-Won Lessons)

These assertions encode the lessons learned from operating coding agents across harnesses at scale. Every document, steering file, agent role, and skill in `~/.agents` is built on them:

- **A1. Attention dilution kills large `steering/` sets (~2k–3k token budget).** When always-on context passes roughly 2,000–3,000 tokens of prose rules, models start selectively dropping constraints. Always-on steering is kept strictly to non-negotiable invariants plus a routing table; all "how-to" procedures live in on-demand `docs/` and `skills/`.
- **A2. Artifact engineering beats prompt engineering.** Stateless agents drift when instructions and state live only in chat history or abstract prompt rules. Continuity lives in concrete markdown artifacts on disk (`docs/blueprints/`, `_internal/plans/<slug>.md`, `_internal/handoff.md`, `_internal/decisions.md`, `_internal/research/`) as state checkpoints so any agent or harness can pick up mid-flight with zero prior chat context.
- **A3. Specs that drift are worse than no specs.** A stale spec actively misleads agents and creates false confidence. Updating the blueprint (`strata-blueprints`) is wired directly into the build/verify loop with deterministic lint and impact checks (`strata-blueprints-lint.mjs --impact`). What looks like an agent coding error is almost always an unpinned spec gap; code divergence from the blueprint is a broken build.
- **A4. Green tests do not equal sound architecture.** An agent will happily pass unit tests with convoluted, unmaintainable code. Therefore, the builder never verifies its own work: an independent Reviewer (in fresh context) audits the diff against the plan and blueprint, verifies that existing test contracts were not weakened (`test-diff.mjs`), and rejects any generated structure that does not trace to an explicit decision.
- **A5. Skill routing degrades when descriptions overlap.** Because harnesses only load a skill's `name` and `description` at startup, having 40+ fine-grained, overlapping skills causes models to pick the wrong skill or skip activation entirely. Related playbooks are consolidated into fewer, high-signal skill entry points with distinct triggers, each routing to specific chapters in `docs/` or `references/`.
- **A6. Models treat passive links as optional suggestions (Use Mandatory Read Gates).** Models routinely skip `"see docs/foo.md"` when they assume they can guess the procedure. Every pointer from `steering/` or `agents/` into `docs/` is written as a **Mandatory Read Gate**: an explicit trigger condition, a mandatory `read_file` of the exact `docs/` path before acting, and a required output artifact shape that a verification script (`verify-plan.mjs`, `steering-lint.mjs`, `gate.mjs`) or Reviewer rejects if faked.
- **A7. Deterministic scripts check; models decide and design.** Anything countable, repeatable, or mechanically checkable (linting, test diffs, acceptance criteria execution, dependency/secret audits, safe git pushes) is executed by a deterministic script (`~/.agents/skills/strata-lifecycle/scripts/` or project `gate.mjs`). Model tokens are reserved for judgment, architecture, and implementation.

## 3. Rings of Exposure

Guidance in `~/.agents` is organized into three concentric rings of exposure so agents pay only for the context a task requires:

| Ring | Layer in Framework | Context Exposure | Purpose |
|------|--------------------|------------------|---------|
| **Ring 1: Always-On Posture** | `steering/*.md` & root `AGENTS.md` / `CLAUDE.md` / `QWEN.md` / `GEMINI.md` / `SOUL.md` | **100% (Every turn)** | Ultra-terse behavioral invariants, communication format, safety limits, and Mandatory Read Gates pointing to Ring 2 and Ring 3. |
| **Ring 2: Triggered Entry Points** | `agents/*.md` & `skills/*/SKILL.md` | **Metadata always; body on demand** | Role boundaries (`agents/`) and self-contained task routers (`skills/`) that activate when a capability is needed and load the required Ring 3 documents. |
| **Ring 3: Self-Contained Skill Docs & Scripts** | `skills/*/references/`, `skills/*/assets/`, `skills/*/scripts/*.mjs` | **0% until read or executed** | The authoritative methodology, lifecycle procedures, artifact schemas, starter templates, and deterministic verification scripts bundled inside each owning skill. |

## 4. How Harnesses Consume the Rings

- **Kiro (`~/.kiro`):** Loads `steering/strata-*.md` directly as Ring 1, compiled `agents/strata-*.json` and `skills/strata-*/` as Ring 2, and follows Mandatory Read Gates into `~/.kiro/skills/strata-*/{references,assets,scripts}`.
- **Pi (`~/.pi/agent`), Claude Code (`~/.claude`), Qwen Code (`~/.qwen`), Gemini CLI / Antigravity (`~/.gemini`), OpenCode (`~/.config/opencode`), Codex (`~/.codex`), and Hermes (`~/.hermes`):** Load a non-destructive `<!-- STRATA:START --> ... <!-- STRATA:END -->` block appended to their native root file (`AGENTS.md`, `CLAUDE.md`, `QWEN.md`, `GEMINI.md`, or `SOUL.md`) as Ring 1, discover their deployed `agents/strata-*.md` and `skills/strata-*/` as Ring 2, and load `references/`, `assets/`, and `scripts/` directly from their own deployed `skills/strata-*/` directory as Ring 3.
- **Custom or Project Directories (`--add <dir>[:<layout>]`):** Deploy the self-contained skills, agents, and managed `AGENTS.md` block directly into any custom app or project folder.

## 5. Companion Framework Documents

- [`skills/strata-lifecycle/references/structure.md`](structure.md) — Directory layout of `~/.agents`, standard anatomy of any project repository (`AGENTS.md`, `CONTRIBUTING.md`, `docs/blueprints/`, `_internal/`), and harness mounting rules.
- [`skills/strata-lifecycle/references/lifecycle.md`](lifecycle.md) — The single development loop: Triage (Small vs. Planned) → Discovery → Planning → Implementation → Review → Documentation.
- [`skills/strata-lifecycle/references/roles-and-standing-rules.md`](roles-and-standing-rules.md) — The Director + Specialist delegation model, strict write scopes, shared standing rules, CONFLICT protocol, and structured reply formats.
