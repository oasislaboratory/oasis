# OKR Browser workflow contract v1

This is a proposed product contract. The companion [fixture](fixture.json) is a read-only source snapshot, not a runtime, database, deployed product, or customer result.

## User and hypothesis

Assumed initial user: the Oasis founder reviewing branch work. Assumed task: find the oldest eligible browser leaf, inspect its objective, evidence and prerequisites, then rehearse a status change without altering the live repository. Hypothesis: linked navigation and a visible edit comparison reduce navigation mistakes relative to reading the same pinned Markdown files. Neither demand nor usability is established.

## Snapshot and identity

- Source: `oasislaboratory/oasis` at `d385691583ea19ba51cc6b1cffc7607b9400d878`. Never silently refresh or mix commits during a session.
- Fixture envelope: `schema_version`, `source.repository`, `source.commit`, `documents`, and `nodes`. Each document carries `path`, complete UTF-8 `content`, and `git_blob_sha`. Preserve content byte-for-byte, including YAML, prose, unknown fields, spacing, and links.
- A node's `id` is its repository-relative objective directory, with `.` for root; `path` identifies its `objective.md` document. For example, ID `graphbrowser/01-workflow-contract` has path `graphbrowser/01-workflow-contract/objective.md`; root has path `objective.md`. Identity across snapshots is repository plus directory ID; identity in this experiment additionally includes source commit. Renames require an explicit mapping; titles and array positions are not IDs.
- `role` and `status` are projections of YAML, not replacements for source. `parent_id` is the nearest ancestor objective directory ID, or null for root. Parent/child edges express decomposition. `depends_on` lists reviewed objective directory IDs for prerequisites; hierarchy and dependency edges have distinct labels and traversal controls. Ordinary Markdown links do not automatically become prerequisites.
- `evidence_paths` lists included source documents relevant to a node. A status log is evidence of recorded assertions, not proof those assertions are true. Keep the raw source accessible beside projected fields.
- Root and founder prose remain immutable. The snapshot never becomes the editor's write target, including when editing a fixture derived from an in-scope branch.

The fixture dependency manifest is a reviewed interpretation of prerequisite language at this commit. Any inferred edge must be identified in fixture documentation; ambiguous links remain navigable links until reviewed. Validate dependency edges separately from containment and ordinary links; navigation links may be cyclic.

## One end-to-end task

1. Open the pinned DAG. Show repository, commit, fixture label, and counts. Browse the Graph Browser branch and select stable ID `graphbrowser/01-workflow-contract`, whose document path is `graphbrowser/01-workflow-contract/objective.md`.
2. Inspect its raw objective, canonical YAML status, available status/evidence documents, parent/children, and separately labelled prerequisites. Missing evidence must say “not included”; it must not imply completion.
3. Propose changing only this leaf's status from `planned` to `in_progress` in a disposable test overlay. Display the exact before/after field, source commit, and “unsaved” indicator. This rehearsed state is not a live repository assessment.
4. Save through the test storage adapter with expected overlay revision `0`; success returns revision `1`. Clear “unsaved” only after acknowledgement. Preserve node ID, all source text, unknown metadata, other nodes, and other overlay fields.
5. Reload from the same declared test storage boundary. Show the saved status with a test-override label and revision `1`; raw source still says `planned`. Compare the loaded overlay with the intended one-field change. Allow discarding the overlay and returning to the original snapshot.

## Editing and adapter boundaries

The only editable field in v1 is a test overlay's `status`, allowlisted to `planned`, `in_progress`, `ongoing`, `blocked`, `completed`, or `cancelled`. The prototype must visibly distinguish simulation from canonical status. The editor cannot change confidence/progress, prose, role, paths, dependency edges, or repository files. A simulated `completed` value makes no claim of verified acceptance and must carry the test-override label.

