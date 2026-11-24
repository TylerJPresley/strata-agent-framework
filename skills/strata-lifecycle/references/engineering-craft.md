# Engineering Craft Reference

Intent: provide concise, domain-specific engineering checklists for the Planner, Implementer, and Reviewer so architecture, backend, data, web, systems, cloud, and reliability standards hold without loading 12 separate skills.
Applies: during Stage 2 (Planning), Stage 3 (Implementation), and Stage 4 (Independent Review), loading only the section matching the work's domain.

## 1. Requirements & Analysis
- Derive every requirement from user intent or evidence in existing code; state **what** the system achieves before **how** it is built.
- Trace Goal → User Story / Value Scenario → Acceptance Criteria. Assign stable IDs (or Strata Blueprint IDs) and record non-obvious rationale.
- Write standing rules in **EARS** form (`WHEN <trigger>, THE SYSTEM SHALL <result>`) and behavior scenarios in **Given/When/Then** (see `~/.agents/skills/strata-lifecycle/assets/ears-gwt.md`).
- When modifying legacy/existing code: reconstruct actual behavior (bugs and implicit contracts included) from code and tests first, identify bounded contexts and data flows, and state the exact gap between current and intended state.

## 2. Architecture & Design Boundaries
- **Module Boundaries:** Draw module boundaries where internals are cohesive, cross-module coupling is narrow, and modules can be built and tested in parallel without file collisions. Prefer fewer, larger modules in small codebases.
- **Monolith First:** Start as a modular monolith; introduce a network/service boundary only when independent deployment, distinct scaling, or hard security isolation requires it.
- **State Ownership:** Every piece of state (in-memory, disk file, database table) has exactly **one authoritative owner/writer**.
- **Hyrum's Law:** Once an observable behavior has consumers, treat it as a de facto contract alongside the written spec. Design interfaces to be hard to misuse.
- **Decision Format:** Record every architectural choice as: **Decision** (one sentence), **Why** (constraint or trade-off), and **Consequence** (what it forecloses or makes harder).

## 3. Backend & API Engineering
- **Layer Separation:** Keep transport (HTTP/RPC/CLI), business domain logic, and data access in separate layers with narrow function signatures.
- **Boundary Validation & Status Codes:** Validate all inputs against a schema at the entry boundary. Shape APIs around resources with accurate semantics (`2xx` success, `4xx` caller error, `5xx` server fault) and health endpoints. Version only on unavoidable breaking changes.
- **Idempotent Writes:** Mutating endpoints accept an `Idempotency-Key` derived from immutable intent, claim it atomically via a unique constraint, reject key reuse with a mismatched payload hash, and define deterministic behavior for in-flight duplicates.
- **Explicit Error Handling:** Catch specific error types, attach structured diagnostic context (`request_id`, operation, safe inputs), retry transient network/lock errors with exponential backoff + jitter, and fail fast on permanent errors.
- **Boundary Testing:** Test public interfaces and real integration paths; mock only external third-party boundaries.

## 4. Data Engineering & Storage
- **Model Before Store:** Model entities, invariants, and relationships before picking a storage engine. Give every fact one canonical representation.
- **Right Store for the Job:** Use ACID relational databases (e.g., PostgreSQL) for core transactional state, in-memory stores (e.g., Valkey/Redis) for ephemeral caching/locks, and document/object stores for unstructured scale.
- **Safe Access & Migrations:** Evolve schemas exclusively through automated, reversible migrations. Place data access behind repository abstractions with connection pooling and parameterized queries/ORM builders (never raw string-interpolated SQL).
- **Audit Columns & Soft Delete:** Track `created_at`, `updated_at`, and actor identity on core records; prefer explicit soft-delete or archival patterns where audit history matters.

## 5. Systems & CLI Engineering
- **Pipeline & Shell Predictability:** A CLI or daemon must behave identically in a non-interactive pipeline as in an interactive terminal. Send primary data output to `stdout` and all logs, progress, and errors to `stderr`.
- **Signals & Resource Hygiene:** Handle `SIGINT` and `SIGTERM` gracefully (drain work, remove temp/lock files, exit with standard codes). Bound file descriptors, child processes, and memory growth; pool repeated I/O connections.
- **Discoverable Help:** Provide `--help` grouped by workflow with concrete runnable examples and `<angle-bracket>` placeholders rather than hardcoded magic values.
- **Packaging & Versioning:** Follow SemVer strictly and declare accurate runtime/OS dependency metadata.

## 6. Web & Frontend Engineering
- **Performance by Default:** Optimize the critical rendering path and Core Web Vitals (LCP, INP, CLS). Compress assets (Brotli/gzip), lazy-load non-critical routes, and serve responsive images (`srcset`, WebP/AVIF) with explicit cache headers.
- **Accessibility (WCAG 2.1 AA):** Use semantic HTML (`<main>`, `<nav>`, `<button>`), mobile-first responsive layout, keyboard navigability, `aria-label` where semantics need reinforcement, and immediate visual feedback for every user action.
- **Discoverability & Rendering:** Match rendering strategy (SSR, SSG, ISR, SPA) to content dynamism and SEO needs; ship `sitemap.xml`, `robots.txt`, and structured metadata where public-facing.
- **Component Composition:** Build UIs from small, stateless, testable components with explicit state ownership.

## 7. Cloud Operations & Infrastructure
- **Infrastructure as Code (IaC):** Define all infrastructure and deployment topology in code (Terraform, CDK, Compose, or declarative deploy scripts). Never hand-edit live hosts (`source -> deploy` pattern).
- **Small, Reversible Rollouts:** Build immutable artifacts once and promote across environments with blue/green, canary, or atomic swap deployments.
- **Runtime Secrets & Encryption:** Inject secrets at runtime from a vault or protected environment; enforce encryption at rest and TLS 1.2+ in transit.
- **Pre-Mortems:** Test failure recovery and rollback paths before production cutover.

## 8. Reliability & Observability (SRE)
- **Error Budgets & SLOs:** Define quantitative SLIs (latency, error rate, saturation) and realistic SLOs. When an error budget is exhausted, prioritize stability and bug fixes over feature velocity.
- **Telemetry First:** Define the questions an operator needs answered during an outage, then instrument with structured JSON logs (carrying correlation IDs and entry-point tags), RED metrics (Rate, Errors, Duration) per service, and USE metrics (Utilization, Saturation, Errors) per host resource.
- **Actionable Alerting & Resilience:** Alert on user-visible symptoms (never noisy internal causes) with a linked runbook. Wrap external calls in timeouts and circuit breakers. Hold blameless post-mortems that turn incidents into automated checks or `lessons.md` entries.

## 9. Product Strategy & Communication
- **Ship Small & Iterate:** Deliver the smallest self-standing feature that provides real value, verify it in a real environment, and leave the codebase cleaner than you found it.
- **Wrap Third-Party Dependencies:** Isolate external SDKs and third-party APIs behind a local adapter interface with timeouts, retries, and circuit breakers.
- **Docs as Code:** Keep `README.md`, `CHANGELOG.md`, `AGENTS.md`, and blueprints synchronized in the same feature lifecycle as the code.
