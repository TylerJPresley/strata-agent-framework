# README.md guide

For people: the vision, the problem-to-solution punch, onboarding, and quick usage. Friendly, direct, plain tone. Detail is linked out. Shared Markdown rules: `references/structure.md` (Section 3.5).

Sources: standard-readme https://raw.githubusercontent.com/richardlitt/standard-readme/master/spec.md (also https://github.com/RichardLitt/standard-readme/blob/main/spec.md); agents.md https://agents.md/ ("README.md files are for humans: quick starts, project descriptions, and contribution guidelines"); owner notes (owner-supplied search summaries; cited links inside are the summary's own). Fetched 2026-11-14.

## Order
Title, agents line, Badges (optional, minimal), Short Description, Table of Contents, Vision / Why & How It Works (the problem-to-solution arc, replacing a dry "Background" heading when selling a pattern or product), Install, Usage, Contributing, License. Other optional sections (Banner, Architecture / Pillars, Security, Extra Sections, API, Maintainers, Thanks) keep their place in the flow.

## Rules
- The agents line sits right after the title: `**AI agents:** start with [AGENTS.md](AGENTS.md) for commands, project map and rules.` (owner notes: link README to AGENTS.md). It is the one deviation from the standard-readme order.
- Short Description is a clear value proposition, under 160 characters, and does not start with `> ` (standard-readme; owner notes: value proposition in the first lines).
- Badges: few, directly under the title block; only ones a reader acts on, such as build status and license (owner notes: minimal badges at the top).
- Table of Contents is required for READMEs over 100 lines (standard-readme).
- **Vision & Solution Arc (replacing passive "Background"):** Open by naming the concrete problem or failure mode the audience hits, then immediately deliver the punch—how this project's design or pattern solves it and why it works. Avoid dry history lessons that state a problem without showing the mechanism that fixes it.
- Install is the exact commands and runtime versions. Note any embedded upstream standards or skills and how they stay synced.
- Usage opens with a reproducible, copy-paste quickstart in a code block (standard-readme; owner notes).
- Add a diagram (Mermaid), screenshot, or GIF when the project has an execution flow, architecture, or visual output worth showing.
- Scope: say what the project is and why; link `docs/` for deep references, and point to one `API.md` when a generator makes it (standard-readme; owner notes).
- Contributing links to `CONTRIBUTING.md` when there is one (standard-readme; owner notes).
- License is the last section and names the license (standard-readme; owner notes).
- No broken links (standard-readme). Check every relative link resolves.
- Build, test and lint commands for contributors live in `AGENTS.md`; the README holds install, usage, and the top-level quality gate command (setup's choice).
