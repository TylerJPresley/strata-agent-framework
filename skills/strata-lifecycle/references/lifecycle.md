# Lifecycle: The Single Development Loop

Intent: drive every task through one predictable, evidence-gated loop — from triage and specification through planning, test-first implementation, independent verification, and clean git integration.
Applies: every task, bug fix, feature, refactor, or release in any project.

## 1. Triage: Small Work vs. Planned Work

Before acting, classify the request:

### Small Work (Fast Path)
- **Qualifies when:** It leaves behavior, specs, public interfaces, permissions, security settings, and data schemas unchanged; touches 1–2 files; and has nothing depending on it. Pure prose rewording in docs/steering/skills/README that changes no rule, permission, or limit also qualifies regardless of file count.
- **Loop:** Route directly to the matching specialist with a brief (no plan file, no feature branch, no independent Reviewer pass). Run the single check that covers it (`steering-lint.mjs` for steering/skills, `node gate.mjs` or affected test for code), commit directly on `dev/<engineer>`, and report.
- **Escalation rule:** Any mid-work discovery that touches behavior, rules, permissions, or limits immediately upgrades Small Work to Planned Work. Never downgrade Planned Work on a guess.

### Planned Work (Full Feature Loop)
- **Qualifies when:** Anything larger than Small Work, or any change that adds, removes, or loosens a rule, permission, limit, behavior, interface, or data model.
- **Organization:** Work is organized into self-standing **Features**. Each feature is a complete, standalone outcome carried by one plan (`_internal/plans/<slug>.md`). When a feature closes, the system works cleanly without needing any later feature.
- **Backlog Triage (when sorting multiple incoming items):**
  1. Create one item per distinct problem/request (merge duplicates).
  2. Title each item by the gap: what exists vs. what is intended.
  3. Apply one type label and one priority label from `~/.agents/skills/strata-lifecycle/references/triage-labels.md` (security reports take highest priority).
  4. Order by priority, then by the smallest item that unblocks the most downstream work.

---

## 2. Stage 1: Discovery, Grilling & Blueprint (`strata`)

Before designing or building anything non-trivial, fill the blanks in the blueprint with the Owner's intent.

1. **Frontier Discovery & Grilling:**
   - Ask only questions whose upstream prerequisites are already settled.
   - Group open questions into rounds using `~/.agents/skills/strata-lifecycle/assets/discovery-round-template.md` (or `~/.agents/skills/strata-lifecycle/assets/questionnaire-template.md` when blocked on an external stakeholder).
   - Look up codebase and documentation facts yourself (or via `researcher`); ask the Owner only for **intent, direction, and product decisions**.
   - Push fuzzy terms until they have a testable definition. When two requirements collide, quote both and ask the Owner to resolve the contradiction.
2. **Updating the Blueprint (`strata-blueprints`):**
   - `strata` drafts the approved changes into the project's blueprint (`docs/blueprints/sbp-*.md` or single blueprint file) in present tense, affirmative direction, and plain limits.
   - Never guess or fill a `Not supplied:` item on your own.
   - After every blueprint edit, run the linter and impact check:
     ```bash
     node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs <blueprint-path>
     node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs --impact <changed-id> <blueprint-path>
     ```
   - Confirm the Owner approves the exact blueprint wording before moving to Stage 2.

---

## 3. Stage 2: Planning & Systems Mapping (`planner`)

Once the blueprint change is approved, the Planner turns the feature outcome into an executable contract under `_internal/plans/<slug>.md` and `_internal/plans/<slug>.criteria`.

