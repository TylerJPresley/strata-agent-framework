---
name: strata-security-audit
description: "Audit a project, code change, or new dependency for security vulnerabilities, trust-boundary risks, secrets, and license compliance using deterministic script facts (`audit.mjs`) and the standing security review checklist."
---

# Security & Dependency Audit

Intent: execute a near-zero-token mechanical audit first (`skills/strata-security-audit/scripts/audit.mjs`) and judge only flagged items and trust boundaries against the standing security checklist inside this self-contained skill (`skills/strata-security-audit/`).

## How to work
1. **Mandatory Read Gate:** Before running a security review, dependency check, or release audit, read `references/security-and-audit.md` in full (relative to this skill directory, e.g. `~/.agents/skills/strata-security-audit/references/security-and-audit.md`).
2. **Run the deterministic audit script first:**
   ```bash
   timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs
   ```
   Refer to `references/audit-ecosystems.md` for ecosystem detection and license classification rules.
3. **Inspect & Judge:**
   - Open each `file:line` hit flagged by `audit.mjs` to confirm or rule out the issue.
   - Check code changes against the 9-point Standing Security Review Checklist in `references/security-and-audit.md` (Section 2).
4. **Output Contract:**
   - When briefed with a plan slug, write the report to `_internal/plans/<slug>.security.md` with first line `PASS`, `FAIL`, or `ESCALATE`, followed by findings ranked by severity with `file:line`, source, and date.
   - Never return `PASS` while any `NEEDS-DECISION` item is open; format open decisions as a `CONFLICT` block with options `a*`, `b`, `c` for the Owner.
