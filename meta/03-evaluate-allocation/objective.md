---
role: Upper Leadership
status: planned
progress_percent: null
confidence_percent: 70
assessed_by: "COO/CFO agent"
assessed_on: "2026-10-28"
scope: "meta/03-evaluate-allocation/"
---

# Upper Leadership — Evaluate variants and recommend allocation

Run the [preregistered comparison](../02-experiment-design/objective.md) within its defined scope and budget, then report whether evidence supports changing allocation. Do not modify schedules, other branches, financial assets, or spending.

Acceptance criteria:
- Preserve the frozen protocol reference and raw records for both variants, including failures, missing measurements, verification outputs, model identity when available, and deviations.
- Evaluate both variants against the same independent acceptance checks; report paired or otherwise protocol-defined comparisons and limitations.
- Apply the stopping rule and recommendation threshold without changing them after seeing results. State inconclusive when evidence is insufficient.
- Propose retain/change/collect-more-evidence with rationale, expected tradeoffs, and a bounded next iteration for evolutionary improvement. Any consequential allocation change remains a founder decision.

Dependency: baseline and frozen experiment protocol; execution is ineligible until those exist. If the protocol is too large for one run, decompose this objective before executing it.
Next action once eligible: inspect the frozen protocol and execute a bounded comparison or decompose its execution. Conditional confidence: 70% through bounded execution or further decomposition; confidence in demonstrating an improvement is unknown.

