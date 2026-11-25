# Changelog

This changelog records releases of Strata Agent Framework. The `Version:` and `Embedded Strata Blueprints:` lines of `skills/strata-lifecycle/references/vision.md` are the single source of the framework version and the embedded `strata-blueprints` version, and the owner chooses release tags.

## 0.1.4

Standardize the 5-stage development pipeline (`1. Discovery → 2. Planning → 3. Implementation → 4. Review → 5. Documentation`), rename `strata-keeper` to `strata-architect`, enforce collaborative pushback with a `<= 10-line` conversational ceiling, and require a blind fresh-context `strata-reviewer` hop (`verify-plan.mjs --require-review`) at Stage 4.

- **5-Stage Pipeline & `strata-architect` (`README.md`, `skills/strata-lifecycle/`, `agents/`):** Renamed the 5 lifecycle stages to **1. Discovery → 2. Planning → 3. Implementation → 4. Review → 5. Documentation** (with Triage & Situational Orchestration as a connected process) and renamed `strata-keeper` to `strata-architect` across `agents/prompts/`, `agents/{kiro,pi,claude,qwen,opencode}/`, and all framework references.
- **Collaborative Pushback & `<= 10-Line` Conversational Ceiling (`templates/AGENTS.md`, `steering/strata-concise.md`, `steering/strata-confidence-and-conflicts.md`):** Added explicit instructions to be collaborative rather than agreeable (pushing back directly when a premise contradicts prior decisions or adds unnecessary complexity), capped conversational and design-alignment replies at `<= 10 lines` (3–4 short bullets + 1 direct question), and eliminated AI writing tropes.
- **Unpoisoned Stage 4 Review Judging, Blind-Artifact Briefs & `--require-review` (`templates/AGENTS.md`, `agents/prompts/strata-reviewer.md`, `verify-plan.mjs`):** Established `strata-reviewer` + `.mjs` scripts as the sole judge (removing self-overruling by the builder/orchestrator), added the Explicit Harness Subagent Tool Map (`subagent`, `Task`, `invoke_subagent`, `delegate_task`), added pre-build adversarial plan red-teaming and active `_internal/scratch/` fault-injection probes, and added `--require-review` (plus bare `<slug>` resolution) to `verify-plan.mjs`.
- **Execution Discipline & Native `hermes` (`SOUL.md`) Target (`templates/AGENTS.md`, `agents/prompts/strata-implementer.md`, `scripts/distribute.mjs`):** Added mandatory tool use for calculations, literal token preservation, external write read-back verification, 2-strike patch-to-`write_file` fallback, vertical tracer-bullet TDD (`RED → GREEN → Mutate`), Chesterton's Fence (`git log -S` / `git blame`), `<= 60`-char front-loaded first sentences in `skills/strata-*/SKILL.md`, and `hermes` deployment to `~/.hermes/SOUL.md`.

## 0.1.3

Strengthen foundational execution, delegation, review, and anti-wall-of-text guidance for lighter and cloud harnesses alike, introduce per-app subagent directories (`agents/{kiro,pi,claude,qwen,opencode}`), enforce zero scope inflation (`YAGNI`) and step-by-step seam execution, and remove redundant read gates from conversational steering rules.

- **Foundational Crossover & Anti-Wall-of-Text Guidance (`templates/AGENTS.md` & `steering/strata-concise.md`):** Added explicit response-length calibration (one sentence when one sentence answers it; answer from session context first on follow-ups; no preamble, closing self-summary, or filler; load-bearing-only code snippets; name exact mechanism, number, and `file:line`), non-interactive explained shell commands, visual Markdown tables/Mermaid diagrams, `Done D1 / Checked C1 / Not done N1`, and `Decisions 1..3 (a*/b/c)`.
- **Self-Contained Ring 1 Conversational Rules:** Removed redundant Mandatory Read Gates from conversational and turn-classification steering rules (`strata-concise`, `strata-confidence-and-conflicts`, `strata-decision-rights`, `strata-framing`, `strata-project-contract`, `strata-script-first`, `strata-thinking-folder`), reserving Mandatory Read Gates strictly for the 6 heavy workflow stages.
- **Zero Scope Inflation (`YAGNI`), "Never Delegate Understanding", & Bounded Fan-Out (`strata-plan-and-verify.md`, `agents/strata-planner.md`, `agents/strata-director.md`, `roles-and-standing-rules.md`):** Plans and criteria include only the seams required to satisfy the Owner's explicit request; orchestrators synthesize findings before briefing (banning *"based on your findings, fix it"* prompts), use a 3-query threshold before spawning explorers, cap parallel subagents at 3 with disjoint write scopes, and brief implementation step-by-step per seam.
- **Presume-Wrong Audit, Dead-Switch Grepping, & Structured Debugging (`agents/strata-reviewer.md`, `strata-quality-testing.md`, `skills/strata-diagnosing-bugs/SKILL.md`):** Added presume-wrong test auditing, repo-wide read/call-site grepping for newly added options/parameters to catch dead switches, `Valid / False positive / Overthinking` review triage (capped at 3 rounds), data-value instrumentation over code-path presence checks, persistent-state inspection, and treating reproduction contradictions with user bug reports as environment evidence.
- **Per-App Subagent Directories (`agents/{prompts,kiro,pi,claude,qwen,opencode}`) & Qwen Code (`~/.qwen`) Target (`scripts/sync-agents.mjs`, `scripts/distribute.mjs`):** Organized specialist subagents into dedicated per-app directories (`agents/kiro/strata-*.json`, `agents/pi/strata-*.md`, `agents/claude/strata-*.md`, `agents/qwen/strata-*.md`, `agents/opencode/strata-*.md`) compiled and verified from `agents/prompts/strata-*.md` via `scripts/sync-agents.mjs` so each harness receives its exact native tool names (`read_file`/`grep_search` for Qwen, `Read`/`Grep` for Claude, `read`/`grep` for Pi, JSON permissions for Kiro). Added native `qwen` (`~/.qwen` → `QWEN.md`, `agents/`, `skills/`) target support in `scripts/distribute.mjs` and synced embedded `strata-blueprints` to `0.4.1`.

