---
role: Senior Engineer
status: planned
progress_percent: null
confidence_percent: 85
assessed_by: "Codex (exact model identifier unavailable)"
assessed_on: "2026-10-28"
scope: "graphbrowser/02-editor-prototype/01-explore-snapshot/"
---

# Senior Engineer — Inspect an objective and its prerequisites

Deliver a local read-only explorer of the [pinned OKR fixture](../../01-workflow-contract/fixture.json). User: founder reviewing work; friction hypothesis: Markdown navigation makes evidence and prerequisites hard to distinguish. Success: select a stable node, inspect its exact source and included evidence, follow a labelled prerequisite and return to the same node.

Acceptance criteria:
- Provide reproducible local startup and an importable view/data boundary inside this folder; no external services. Display repository, source commit and historical-fixture label. Do not imply this snapshot reflects current eligibility.
- Use an objective outline plus selected-node details; label parent/children separately from prerequisites. Resolve source/evidence by document path. Missing evidence reads “not included”. Preserve exact source bytes and unknown fields.
- Show loading, empty and invalid-input states. Validate the fixed fixture against the contract before treating it as intact; malformed metadata, duplicate IDs, bad hashes/references and hierarchy/prerequisite cycles produce diagnostics. Identify cycle paths. No edit/save/runtime controls claim to work.
- Keyboard users can select nodes, follow links and return with visible focus; selection is announced. At narrow width, stack outline and details without hiding controls. Record contrast checks and keyboard/responsive inspection separately from automated interaction results.
- Run pin/open and navigation acceptance checks against stable ID graphbrowser/01-workflow-contract. Verify return selection and exact evidence/source resolution. Record environment, commands, results and untested gaps in local status.md.

Dependencies: completed [workflow contract](../../01-workflow-contract/objective.md). Read its contract and fixture checker; never regenerate or modify that historical fixture implicitly.
Assessment: 85% for one local read-only workflow; no runtime or persistence integration needed. Next action: implement and test this bounded explorer. No delegation or assignment to another worker is implied.
