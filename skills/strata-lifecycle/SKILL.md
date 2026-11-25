---
name: strata-lifecycle
description: "Run the spec-driven development and verification lifecycle. Bootstrap project files (AGENTS.md, CONTRIBUTING.md, gate.mjs), triage requests, run discovery rounds, plan features with pinned decisions and runnable criteria, execute test-first builds, run independent verification, and manage session handoffs or retrospectives."
---

# Project Lifecycle & Development Framework

Intent: route every project setup, discovery, planning, implementation, verification, git close-out, and session handoff task directly to its authoritative procedure, template, and deterministic script inside this self-contained skill (`skills/strata-lifecycle/`).

## Mandatory Routing Table
Load only the document and section required for the active stage (paths are relative to this skill directory, e.g. `~/.agents/skills/strata-lifecycle/`):

| Stage / Task | Mandatory Read Gate | Script / Template |
|--------------|---------------------|-------------------|
| **Framework philosophy & assertions (`A1`–`A7`)** | Read `references/vision.md` | N/A |
| **Project bootstrap / missing `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `gate.mjs`, or `_internal/`** | Read `references/structure.md` (Sections 2–4) | Starters in `assets/` (`AGENTS.template.md`, `CONTRIBUTING.template.md`, `README.template.md`, `gate.template.mjs`) |
| **Triage & Situational Orchestration (Small vs. Planned work)** | Read `references/lifecycle.md` (Section 1) | Labels in `references/triage-labels.md` |
| **Stage 1: Discovery (`strata-architect` — filling blueprint blanks)** | Read `references/lifecycle.md` (Section 2) | `assets/discovery-round-template.md` & `assets/questionnaire-template.md` |
| **Stage 2: Planning (`strata-planner` — `_internal/plans/<slug>.md` & `.criteria`)** | Read `references/lifecycle.md` (Section 3) and the matching domain section in `references/engineering-craft.md` | `assets/plan-template.md` & `assets/ears-gwt.md`; check with `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs --check <criteria-file>` |
| **Stage 3: Implementation (`strata-implementer` — Test-First Build & Seam Commits)** | Read `references/lifecycle.md` (Section 4) | `node gate.mjs` & `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <criteria-file>` |
| **Stage 4: Review (`strata-reviewer` — Independent & Real-Environment Verification)** | Read `references/lifecycle.md` (Section 5) | `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs`; write `_internal/plans/<slug>.review.md` |
| **Stage 5: Documentation (`strata-documenter`) & Feature Close-Out** | Read `references/lifecycle.md` (Section 6) | `node ~/.agents/skills/strata-lifecycle/scripts/push.mjs --dry-run` |
| **Multi-Agent Delegation, Briefing, Handoffs, Research Cache & Retro** | Read `references/roles-and-standing-rules.md` | `scripts/progress.mjs`, `scripts/ctx.mjs`, `scripts/research-index.mjs`, `scripts/lessons.mjs` |
