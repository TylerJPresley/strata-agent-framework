---
name: strata-optimization-loop
description: "a loop that moves one measured number toward the owner's goal at the lowest cost: cheap mechanical checks on every change, agent runs once per batch, every addition shown to help or removed. Use when the owner asks to optimize, iterate until clean, or reduce friction in a standard, skill, tool or document."
---

# Optimization loop

Intent: every cycle moves one measured number toward the owner's goal, and a change stays only when the number shows it helped.

## Before cycle 1
1. Turn the owner's goal into one number measured the same way each cycle, and write the method in the ledger. For a standard whose goal is least friction: friction entries per fresh author run on a frozen task, warnings the standard causes on the first run, and the words a reader must load.
2. Freeze the test: named commits for the versions compared (start, current, ablated), the task, the fixtures and the harnesses. Only the artifact under test changes between cycles.
3. Set the stop rules and the cost line: stop at zero, when the number is flat for two rounds, or when the gain per cost falls. Each cycle logs the agents run and the size of their reports.

## Each cycle
1. Make one change, or a small batch.
2. Run the cheap mechanical checks on every change: the gate, the tests, a differential harness recorded from the project's own tests, and a docs check that reads the doc text and runs the program. Write the failing test first, and prove it can fail by reverting the fix on a copy.
3. Run the expensive agents once per batch: a fresh author on the frozen task, two per version because one run is noisy, and a blind rebuild as a periodic completeness check.
4. Keep a change only when the number falls on the item it targets and the total does not rise. Remove a sentence that shows no effect.
5. When an item recurs after a sentence was added, move the rule into a lint check, a template line or an example.
6. A Reviewer in fresh context runs the real programs against each claim. The author's "done" is not evidence.
7. Write one ledger line: the change, the number before and after, the cost.

## Checks that earned their cost
- The swap test: run the project's own tests against the blind rebuilds. It found gaps that a 100% harness score hid.
- A closed-pipe case and a failed-start case after any change to output or child-process code.
- Add to the harness corpus each case a test shows it lacked.

## Autonomy
Park the owner's decisions (standard rules, permissions, anything outward) in one block of three or fewer, and keep working on everything else. When the owner says to apply the recommendations, apply the recommended option of each block, log each line in the decisions file for veto, and stop only for permission changes and outward actions.

## Limits
- A friction entry becomes a rule only after a re-run shows it removes that friction.
- The test artifact is written once per version, not rewritten every cycle.
- A proxy such as a rebuild score or a test count is a check, never the goal.
- A full-system round runs only when the cheap checks are clean.
