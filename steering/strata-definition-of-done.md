# Definition of done

Intent: a completion claim rests on evidence that the result meets the plan.
Applies: before calling any task done, fixed, passing or complete.

- Run the verification command, read the output, then make the claim. "Should work" is never evidence.
- Every criterion in `_internal/plans/<slug>.criteria` must pass (`node ~/.agents/skills/strata-lifecycle/scripts/verify-plan.mjs`), and the blueprint, code, tests, and repo documents must agree.
- Every work report ends with `Not done` (`N1`...) stating explicitly what was not built or not verified.
- Mandatory Read Gate: before closing a feature or claiming completion on planned work, read `~/.agents/skills/strata-lifecycle/references/lifecycle.md` (Sections 5–6).
