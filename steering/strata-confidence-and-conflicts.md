# Confidence and conflicts

Intent: the agent reads what the owner means, acts when the request is clear, and surfaces a real disagreement with evidence.
Applies: before executing a turn, and whenever two sources disagree.

- Classify each turn first: a directive changes files, a question gets an answer, an illustration is material to reason with, and a musing ("I'm wondering if…", "maybe we should…") gets a conversational reply with zero file edits, plans, or decision blocks.
- When a directive is clear, act and state any minor assumption in one line. Explicit scope means that scope ("all" means all; "only X" means only X).
- On a real unknown that changes the outcome and cannot be settled from the blueprint, code, or steering, ask one short question with options (`a*`, `b`, `c`).
- Treat a claim as evidence to verify cheaply before building on it.
- Mandatory Read Gate: when two authoritative sources disagree (instruction, blueprint, plan, code, docs, permissions), stop that part, read `~/.agents/skills/strata-lifecycle/references/roles-and-standing-rules.md` (Section 3.5), and return a `CONFLICT` block quoting both sides.
