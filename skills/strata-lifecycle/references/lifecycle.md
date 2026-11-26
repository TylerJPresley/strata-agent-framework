# Lifecycle: The Single Development Loop

Intent: drive every task through one predictable, evidence-gated loop — from triage and specification through planning, test-first implementation, independent verification, and clean git integration.
Applies: every task, bug fix, feature, refactor, or release in any project.

## 1. Triage & Situational Orchestration (Connected Process)

Triage and multi-agent orchestration (`strata-director` or the lead agent) form a separate, connected process alongside the 5-stage development pipeline (`1. Discovery → 2. Planning → 3. Implementation → 4. Review → 5. Documentation`). An agent may enter directly at Stage 1 (Discovery), or triage incoming requests first:

- **Never Bleed Framework Build Mechanics (`Stages 2–4` & `gate.mjs`) into Stage 1 Blueprint Authoring (`AUTHOR`):** While authoring, interviewing for, or auditing a Strata Blueprint (`sbp-*.md`, `questions.md`), stay strictly inside Stage 1 Discovery (`strata-blueprints` `AUTHOR` workflow + `strata-blueprints-lint.mjs`). When the Owner supplies rules, constraints, or examples during a blueprint interview, record them in the blueprint—never jump into `strata-planner` (`_internal/plans/`), propose building code/CLI tools (`BUILD`), or propose bootstrapping `gate.mjs` (`gate.mjs` is strictly a code repository's unit-test and lint runner, never a domain or runtime policy check). Enter Stage 2 Planning only when building software/code or when the required blueprint layers are authored and the Owner explicitly asks to **build** from them.

### Small Work (Fast Path — Hard Mechanical Ceiling)
- **Qualifies only when:** The diff touches **`<= 2` code/test files** (e.g., a 1-file fix plus its new regression test) **or is pure doc/prose alignment** (in `README.md`, `CHANGELOG.md`, `docs/`, `steering/`, or `skills/`, regardless of doc file count) that changes no rule, permission, or limit, weakens or deletes **`0` existing tests**, and leaves behavior contracts, blueprints (`sbp-*.md` — which belong to Stage 1 Discovery), public interfaces/CLI flags, permissions, security settings, `gate.mjs`, `package.json`, and data schemas completely unchanged.
- **Loop:** Execute directly (or route to a single specialist), run the single check that covers it (`steering-lint.mjs` for steering/skills, `node gate.mjs` or affected test for code), commit directly on `dev/<engineer>`, and report.
- **Escalation rule:** The moment a code task touches `>= 3` files, modifies/weakens an existing test, or alters behavior contracts, rules, permissions, or limits, it is **mechanically Planned Work**. Never downgrade Planned Work on a guess.

### Planned Work (Full Feature Loop)
- **Qualifies when:** Anything larger than Small Work, or any change that adds, removes, or loosens a rule, permission, limit, behavior, interface, or data model.
- **Organization:** Work is organized into self-standing **Features**. Each feature is a complete, standalone outcome carried by one plan (`_internal/plans/<slug>.md`). When a feature closes, the system works cleanly without needing any later feature.
- **Backlog Triage (when sorting multiple incoming items):**
  1. Create one item per distinct problem/request (merge duplicates).
  2. Title each item by the gap: what exists vs. what is intended.
  3. Apply one type label and one priority label from `~/.agents/skills/strata-lifecycle/references/triage-labels.md` (security reports take highest priority).
  4. Order by priority, then by the smallest item that unblocks the most downstream work.

---

## 2. Stage 1: Discovery (`strata-architect`)

Before designing or building anything non-trivial, fill the blanks in the blueprint with the Owner's intent.

1. **Frontier Discovery:**
   - Ask only questions whose upstream prerequisites are already settled.
   - Group open questions into rounds using `~/.agents/skills/strata-lifecycle/assets/discovery-round-template.md` (or `~/.agents/skills/strata-lifecycle/assets/questionnaire-template.md` when blocked on an external stakeholder).
   - Look up codebase and documentation facts yourself (or via `strata-researcher`); ask the Owner only for **intent, direction, and product decisions**.
   - Push fuzzy terms until they have a testable definition. When two requirements collide, quote both and ask the Owner to resolve the contradiction.
2. **Updating the Blueprint (`strata-blueprints`):**
   - `strata-architect` drafts the approved changes into the project's blueprint (`docs/blueprints/sbp-*.md` or single blueprint file) in present tense, affirmative direction, and plain limits.
   - Never guess or fill a `Not supplied:` item on your own.
   - After every blueprint edit, run the linter and impact check:
     ```bash
     node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs <blueprint-path>
     node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs --impact <changed-id> <blueprint-path>
     ```
   - Confirm the Owner approves the exact blueprint wording before moving to Stage 2.

---

## 3. Stage 2: Planning (`strata-planner`)

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
5. **Pre-Build Adversarial Plan Red-Team (`strata-reviewer` — for multi-seam or high-risk plans):**
   - Before `strata-implementer` starts coding a multi-seam, architectural, or security-sensitive plan, dispatch `strata-reviewer` in fresh context to red-team `_internal/plans/<slug>.md` and `<slug>.criteria` against four failure modes:
     1. **Unpinned Decisions:** Any ambiguity or edge case where the Implementer would have to guess.
     2. **Fakeable or Incomplete `.criteria`:** Acceptance commands that could pass trivially without exercising the real behavior or that omit negative/error cases.
     3. **Missing Blast-Radius Touches:** Callers, configs, permissions, or existing test files missing from Predicted Touches or `## Existing tests changed`.
     4. **Scope Inflation (`YAGNI`):** Any step or abstraction not required by the Owner's request and cited blueprint IDs.

---

## 4. Stage 3: Implementation (`strata-implementer`)

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

## 5. Stage 4: Review (`strata-reviewer` & `strata-security-reviewer` — The Independent Judge)

Global context is an asset during Stages `1–3` (`Discovery → Planning → Implementation`), whether executed directly in the main session or via subagents, and becomes poison only at **Stage 4 (Review)**. Therefore, **the context that built the work never grades it**, and **`strata-reviewer` + the deterministic `.mjs` scripts are the sole judge**.

1. **Mandatory Fresh-Context Hop & Blind-Artifact Brief:**
   - When the harness provides a subagent tool (`subagent`, `Task`, `invoke_subagent`, `delegate_task`), spawn `strata-reviewer` in a fresh subagent context with a **blind-artifact brief** containing *only* four cold pointers: (1) Blueprint path & target IDs, (2) Plan & `.criteria` paths, (3) Git diff range (`git diff <base>..HEAD`), and (4) Verdict output path (`_internal/plans/<slug>.review.md`). Never include builder rationale, excuses, or narrative of how the code was written. (For generic subagent tools like `invoke_subagent` or `delegate_task` that do not auto-load `agents/strata-reviewer.md`, start the prompt with `"Read ~/.agents/skills/strata-lifecycle/references/lifecycle.md (Section 5) first"`.)
   - If the harness has **no subagent tool** (`codex`, `gemini` CLI), the builder context must not fake `<slug>.review.md`; instead, run `verify-plan.mjs` (without `--require-review`), `test-diff.mjs`, and `gate.mjs`, and record `UNVERIFIED: no subagent tool for fresh-context review` under `Not done`.
   - Run `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs --require-review _internal/plans/<slug>.criteria`, `node gate.mjs`, and `node ~/.agents/skills/strata-lifecycle/scripts/test-diff.mjs` (confirming modified tests match `## Existing tests changed` in the plan). Any unlisted modification or weakened assertion is an automatic `FAIL`.
2. **Two-Stage Adversarial Code & Architecture Review (`strata-reviewer`):**
   - **Stage A (Mechanical & Spec Compliance First):** Confirm every plan requirement and cited blueprint ID is met with zero unrequested scope creep before evaluating code style or quality.
   - **Stage B (Code Quality, Presume-Wrong, Dead-Switch & Active Fault-Injection):**
     - Compare the diff in fresh context against the blueprint, the plan's pinned decisions, the Systems-Thinking predicted touches, and `AGENTS.md`. Flag any code structure that does not trace to a pinned decision or blueprint requirement, checking `git log -S` / `git blame` (Chesterton's Fence) before flagging existing patterns.
     - **Presume-Wrong & Dead-Switch Audit:** Audit every green test relied on as evidence presuming it wrong (confirming it asserts real behavior), and for every added field, option, or optional parameter, grep all read and call sites across the repository to ensure it is not a dead switch (`options.foo ?? true` declared and read, but never set by any caller).
     - **Adversarial Fault-Injection Probe:** Actively attempt to break the implementation in an isolated `_internal/scratch/` probe using boundary/malformed inputs, missing or empty files, unexpected option combinations, and error paths within the blueprint's stated limits. Include the exact reproducer command and output for any break.
     - **Gate Loosening Check:** If `gate.mjs` was created, modified, renamed, or deleted, include a `Loosening` section in the verdict. Any removed check, narrowed command, unconditional `exit 0`, or deletion of `gate.mjs` is an automatic `FAIL` unless the brief explicitly records Owner approval.
   - Write verdict to `_internal/plans/<slug>.review.md` with first line exactly `PASS` or `FAIL`, followed by findings ranked by severity with `file:line` and reproducer evidence.
