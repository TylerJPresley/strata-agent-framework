# The thinking folder

Intent: working files live in one place, `_internal/`, so a later session reuses them instead of paying to recreate them.
Applies: whenever an agent records a decision, result, plan, research note, tool or scratch file.

- Store all project working artifacts under `<project>/_internal/` (gitignored), never in `/tmp` or the repository root, and batch artifact and session-memory updates into a single closing turn rather than multiple trailing housekeeping turns.
- Durable artifacts kept in `_internal/`: `handoff.md`, `decisions.md`, `lessons.md`, `plans/` (with `*.review.md`, `*.security.md`, and `plans/archive/`), `research/` (`sources/`, `findings/`, `index.md`), `proposals/`, and `tools/`.
- Ephemeral folders cleared when done: `_internal/scratch/` and `_internal/backups/`.
