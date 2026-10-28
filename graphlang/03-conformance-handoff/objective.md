---
role: Upper Leadership
status: blocked
progress_percent: null
confidence_percent: null
assessed_by: "Codex (exact model identifier unavailable)"
assessed_on: "2026-10-28"
scope: "graphlang/03-conformance-handoff/"
---

# Upper Leadership — Define executable conformance and integration acceptance

Turn the [minimal semantics](../02-minimal-semantics/objective.md) into a bounded conformance specification and implementation handoff. Coordinate with the [Graph Browser runtime objective](../../graphbrowser/03-runtime-environment/objective.md) through local requests only.

Acceptance criteria:
- Specify versioned graph input/output, execution result/error, and environment boundaries with deterministic fixtures and expected outcomes.
- Cover valid execution, malformed representation, unknown reference, evaluation failure, and termination/resource behavior as required by the accepted contract.
- Define a reproducible verification command/protocol and map each fixture to the rule it checks; label reference/mock checks separately from real runtime results.
- Request implementation in oasislaboratory/graph-lang with exact missing capabilities and acceptance criteria. Inspect/test real behavior only when available and authorized; never report fixture validation as runtime integration.

Dependency: minimal semantics. Next action once eligible: author a bounded conformance package or decompose it. Confidence 80% for that next action. Separate implementation-repository write authorization is required for source edits, not for this specification.

Candidate increment: [fixtures, protocol and remaining gaps](README.md); [executed package/harness checks](verification.json). Accepted-contract and runtime claims remain unverified; progress stays null.

Latest evidence: 42 candidate cases and 17 passing checker self-tests; transport/lexical rules subsequently proposed in T0, pending adoption. See [status](status.md).

Current gate: candidate P0/T0 adoption; [transport proposal](transport.md) and byte fixtures are prepared. Remaining accepted-contract criterion is blocked; candidate documentation work may proceed in 04.