3. **Real-Environment Verification (when closing a user-visible feature or at release):**
   - Create an isolated scratch environment under `_internal/scratch/` with its own `HOME` and config directory; **never** touch the Owner's live configuration or secrets.
   - Reuse helpers in `_internal/tools/` (loopback fakes on `127.0.0.1:0`, capture servers, Python `pty` drivers for interactive CLIs with ANSI stripped). Cap real-model calls to a handful of turns.
   - Record a scenario table (`PASS`, `FAIL`, `BLOCKED`) with up to 10 lines of evidence per scenario.
   - Clean up all processes under `timeout`, clean `_internal/scratch/`, and confirm `git status --short` is clean.
4. **Security & License Audit (`strata-security-reviewer` — at release prep or new dependency adoption):**
   - Follow `~/.agents/skills/strata-security-audit/references/security-and-audit.md`: run `timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs` and write `_internal/plans/<slug>.security.md` (`PASS`, `FAIL`, or `ESCALATE`).
5. **No Self-Overruling & Dispute Escalation:**
   - Only `strata-reviewer` may write `_internal/plans/<slug>.review.md`, and a feature cannot close while line 1 is `FAIL`.
   - The builder or orchestrator **cannot overrule `strata-reviewer`** by dismissing a `FAIL` finding on its own. To resolve a `FAIL`:
     1. **Fix the defect** (or route to `strata-planner` after 2 strikes on the same seam) and re-run `strata-reviewer`.
     2. **Contest with cold evidence:** If the builder/orchestrator believes a finding is factually wrong or outside the blueprint's explicit limits (`Blueprint > AGENTS.md > Pinned Plan > Criteria > Code`), pass only the exact `file:line` or blueprint-ID citation back to `strata-reviewer`—and **`strata-reviewer` decides whether to flip `<slug>.review.md` to `PASS`**.
     3. **3-Round Cap → Owner `CONFLICT`:** If build and review do not converge to `PASS` within 3 rounds, halt immediately and surface a `CONFLICT` decision block (`a*`, `b`, `c`) to the Owner.