## 0.1.2

Update embedded **Strata Blueprints** to **`0.4.0`** and auto-detect `../strata-blueprints/skills/strata-blueprints` in `scripts/distribute.mjs`.

- **Embedded Strata Blueprints `0.4.0`:** Synced all 23 files in `skills/strata-blueprints/` from upstream `strata-blueprints` `0.4.0` (guides, layer templates, examples, `strata-blueprints-lint.mjs`, and `strata-blueprints.mjs`).
- **Upstream Sync Path:** Updated `scripts/distribute.mjs` and `AGENTS.md` / `README.md` to check `../strata-blueprints/skills/strata-blueprints` first.

## 0.1.1

Separate repository development `AGENTS.md` from the deployed global Ring 1 template (`templates/AGENTS.md`) and refine default-agent enhancement vs. Kiro permission-boundary fan-out.

- **Separate `AGENTS.md` and `templates/AGENTS.md`:** Root `AGENTS.md` now holds the repository development instructions for `strata-agent-framework` itself (never distributed to target harnesses), while `templates/AGENTS.md` holds the compiled Ring 1 global payload distributed into `<!-- STRATA:START --> ... <!-- STRATA:END -->` blocks in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
- **Enhanced Default Agent & Specialist Routing:** Added Invariant 5 (`Orchestrate via Specialist Subagents`) to `templates/AGENTS.md` and sharpened the trigger descriptions (`Use when...`) across all 7 specialist subagents (`strata-architect`, `strata-planner`, `strata-implementer`, `strata-reviewer`, `strata-security-reviewer`, `strata-researcher`, `strata-documenter`).
- **Per-Harness Agent Deployment:** Kiro (`~/.kiro`) deploys all 8 compiled `agents/strata-*.json` files (including `strata-director.json` for permission-boundary fan-out), while non-Kiro harnesses (`pi`, `claude`, `opencode`) enhance their default main agent and deploy only the 7 specialist subagents.

## 0.1.0

First public release of Strata Agent Framework, embedding **Strata Blueprints `0.3.0`**.

- **Three Rings of Exposure:**
  - **Ring 1 (Always-On Posture, ~3.9k tokens):** Root `AGENTS.md` and 18 `steering/strata-*.md` files enforcing non-negotiable behavioral invariants (`concise`, `framing`, `confidence-and-conflicts`, `decision-rights`, `script-first`, `security`, `fix-forward`) and Mandatory Read Gates (`A1`, `A6`).
  - **Ring 2 (Triggered Entry Points):** 8 isolated specialist subagents (`strata-director`, `strata-architect`, `strata-planner`, `strata-implementer`, `strata-reviewer`, `strata-security-reviewer`, `strata-researcher`, `strata-documenter`) and 6 consolidated high-signal skills (`strata-blueprints`, `strata-lifecycle`, `strata-security-audit`, `strata-diagnosing-bugs`, `strata-optimization-loop`, `strata-teach`) (`A4`, `A5`).
  - **Ring 3 (Framework Knowledge Base & Deterministic Scripts):** Authoritative lifecycle methodology (`skills/strata-lifecycle/references/vision.md`, `skills/strata-lifecycle/references/structure.md`, `skills/strata-lifecycle/references/lifecycle.md`, `skills/strata-lifecycle/references/roles-and-standing-rules.md`, `skills/strata-security-audit/references/security-and-audit.md`, `skills/strata-lifecycle/references/engineering-craft.md`), starter project templates (`skills/strata-lifecycle/assets/`), and zero-dependency Node.js (`.mjs`) verification scripts (`A2`, `A7`).
- **Embedded Strata Blueprints (`0.3.0`):**
  - Bundles `skills/strata-blueprints/` (`v0.3.0`) out of the box with 3-layer specification guides (`Vision`, `Structure`, `Detail`), blank templates, worked examples, `strata-blueprints-lint.mjs` (including `--strict` and `--impact`), and `strata-blueprints.mjs` (`condense` and `publish`) (`A3`).
  - `scripts/distribute.mjs` automatically syncs from an upstream `strata-bp/skills/strata-blueprints` checkout when present via `scripts/sync-skill.mjs`, and `scripts/version-check.mjs` verifies that the embedded `strata-blueprints` version matches across `skills/strata-lifecycle/references/vision.md`, `package.json`, `README.md`, `skills/strata-blueprints/SKILL.md`, and `skills/strata-blueprints/references/strata-blueprints-guide.md`.
- **Multi-Harness Distribution (`scripts/distribute.mjs`):**
  - Deploys cleanly into `~/.agents`, `~/.kiro` (with compiled `agents/*.json`), `~/.claude` (`CLAUDE.md`, `agents/`, `skills/`), and `~/.gemini` (`GEMINI.md`, `config/skills/`).
  - Writes `.strata-manifest.json` per harness with SHA-256 file hashes, framework version, and embedded `strata-blueprints` version so updates prune retired `strata-*` files while leaving third-party skills and user state untouched.
- **Deterministic Quality Gate (`gate.mjs`):**
  - Runs `steering-lint.mjs`, `version-check.mjs`, and the full `.test.mjs` test suite in a private `TMPDIR` that fails the gate if any test leaves temporary files behind.
