---
name: strata-lifecycle
description: "Run the unified project-handling and development lifecycle: bootstrap project files (AGENTS.md, CONTRIBUTING.md, gate.mjs), triage requests, run discovery/grilling rounds, plan features with pinned decisions and runnable criteria, execute test-first builds, run independent verification, and manage session handoffs or retrospectives."
---

# Project Lifecycle & Development Framework

Intent: route every project setup, discovery, planning, implementation, verification, git close-out, and session handoff task directly to its authoritative procedure, template, and deterministic script inside this self-contained skill (`skills/strata-lifecycle/`).

## Mandatory Routing Table
Load only the document and section required for the active stage (paths are relative to this skill directory, e.g. `~/.agents/skills/strata-lifecycle/`):

| Stage / Task | Mandatory Read Gate | Script / Template |
|--------------|---------------------|-------------------|
| **Framework philosophy & assertions (`A1`–`A7`)** | Read `references/vision.md` | N/A |
| **Project bootstrap / missing `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `gate.mjs`, or `_internal/`** | Read `references/structure.md` (Sections 2–4) | Starters in `assets/` (`AGENTS.template.md`, `CONTRIBUTING.template.md`, `README.template.md`, `gate.template.mjs`) |
| **Triage (Small vs. Planned work, or backlog sorting)** | Read `references/lifecycle.md` (Section 1) | Labels in `references/triage-labels.md` |
| **Discovery & Grilling (filling blueprint blanks before building)** | Read `references/lifecycle.md` (Section 2) | `assets/discovery-round-template.md` & `assets/questionnaire-template.md` |
| **Feature Planning (`_internal/plans/<slug>.md` & `.criteria`)** | Read `references/lifecycle.md` (Section 3) and the matching domain section in `references/engineering-craft.md` | `assets/plan-template.md` & `assets/ears-gwt.md`; check with `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs --check <criteria-file>` |
| **Test-First Build & Seam Commits** | Read `references/lifecycle.md` (Section 4) | `node gate.mjs` & `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <criteria-file>` |
| **Independent Review & Real-Environment Verification** | Read `references/lifecycle.md` (Section 5) | `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs`; write `_internal/plans/<slug>.review.md` |
| **Feature Close-Out, Git Squash-Merge & Safe Push** | Read `references/lifecycle.md` (Section 6) | `node ~/.agents/skills/strata-lifecycle/scripts/push.mjs --dry-run` |
| **Multi-Agent Delegation, Briefing, Handoffs, Research Cache & Retro** | Read `references/roles-and-standing-rules.md` | `scripts/progress.mjs`, `scripts/ctx.mjs`, `scripts/research-index.mjs`, `scripts/lessons.mjs` |