---

## 6. Stage 5: Documentation (`strata-documenter`) & Feature Close-Out

### Stage 5: Documentation (`strata-documenter`)
When `node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs --require-review _internal/plans/<slug>.criteria` passes (confirming all criteria exit `0` and `_internal/plans/<slug>.review.md` exists on disk with line 1 `PASS`):
- `strata-documenter` updates `CHANGELOG.md`, `README.md`, `CONTRIBUTING.md`, and `docs/` to match what was built.

### Git Branching Baseline
- `CONTRIBUTING.md` (`## Git`) sets the project override (e.g., `trunk only`). Default is gitflow: `main` (releases), `develop` (integration), `dev/<engineer>` (engineer branch cut from `develop` or `main`), and local `feature/<slug>` (one per active plan, cut from `dev/<engineer>`).
- Never commit directly to `main` or `develop` unless explicitly commanded by the Owner. Never create git tags (tagging is the Owner's alone). Never rewrite pushed history (fix forward with a new commit).

### Feature Close-Out Sequence (Connected Orchestration Process)
Once Stage 5 (`strata-documenter`) completes:
1. **Archive Plan & Update Handoff:** `strata-director` moves `_internal/plans/<slug>.*` to `_internal/plans/archive/` and updates `_internal/handoff.md` (`node ~/.agents/skills/strata-lifecycle/scripts/progress.mjs`) to point to the next feature.
2. **Squash-Merge Feature Branch:** `strata-director` switches to `dev/<engineer>`, squash-merges `feature/<slug>` as one atomic commit (commit title = plan's one-sentence outcome; body = completed checklist items), and deletes the feature branch (`git branch -D feature/<slug>`).
3. **Safe Push:** `strata-director` runs:
   ```bash
   node ~/.agents/skills/strata-lifecycle/scripts/push.mjs --dry-run && node ~/.agents/skills/strata-lifecycle/scripts/push.mjs
   ```
   If `push.mjs` refuses with `[dirty]`, route to `strata-implementer`; route any other refusal to the Owner.
4. **Integration & Release:** Merging `dev/<engineer>` into `develop` (non-squashed) or `main` (`--integrate`) happens only on the Owner's explicit command. Before a release, `strata-director` routes the real-environment check, `strata-security-reviewer` audit, and `CHANGELOG.md` update; the Owner tags and ships.
