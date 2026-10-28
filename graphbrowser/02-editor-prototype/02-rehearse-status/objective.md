---
role: Senior Engineer
status: planned
progress_percent: null
confidence_percent: 75
assessed_by: "Codex (exact model identifier unavailable)"
assessed_on: "2026-10-28"
scope: "graphbrowser/02-editor-prototype/02-rehearse-status/"
---

# Senior Engineer — Rehearse a status change and recover it

Deliver an editor entry point within this folder that imports the read-only [explorer](../01-explore-snapshot/objective.md), without changing sibling files. User: founder rehearsing a status update. Success: planned → in_progress on the pinned contract leaf, acknowledged save at revision 1, reload and exact comparison, with raw source unchanged.

Acceptance criteria:
- Follow [contract v1](../../01-workflow-contract/contract.md). Permit only a status overlay for an allowed non-root fixture node; reject unknown status/node, unsupported fields, root/prose writes and snapshot mutation before storage.
- Show canonical status beside “Test override”; use a labelled status selector, exact before/after comparison, Save, Reload and Discard controls. Mark unsaved immediately and saved only on acknowledgement. Require an explicit discard decision before leaving/reloading pending work.
- Define and exercise load(snapshot_key) and atomic save(snapshot_key, expected_revision, patch). Key by repository and commit. A single-process in-memory test adapter is acceptable: visible copy must state page/process reset loses state. No localStorage compare-then-write presented as atomic multi-client storage.
- Verify save/reload within the declared boundary and test reset loss. Compare original document hashes, stable identity, unknown fields, unrelated nodes and overlay fields before/after. Discard returns to saved overlay; provide a separate explicit reset-overlay action to return to the original snapshot.
- Retain usable browsing when storage is absent; disable saving with its reason. Record actual executable checks, startup instructions and limitations. Keep Graph Lang execution and production persistence visibly unavailable.

Dependencies: [explorer](../01-explore-snapshot/objective.md) with a verified reusable interface, and the completed workflow contract.
Assessment: 75% once explorer interface exists, for one status-rehearsal workflow with a deliberately narrow test storage boundary. Next action when eligible: implement and test. Production adapter selection remains a separate objective.