| Interface | Minimum contract |
| --- | --- |
| Snapshot loader | Load one fixture; validate schema, unique IDs, source hashes, parent references, dependency references, and projected metadata; return structured diagnostics. |
| Graph query | Lookup stable ID; list labelled containment and prerequisite edges; retrieve raw documents and evidence links without rewriting them. |
| Test edit | Create a patch `{node_id, field: "status", before, after}` tied to repository, source commit, and expected overlay revision. Validate before calling storage. |
| Test storage | `load(snapshot_key)` returns overlay plus revision; `save(snapshot_key, expected_revision, patch)` atomically rejects stale revisions or returns the new revision. Failed writes leave persisted state unchanged. |
| Runtime, deferred | Versioned graph input/output, environment lookup, execution result/error, and cancellation/resource boundaries require CIO evidence; loading JSON or navigating nodes is not Graph Lang execution. |
| Durable environment, deferred | Define authenticated ownership, durability/restart guarantees, isolation, migration/export, and conflict behavior before selecting or claiming a production database. |

An in-memory adapter may support save/reload within one process only and must declare that reset loses state. Browser storage may demonstrate one browser profile only; it does not establish server, multi-device, backup, or production durability. Hosting provider, authentication model, runtime protocol, production database, and deployment remain unresolved. They do not block this fixture contract; they do block claims of hosted/runtime/persistent-environment readiness.

## Deterministic acceptance scenarios

These are required pass/fail cases for a later implementation, not assertions that a UI already passes them. The offline fixture checker strictly rejects missing required metadata, malformed source, and invalid structure; it does not accept a damaged snapshot as intact. A future UI may offer best-effort read-only browsing of available documents with diagnostics and unknown labels, always disabling saving for the invalid snapshot. Fixture checks may verify source/graph invariants now; UI and adapter checks require execution evidence later.

| Case | Pass condition |
| --- | --- |
| Pin and open | Exact repository/commit displayed; selected stable ID resolves to the corresponding raw document. |
| Navigate | Parent/child and prerequisite edges retain their labels; following a link and returning preserves selected ID. Evidence opens the exact included document. |
| Valid edit/save/reload | The task above yields exactly the intended overlay patch and revision; source document hashes and unrelated fields are unchanged. |
| Invalid value or scope | Unknown status, missing node, unsupported field, root/prose write, and snapshot mutation fail before storage; validation message identifies field/node. |
| Unsaved/discard | Editing marks unsaved; discard restores persisted overlay; leaving or reloading with unsaved work requires an explicit discard decision. |
| Failed write | Adapter failure shows an actionable error, retains pending edit and unsaved indicator, and does not advance revision or falsely show saved. Retry is explicit. |
| Conflict | Two clients loaded at revision 0; first saves to 1; second's expected-0 write is rejected. Keep second's edit and show reload/compare controls; never silently overwrite. |
| Missing metadata | Offline validation rejects missing required metadata or malformed YAML. A future best-effort read-only UI labels missing status/role `unknown` and unfinished, shows diagnostics, and disables saving; do not invent values or eligibility. |
| Broken structure | Duplicate IDs, hash mismatch, invalid parent, or dangling prerequisite produce explicit diagnostics and disable saving for the invalid snapshot. Unresolved evidence/navigation links are visibly unavailable, never fabricated. |
| Cycles | Containment cycles or prerequisite cycles fail offline validation with a diagnostic identifying the error class. A cycle path is an additional future UI diagnostic requirement. Ordinary navigation cycles do not fail graph validation. |
| Missing storage | Browsing remains available; save is disabled with its missing dependency named. No fallback may silently change the declared persistence boundary. |
| Reset boundary | Restart/reset test matches the adapter's declared retention guarantee; narrower survival must not be labelled durable persistence. |

## Bounded usability experiment, not yet run

After an executable prototype passes deterministic checks, run one founder session with the same pinned fixture in two conditions: direct Markdown navigation (baseline) and browser navigation (variant). Use equivalent leaf/evidence/prerequisite lookup tasks, counterbalance task order, and keep source information and instructions equivalent. Budget: at most four tasks and 20 minutes; stop at the limit, on request, or on any risk of a live write. Record task success, wrong-node/edge selections, requested assistance, and elapsed task time as observations; retain failures. No outreach is authorized by this plan.

Success per task: identify the specified node, distinguish its evidence from prerequisites, and produce exactly the intended disposable patch after reload without assistance or unintended mutation. Any lost edit, wrong-node save, or false “saved” state is a failure. Fewer mistakes in the browser supports further testing of this workflow for this user and snapshot; equal/worse performance or confusion refutes the current interaction hypothesis enough to revise the design. A single founder session cannot establish customer demand, product-market fit, general usability, runtime correctness, or production durability. No numeric improvement is claimed before observations exist.
