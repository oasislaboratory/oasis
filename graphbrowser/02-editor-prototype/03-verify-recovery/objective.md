---
role: Senior Engineer
status: planned
progress_percent: null
confidence_percent: 80
assessed_by: "Codex (exact model identifier unavailable)"
assessed_on: "2026-10-28"
scope: "graphbrowser/02-editor-prototype/03-verify-recovery/"
---

# Senior Engineer — Verify failure recovery and prepare a truthful demo

Exercise the [status rehearsal](../02-rehearse-status/objective.md) from this folder with an integration harness and reviewable evidence. User: someone deciding whether a saved edit can be trusted. Success: no lost pending edit, false saved acknowledgement or silent overwrite in deterministic failure cases.

Acceptance criteria:
- Map every deterministic scenario in [contract v1](../../01-workflow-contract/contract.md) to an executed test or explicit unmet criterion. Include invalid fixture/metadata/cycles, unavailable evidence/storage, reset boundary and source preservation. Any unmet required scenario keeps the parent incomplete.
- Inject a failed write: persisted value and revision stay unchanged, pending edit remains visible, error names an explicit retry. Load two clients at revision 0; save first to 1; reject the second expected-0 save, preserve its draft and expose reload/compare without overwrite. Verify UI feedback as well as adapter return values.
- Run the whole open → inspect → edit → save → reload → compare journey; include keyboard navigation/focus, readable contrast and narrow-width controls. Record exact environment, commands, inspected versus executed behavior, failures and limitations. Screenshots supplement interaction evidence only.
- Provide a concise onboarding/demo script using verified capabilities: “Explore a pinned Oasis objective graph and rehearse a status change.” Retain “local fixture”, “test override”, actual retention boundary, and unavailable runtime/hosting labels; revise copy if checks do not support it.
- Prepare the contract's bounded founder comparison session and observation template, including task success, wrong-node saves, assistance and elapsed time. Do not collect user data or contact participants. Recommend the next experiment and retain external usefulness/retention as untested hypotheses.

Dependencies: verified [explorer](../01-explore-snapshot/objective.md) and [rehearsal](../02-rehearse-status/objective.md). Harness may import them read-only. Failures needing sibling edits become scoped follow-up requests to the CTO, not silent writes outside this child.
Assessment: 80% for executing/reviewing the bounded harness once dependencies are present; failing checks are valid evidence but do not complete acceptance. Next action when eligible: run and record tests, then reconcile parent acceptance.
