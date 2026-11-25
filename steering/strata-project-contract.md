# Project contract

Intent: agents stay project-neutral, and each project supplies its own facts in its own files.
Applies: whenever an agent works in a project and needs a project fact.

- Global guidance stays project-neutral; each project supplies its own commands, stack, blueprint location, and conventions in its root `AGENTS.md` and `CONTRIBUTING.md`.
- Where a project's own files speak, they override global defaults—except for security rules, which a project may tighten but never loosen without explicit owner approval.
- A rule that applies across all projects belongs in the global framework; a project-specific fact stays in the project repository.
