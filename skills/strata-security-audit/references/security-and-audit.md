# Security, Trust Boundaries & Project Audit

Intent: enforce secure-by-default engineering, strict agent permission boundaries, and low-token mechanical dependency/code auditing before adoption or release.
Applies: whenever code touches external input, identity, secrets, personal data, dependencies, or network boundaries, and during release preparation.

## 1. Secure-by-Default Engineering Principles

When designing, implementing, or reviewing code (`strata-planner`, `strata-implementer`, `strata-reviewer`, `strata-security-reviewer`):

1. **Least Privilege & Defense in Depth:** Grant the minimum permissions required at every layer (OS, container, database, IAM, API token). Never rely on LAN trust or a single perimeter check.
2. **Input Validation & Injection Safety:** Validate all external input at the boundary against a strict schema. Quote and escape all shell arguments (prefer array-based `execFile`/`spawn` without a shell); parameterize all database queries; strip control and bidirectional Unicode characters from untrusted file names, tool outputs, and user text before rendering or logging.
3. **Secrets & PII Protection:**
   - Secrets live only in environment variables or a secret vault (never in code, configs, logs, commits, or replies). Config files hold only environment variable names.
   - Collect the minimum PII required; mask PII and tokens before logging or exporting; encrypt sensitive data at rest (AES-256) and in transit (TLS 1.3).
4. **Authentication & Web Hardening:** Use standard, battle-tested protocols (OIDC, OAuth2, JWT with asymmetric keys). Enforce rate limiting, strict CORS, HSTS, and Content-Security-Policy (CSP).
5. **Authorized Scope for Dual-Use / Offensive Work:** Any penetration testing, scanning, exploitation, or credential testing requires explicit Owner confirmation that the target is owned by him or within written authorized scope. Defensive, educational, and local CTF work proceeds normally.

---

## 2. Standing Security Review Checklist (`strata-reviewer` & `strata-security-reviewer`)

When reviewing any change that touches permissions, inputs, files, processes, network calls, or dependencies, inspect these nine risk surfaces and report exploitable findings ranked by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with `file:line` and a concrete reproduction:

1. **Entry Points & Gate Bypass:** Trace every path that runs a tool, shell command, file write, or network fetch (including background workers, session resume, hooks, and plugins) to confirm none bypass the central permission gate.
2. **Authorization & Rule Ordering:** Check whether a `deny` or `ask` rule can be shadowed by a broader wildcard `allow`, batch approval, or stale grant that outlives its scope.
3. **Untrusted Persistent State:** Require integrity validation before trusting data loaded from caches, session files, indexes, or cloned repositories.
4. **Untrusted Text & Terminal Output:** Confirm control characters, ANSI escape injection, and bidi overrides are stripped before reaching a terminal, log, or trusted prompt channel.
5. **Secret Leakage:** Verify secrets and credentials are masked across logs, error traces, telemetry events, and crash dumps, and that local credential stores carry `0600`/`0700` file permissions.
6. **Network & SSRF:** Check outbound fetches for Server-Side Request Forgery (blocking private RFC1918, loopback, link-local, and cloud metadata `169.254.169.254` addresses), unsafe redirect following, DNS rebinding, and environment proxy hijacking.
7. **Filesystem & Process Containment:** Check path traversal (`..`), symlink following, TOCTOU race conditions, command argument injection, and auto-executed repo hooks/configs.
8. **Resource Limits & Fail-Closed Behavior:** Require explicit caps on payload size, recursion depth, item count, and execution time (`timeout`). Confirm error handlers fail closed (deny on error).
9. **Dependencies:** Confirm every new or updated dependency passes the mechanical audit below.

---

## 3. Mechanical Project & Dependency Audit (`audit.mjs`)

To keep token usage near zero while catching supply-chain, license, and secret risks, a deterministic script gathers all facts and the model judges **only** the flagged items.

### When to Run
- **Before adopting a new dependency** (quick check of license, advisories, install scripts, and version pinning).
- **At release preparation**, run once by `strata-security-reviewer` before a project or release is called done.
- *(Never put `audit.mjs` inside the per-commit `gate.mjs`, because advisory lookups use the network.)*

### Execution Procedure
1. **Run the deterministic audit script:**
   ```bash
   timeout 300 node ~/.agents/skills/strata-security-audit/scripts/audit.mjs
   ```
   The script detects the project ecosystem (see `~/.agents/skills/strata-security-audit/references/audit-ecosystems.md`), writes raw data under `_internal/scratch/audit/`, and runs six checks:
   - `licenses` (compares dependency SPDX licenses against `Licenses allowed:` in `AGENTS.md`; reject rules bind **shipped/production** dependencies, while dev-only tooling is reported as `info`)
   - `advisories` (known CVEs via the ecosystem's native audit tool)
   - `install-scripts` (`preinstall`/`install`/`postinstall` hooks in third-party packages)
   - `unpinned` (floating ranges or unpinned git/URL dependencies)
   - `secrets` (committed keys, tokens, or high-entropy credential patterns)
   - `code-patterns` (dangerous `eval`, unescaped shell execution, insecure crypto/TLS flags)
2. **Interpret Exit Codes:**
   - `0`: All checks passed with zero open decisions.
   - `1`: One or more findings or open `NEEDS-DECISION` items require review.
   - `2`: Zero findings, but one or more checks printed `NOT RUN` (missing local tool; includes install hint).
   - `3`: Script execution error.
3. **Judge Flagged Items Only (`strata-security-reviewer`):**
   - Open each flagged `file:line` hit to confirm whether it is a real vulnerability or a false positive/documented policy decision in `AGENTS.md` or `README.md`.
   - Write the risk report to `_internal/plans/<slug>.security.md` with the first line exactly `PASS`, `FAIL`, or `ESCALATE`, followed by findings ranked by severity with `file:line`, source, and date.
   - Return `ESCALATE` for any confirmed high or critical vulnerability.
   - **Never return `PASS` while any `NEEDS-DECISION` is open** (e.g., an unclassified shipped license or bundler-detected package): list each open decision in `CONFLICT` format with lettered options (`a*`, `b`, `c`) for the Director to relay to the Owner.