1. **Systems-Thinking Map (for new subsystems, multi-file, security, or data changes):**
   Map in ~10 lines citing `file:line` or command evidence:
   - **Purpose & Measure:** What changes and how success is measured.
   - **Boundary & Connections:** Callers, consumers, tests, docs, configs, and permissions holding the same fact (enumerated via grep/import graph).
   - **Loops, Delays & Second-Order Effects:** Gates, caches, session resumes, and who relies on current behavior (Hyrum's Law).
   - **Predicted Touches:** Exact files expected to change (compared against `git diff --name-only` at review).
2. **Plan Structure (`_internal/plans/<slug>.md`):**
   Use `~/.agents/skills/strata-lifecycle/assets/plan-template.md` (modeled on `plan-example.md`). Every plan must contain these six sections:
   - **1. Blueprint Reference & Outcome:** Link the approved blueprint section/IDs, state the one-sentence outcome, and list Goal and Non-goals.
   - **2. Applicable Principles:** List the Owner's principles from `AGENTS.md` and which part of the design follows each.
   - **3. Pinned Decisions & Edge Cases:** One line per decision with its reason, covering every edge case. **The Implementer decides nothing; an unpinned decision is a planning defect.**
   - **4. Seams (Steps as `[ ]` checkboxes):** Divided at logical seams where each step leaves the project building and passing tests. Each step lists its target files, step dependencies, and a brief (≤10 lines).
   - **5. Existing Tests Changed (`## Existing tests changed`):** Name every existing test file/case this feature modifies and why, tied to the blueprint change.
   - **6. Risks & Unverified Items:** Explicit risks and what cannot be checked mechanically.
3. **Runnable Acceptance Criteria (`_internal/plans/<slug>.criteria`):**
   - Format: one `name :: command` per line, where each command exits `0` on pass and is verified by `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <slug>`.
   - Write behavior scenarios in **Given/When/Then** and standing rules in **EARS** (`WHEN <trigger>, THE SYSTEM SHALL <result>`; see `~/.agents/skills/strata-lifecycle/assets/ears-gwt.md`).
   - Required criteria: typecheck, lint, affected unit/integration tests, one check per pinned edge case, a regression test that fails before the fix, and `node gate.mjs` (when present).
   - If the project has tests but no `gate.mjs`, the plan must include creating `gate.mjs`.
4. **Constraint-Driven Quality Floor:**
   - Treat current coverage, type, lint, and performance metrics as a ratchet floor. New suppressions, skipped/deleted tests, or weakened assertions fail the gate.

---

## 4. Stage 3: Test-First Implementation (`implementer`)

The Implementer executes the plan on branch `feature/<slug>` without making design decisions.

1. **Branch Check:** Confirm the working tree is on `feature/<slug>` (cut from `dev/<engineer>`). If on another branch or dirty, stop and report.
2. **Test First (Red → Green):**
   - Derive the test from the plan's criteria and write it first.
   - Run the test and watch it fail before writing production code.
   - Drive the real execution path; mock only at external network/third-party boundaries.
   - **Mutation check:** Temporarily break the production logic, confirm the new test fails, and restore it.
3. **Commit at Each Seam:**
   - After completing a checklist step, run its criteria (`node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <slug>`) and `node gate.mjs`.
   - Stage files explicitly by name (`git add <file>`) and commit with a Conventional Commit message (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`) referencing the blueprint ID.
4. **Failure & Re-Plan Rule:**
   - If verification fails, fix the weakest point and re-run only the failing check.
   - **Two-Strike Rule:** If the same step or approach fails twice, stop immediately and return the failing output to the Director so the Planner can re-plan with a different approach.

---

## 5. Stage 4: Independent Verification & Real-Environment Check (`reviewer` & `security-reviewer`)

The agent that built the work **never** verifies it.

1. **Mechanical Verification:**
   - Run `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs <slug>` and `node gate.mjs`.
   - Run `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs` and compare modified tests against `## Existing tests changed` in the plan. Any unlisted modification or weakened assertion is an automatic `FAIL`.
2. **Independent Code & Architecture Review (`reviewer`):**
   - In fresh context, compare the diff against the blueprint, the plan's pinned decisions, the Systems-Thinking predicted touches, and `AGENTS.md`.
   - Flag any code structure that does not trace to a pinned decision or blueprint requirement.
   - **Gate Loosening Check:** If `gate.mjs` was created, modified, renamed, or deleted, include a `Loosening` section in the verdict. Any removed check, narrowed command, unconditional `exit 0`, or deletion of `gate.mjs` is an automatic `FAIL` unless the brief explicitly records Owner approval.
   - Write verdict to `_internal/plans/<slug>.review.md` with first line exactly `PASS` or `FAIL`, followed by findings ranked by severity with `file:line`.
3. **Real-Environment Verification (when closing a user-visible feature or at release):**
   - Create an isolated scratch environment under `_internal/scratch/` with its own `HOME` and config directory; **never** touch the Owner's live configuration or secrets.
   - Reuse helpers in `_internal/tools/` (loopback fakes on `127.0.0.1:0`, capture servers, Python `pty` drivers for interactive CLIs with ANSI stripped). Cap real-model calls to a handful of turns.
   - Record a scenario table (`PASS`, `FAIL`, `BLOCKED`) with up to 10 lines of evidence per scenario.
   - Clean up all processes under `timeout`, clean `_internal/scratch/`, and confirm `git status --short` is clean.
4. **Security & License Audit (`security-reviewer` — at release prep or new dependency adoption):**
   - Follow `~/.agents/skills/strata-security-audit/references/security-and-audit.md`: run `timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs` and write `_internal/plans/<slug>.security.md` (`PASS`, `FAIL`, or `ESCALATE`).

---

## 6. Stage 5: Feature Close-Out, Git Flow & Release (`director` & `documenter`)

### Git Branching Baseline
- `CONTRIBUTING.md` (`## Git`) sets the project override (e.g., `trunk only`). Default is gitflow: `main` (releases), `develop` (integration), `dev/<engineer>` (engineer branch cut from `develop` or `main`), and local `feature/<slug>` (one per active plan, cut from `dev/<engineer>`).
- Never commit directly to `main` or `develop` unless explicitly commanded by the Owner. Never create git tags (tagging is the Owner's alone). Never rewrite pushed history (fix forward with a new commit).

### Feature Close-Out Sequence
When a plan's criteria pass and `<slug>.review.md` is `PASS`:
1. **Real-Environment Check:** Run by `reviewer` if user-visible behavior changed.
2. **Documentation & Changelog:** `documenter` updates `CHANGELOG.md`, `README.md`, and `docs/` to match what was built.
3. **Archive Plan & Update Handoff:** `director` moves `_internal/plans/<slug>.*` to `_internal/plans/archive/` and updates `_internal/handoff.md` (`node ~/.agents/skills/strata-lifecycle/scripts/progress.mjs`) to point to the next feature.
4. **Squash-Merge Feature Branch:** `director` switches to `dev/<engineer>`, squash-merges `feature/<slug>` as one atomic commit (commit title = plan's one-sentence outcome; body = completed checklist items), and deletes the feature branch (`git branch -D feature/<slug>`).
5. **Safe Push:** `director` runs:
   ```bash
   node ~/.agents/skills/strata-lifecycle/scripts/push.mjs --dry-run && node ~/.agents/skills/strata-lifecycle/scripts/push.mjs
   ```
   If `push.mjs` refuses with `[dirty]`, route to `implementer`; route any other refusal to the Owner.
6. **Integration & Release:** Merging `dev/<engineer>` into `develop` (non-squashed) or `main` (`--integrate`) happens only on the Owner's explicit command. Before a release, `director` routes the real-environment check, `security-reviewer` audit, and `CHANGELOG.md` update; the Owner tags and ships.
