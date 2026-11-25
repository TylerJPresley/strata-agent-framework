# Changelog

This changelog records releases of Strata Agent Framework. The `Version:` and `Embedded Strata Blueprints:` lines of `skills/strata-lifecycle/references/vision.md` are the single source of the framework version and the embedded `strata-blueprints` version, and the owner chooses release tags.

## 0.1.2

Update embedded **Strata Blueprints** to **`0.4.0`** and auto-detect `../strata-blueprints/skills/strata-blueprints` in `scripts/distribute.mjs`.

- **Embedded Strata Blueprints `0.4.0`:** Synced all 23 files in `skills/strata-blueprints/` from upstream `strata-blueprints` `0.4.0` (guides, layer templates, examples, `strata-blueprints-lint.mjs`, and `strata-blueprints.mjs`).
- **Upstream Sync Path:** Updated `scripts/distribute.mjs` and `AGENTS.md` / `README.md` to check `../strata-blueprints/skills/strata-blueprints` first.

## 0.1.1

Separate repository development `AGENTS.md` from the deployed global Ring 1 template (`templates/AGENTS.md`) and refine default-agent enhancement vs. Kiro permission-boundary fan-out.

- **Separate `AGENTS.md` and `templates/AGENTS.md`:** Root `AGENTS.md` now holds the repository development instructions for `strata-agent-framework` itself (never distributed to target harnesses), while `templates/AGENTS.md` holds the compiled Ring 1 global payload distributed into `<!-- STRATA:START --> ... <!-- STRATA:END -->` blocks in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
- **Enhanced Default Agent & Specialist Routing:** Added Invariant 5 (`Orchestrate via Specialist Subagents`) to `templates/AGENTS.md` and sharpened the trigger descriptions (`Use when...`) across all 7 specialist subagents (`strata-keeper`, `strata-planner`, `strata-implementer`, `strata-reviewer`, `strata-security-reviewer`, `strata-researcher`, `strata-documenter`).
- **Per-Harness Agent Deployment:** Kiro (`~/.kiro`) deploys all 8 compiled `agents/strata-*.json` files (including `strata-director.json` for permission-boundary fan-out), while non-Kiro harnesses (`pi`, `claude`, `opencode`) enhance their default main agent and deploy only the 7 specialist subagents.

## 0.1.0

First public release of Strata Agent Framework, embedding **Strata Blueprints `0.3.0`**.

- **Three Rings of Exposure:**
  - **Ring 1 (Always-On Posture, ~3.9k tokens):** Root `AGENTS.md` and 18 `steering/strata-*.md` files enforcing non-negotiable behavioral invariants (`concise`, `framing`, `confidence-and-conflicts`, `decision-rights`, `script-first`, `security`, `fix-forward`) and Mandatory Read Gates (`A1`, `A6`).
  - **Ring 2 (Triggered Entry Points):** 8 isolated specialist subagents (`strata-director`, `strata-keeper`, `strata-planner`, `strata-implementer`, `strata-reviewer`, `strata-security-reviewer`, `strata-researcher`, `strata-documenter`) and 6 consolidated high-signal skills (`strata-blueprints`, `strata-lifecycle`, `strata-security-audit`, `strata-diagnosing-bugs`, `strata-optimization-loop`, `strata-teach`) (`A4`, `A5`).
  - **Ring 3 (Framework Knowledge Base & Deterministic Scripts):** Authoritative lifecycle methodology (`skills/strata-lifecycle/references/vision.md`, `skills/strata-lifecycle/references/structure.md`, `skills/strata-lifecycle/references/lifecycle.md`, `skills/strata-lifecycle/references/roles-and-standing-rules.md`, `skills/strata-security-audit/references/security-and-audit.md`, `skills/strata-lifecycle/references/engineering-craft.md`), starter project templates (`skills/strata-lifecycle/assets/`), and zero-dependency Node.js (`.mjs`) verification scripts (`A2`, `A7`).
- **Embedded Strata Blueprints (`0.3.0`):**
  - Bundles `skills/strata-blueprints/` (`v0.3.0`) out of the box with 3-layer specification guides (`Vision`, `Structure`, `Detail`), blank templates, worked examples, `strata-blueprints-lint.mjs` (including `--strict` and `--impact`), and `strata-blueprints.mjs` (`condense` and `publish`) (`A3`).
  - `scripts/distribute.mjs` automatically syncs from an upstream `strata-bp/skills/strata-blueprints` checkout when present via `scripts/sync-skill.mjs`, and `scripts/version-check.mjs` verifies that the embedded `strata-blueprints` version matches across `skills/strata-lifecycle/references/vision.md`, `package.json`, `README.md`, `skills/strata-blueprints/SKILL.md`, and `skills/strata-blueprints/references/strata-blueprints-guide.md`.
- **Multi-Harness Distribution (`scripts/distribute.mjs`):**
  - Deploys cleanly into `~/.agents`, `~/.kiro` (with compiled `agents/*.json`), `~/.claude` (`CLAUDE.md`, `agents/`, `skills/`), and `~/.gemini` (`GEMINI.md`, `config/skills/`).
  - Writes `.strata-manifest.json` per harness with SHA-256 file hashes, framework version, and embedded `strata-blueprints` version so updates prune retired `strata-*` files while leaving third-party skills and user state untouched.
- **Deterministic Quality Gate (`gate.mjs`):**
  - Runs `steering-lint.mjs`, `version-check.mjs`, and the full `.test.mjs` test suite in a private `TMPDIR` that fails the gate if any test leaves temporary files behind.
