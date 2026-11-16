# Round 004 comparison — not yet executed

**No A/B conclusion is available.** The founder authorized design/preparation only. All 12 runs are unstarted; acceptance, cost, time, attempts, interventions and reference metrics are null, not measured zeros.

The manifest/assignment and deterministic harness are ready for review. The reference sets have **not** received human review. The model/provider/billing controller remains a prerequisite. Sandbox preflight failed in this host, so experimental code verification must remain blocked.

## Preparation evidence
- [Baseline tests](evidence/baseline-tests.txt): 11 passed.
- [Broker/assignment/scoring tests](evidence/preparation-tests.txt): 12 passed.
- [Isolation preflight](evidence/isolation-preflight.json): failed; no unsafe fallback.
- [12-slot outcome ledger](evidence/outcomes.json): all not_run; no fabricated raw run logs.
- [Design and frozen predictions](DESIGN.md), [task/reference manifest](manifest.json), [candidate freeze](freeze.json).

## Comparison
| Metric | A | B |
| --- | --- | --- |
| Runs executed / scheduled | 0 / 6 | 0 / 6 |
| Verified completions | Not measured | Not measured |
| Actual experimental API spend | $0 — no calls | $0 — no calls |
| Cost per verified completion | NA | NA |
| Time to verified completion | NA | NA |
| Unauthorized attempts / integrity violations | Not measured | Not measured |
| Human interventions | Not measured | Not measured |
| Context/dependency precision and recall | Not measured | Not measured |

Preparation assistant billing is unavailable and separate from experimental API spend. Zero calls do not imply free preparation.

## Interpretation and recommendation
The preparation tests support the limited broker behavior under tested inputs; they do not establish hostile-code sandbox safety, provider billing enforcement or graph-scoped task performance. Synthetic small tasks and curated dependencies limit external validity. A single bundled comparison cannot attribute effects to ancestry, directives or dependency edges individually.

**Revise readiness, then review for authorization.** The next engineering change should integrate the prepared controller kernel with a pinned provider adapter and durable logger on a host with verified sandbox isolation and process/resource limits. It must enforce per-request worst-case cost reservation, aggregate/run ceilings, hard deadlines, cancellation confirmation and usage reconciliation, with provider-specific validation beyond the passing deterministic fake-provider tests before paid runs. This recommendation follows the observed preparation blockers, not evidence that B outperforms A. Do not expand the production MVP or claim superiority on this record.
