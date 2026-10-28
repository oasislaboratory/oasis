# Candidate documentation consistency matrix

Source inspection: [graph-lang at 6e57551](https://github.com/oasislaboratory/graph-lang/tree/6e575510ea5346dad35d75b41d4492b05ed75548), unchanged on 2026-10-28. Pinned content is retained in [the baseline snapshot](../01-source-baseline/source-snapshot.json). P0 and T0 are proposals; their fixture checks do not verify the implementation.

| Source definition/example | Candidate connection | Current evidence / required check |
| --- | --- | --- |
| docs/0-Introduction.md: graphs as program representations | P0 R3–R6; P1 composition | Thesis only. Pass later when a public runtime produces -3 in two steps from the stated graph/input/path. |
| docs/1-Graphs.md: unordered incidence definition | P0 R2 directed row-to-column interpretation | Different graph classes, not a contradiction if explicitly introduced. Preserve the quotation. Explain the transition to a directed computational model; do not imply Murty's definition supplies execution semantics. |
| docs/3-Arrows.md: edges as functions/morphisms | P0 R3, R5–R6; P1–P4 | Research proposal. Distinguish a directed graph from its composable paths and identity paths. Runtime identity/composition remain untested. |
| src/lib/graph.json: labels plus null/1 matrix | P0 R1, N9; T0 T4 | Data fixture only. No automatic 1-to-function conversion; an adapter must ask for explicit function names. Pass if data stays unchanged and execution rejects this unconverted tuple. |
| src/routes/[vertex]/+page.js: index lookup | P0 R2, N2; T0 numeric rules | Source inspection establishes intended navigation validation only. Route syntax and execution JSON numeric syntax are separate interfaces; do not infer 2e0 is an accepted URL. |
| docs/4-Recursion.md through docs/7-Semantics.md: blank placeholders | P0 finite paths; T0 wire profile | No current definitions to validate. Proposed outlines must label recursion unsupported and avoid claiming P0/T0 adopted. |

Links: [P0](../02-minimal-semantics/contract.md), [value fixtures](../03-conformance-handoff/fixtures.json), [T0](../03-conformance-handoff/transport.md), [byte fixtures](../03-conformance-handoff/transport-fixtures.json).

Completed planning follow-through: [proposed passages/outlines](passages.md), [repeatable review with pass/fail criteria](review.md), and [verification record](verification.json). This is source-to-proposal traceability; no implementation/textbook file was changed and no evaluator, application or customer behavior was tested.
