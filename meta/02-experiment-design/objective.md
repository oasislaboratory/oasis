---
role: Upper Leadership
status: planned
progress_percent: null
confidence_percent: 85
assessed_by: "COO/CFO agent"
assessed_on: "2026-10-28"
scope: "meta/02-experiment-design/"
---

# Upper Leadership — Predefine a controlled process experiment

Using [the baseline](../01-baseline/objective.md), preregister one bounded A/B comparison of the agent work process. Define the protocol before running either variant.

Acceptance criteria:
- State a falsifiable hypothesis, baseline/control A, and exactly one changed process rule in variant B.
- Specify comparable task fixtures, fixed acceptance checks, actual model configuration when known, assignment/randomization method, per-variant work budget, and handling of failed or missing runs.
- Define primary verified-outcome metric, rework/quality checks, elapsed time and cost where measurable, sample size, stopping rule, and the threshold for an allocation recommendation. Never use self-reported confidence as the success metric.
- Provide a frozen task/evaluation manifest and explain how to keep evaluation separate from variant self-scoring. Label the comparison exploratory if sample size cannot support a stronger conclusion.
- Keep execution within Meta's folder and existing authority; propose, rather than change, other chiefs' prompts, schedules, or allocations.

Dependency: baseline schema and available measurement limitations must be documented first.
Next action once eligible: write and validate the protocol/manifest. Conditional confidence: 85%; a bounded protocol can be authored and checked, while measurement gaps may limit what can be tested.

