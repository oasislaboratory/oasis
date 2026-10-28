# Editor prototype status

## 2026-10-28 — bounded decomposition

- Scope: graphbrowser/; selected objective: this folder. Assessor: Codex (exact model identifier unavailable).
- Baseline: [f94c9f3](https://github.com/oasislaboratory/oasis/tree/f94c9f3650efccff6971faa7b59221bd105aab93), default branch main. Read root policy/README/objective, browser mandate, all browser objectives/status and completed contract, Graph Lang handoff/status/source-baseline inventory. Complete non-truncated tree has no descendant AGENTS.md. Only main branch; open issues/PRs list empty. No active browser child assignment marker found; this cannot exclude unrecorded activity.
- Selection: this objective introduced in [8adbbd4](https://github.com/oasislaboratory/oasis/commit/8adbbd44f71074907e717b747dcd07111ef5e1e8), tied with 03/04; 01 completed, 02 contract-unblocked and first by path. No existing children.
- Confidence: 40% to complete and verify the full prototype in one run. The inspected contract adds input integrity, immutable source, keyboard/responsive interaction, revision acknowledgement, two-client conflicts and failure recovery to a from-scratch UI. The earlier 75% concerned selecting a slice or decomposing, not implementing all criteria. This is a judgment, not measured performance. Decomposition-check confidence: 95%. Progress remains null; no implemented acceptance baseline exists.
- Result: [explore](01-explore-snapshot/objective.md) → [rehearse](02-rehearse-status/objective.md) → [verify recovery](03-verify-recovery/objective.md). Conditional child confidence: 85%, 75%, 80%. Each owns its artifacts and imports predecessor interfaces read-only. No worker was assigned and no child executed.

### User outcome and design

Founder hypothesis: inspect an objective, distinguish prerequisites from evidence, then rehearse a status change without modifying live records. Short path: pinned-source banner → branch outline → selected objective/source/evidence → labelled prerequisite and back → status comparison → acknowledged save → reload/compare. Outline/details representation prioritizes the concrete lookup task; a spatial graph canvas is not required for this first experiment.

Planned states: loading/empty/invalid fixture; selected objective with stable ID; unavailable evidence; canonical versus test status; unsaved, saving, saved, failed, conflicted and reset. Keyboard focus, labelled controls, announced selection/save feedback, readable contrast and stacked mobile layout are acceptance requirements, not verified capabilities.

Data boundary: reuse the versioned fixture and contract without inventing Graph Lang semantics. Separate immutable source from a repository+commit keyed status overlay. Proposed reversible test storage: single-process memory with atomic expected-revision checks; reload means adapter reload within that process, while reset loses data. This unlocks local edit testing without choosing a production database; tradeoff is no cross-session durability. Actual persistence/runtime remain in 03-runtime-environment and CIO handoff.

### Coverage and verification

| Parent acceptance | Planned owner/evidence |
| --- | --- |
| Reproducible explorer/details/dependency navigation | 01-explore-snapshot, executed lookup/return checks |
| Bounded edit/validation/save/reload/unsaved/error | 02-rehearse-status plus 03 failure/conflict harness |
| Identity/source/unrelated-field preservation | 01 source validation, 02 before/after checks, 03 integration regression |
| Actual verification and mock/storage limits | Each local log; 03 complete contract matrix |
| In-folder artifacts; no deployment/live writes | All child scopes and publication path review |

Verification this run is planning-only: required metadata/scopes, three-child count, unchanged original objective body, dependency/link resolution and no new dependency cycle. [verification.json](verification.json) records executed structural checks. No browser, build, storage, Graph Lang runtime or usability session ran. Source baseline inventory was read, not independently rerun. No observed user feedback exists.

Next experiment after implementation: the contract's at-most-four-task, 20-minute founder comparison; success requires correct node/evidence/prerequisite identification and exact reloaded patch without help or unintended change. Collect nothing until authorized. Founder results would be internal dogfood evidence only.

Next eligible subtree leaf must be recomputed by introduction commit, not numeric folder nesting: older 03-runtime-environment is contract-unblocked and precedes these new children; its real-runtime portion awaits CIO evidence. Then 01-explore-snapshot can execute when it is oldest eligible. Release preparation remains gated.

No founder decision needed for this decomposition or reversible local test boundary. Stop expansion for this run.
