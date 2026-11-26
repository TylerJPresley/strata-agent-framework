---
name: strata-diagnosing-bugs
description: "Reproduce bugs in a fast loop, find root cause, and fix — use when a test fails, a bug is reported, or observed behavior differs from what the spec describes."
---

# Diagnosing bugs

Intent: a bug is fixed at its cause, and a regression test keeps it fixed.

## When to use
- A test fails, a bug is reported, or observed behavior differs from the spec.
- Before changing code to make a failure go away.

## How to work
1. Build a fast feedback loop first: one command that reproduces the failure quickly, saved so it runs the same way each time.
2. Treat reproduction contradictions as evidence: if the user reports a symptom your run does not reproduce, never reframe or dismiss their report ("must be stale SHA", "must be a flake"). Catalogue what differs between environments (TTY vs. pipe, shell, env vars, leftover state, build artifacts) before forming a hypothesis.
3. Minimize the reproduction to the smallest input, path and state that still shows the failure.
4. Observe what actually happens and check persistent state: read the real output, real state, and real inputs—including caches, temp files, session state, queues, or DB rows left behind by prior runs. Before blaming an external system (model, API, library), inspect the exact input payload it received.
5. Name the failing assumption: the one place where the actual state and the expected state first diverge. For multi-round bugs, record hypotheses and ruled-out causes in an investigation note under `_internal/scratch/` so you never lose context across attempts.
6. Form one hypothesis about the cause and instrument data values, not code-path presence: log actual payloads, return values, and state at the 2–3 decision points where your hypothesis makes a testable prediction ("most non-trivial bugs are correct code processing wrong data"), and confirm your test command actually captures the output before running.
7. Fix the cause only after specific data confirms the hypothesis. Remove temporary instrumentation after applying the fix.
8. Write a regression test that fails before the fix and passes after it, driving the real path the bug lived on.
9. Re-run the reproduction command and the regression test to confirm the fix, then run the affected tests.

## References
- `references/feedback-loops.md`
