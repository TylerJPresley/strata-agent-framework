# Specs

Intent: work is spec-driven, so the blueprint defines what is built and the code follows it.
Applies: before and during any design, implementation or review.

- The blueprint (`strata-blueprints` in `docs/blueprints/`) defines what is built across three layers (Vision, Structure, Detail) in present tense; code and plans follow it.
- Read the governing blueprint IDs before designing, implementing, or reviewing. Never fill a `Not supplied:` item with a guess.
- When code and blueprint disagree, the blueprint is the reference (amend the blueprint first with owner approval if the code is right).
- Mandatory Read Gate: before authoring, editing, auditing, or building from a blueprint, load `~/.agents/skills/strata-blueprints/SKILL.md` and run `node ~/.agents/skills/strata-blueprints/scripts/strata-blueprints-lint.mjs` after any edit.
