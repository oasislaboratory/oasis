# Workflow contract evidence

This package completes specification/fixture preparation only. Start with
[contract.md](contract.md); the [fixture](fixture.json) embeds immutable source
documents from [d385691](https://github.com/oasislaboratory/oasis/tree/d385691583ea19ba51cc6b1cffc7607b9400d878).
It intentionally predates this objective's completion. Its `planned` status is
historical source, not current branch status.

## Reproduce

Requires Python 3.10+ and PyYAML (verified with Python 3.12.14 / PyYAML 6.0.3).
No browser, server, runtime, account, or network is required for these checks.

```sh
python graphbrowser/01-workflow-contract/verify_fixture.py
```

Expected: `fixture: PASS`, 21 documents, 15 nodes, 14 hierarchy edges,
11 prerequisite edges, and ten rejected corruption cases. Captured output:
[verification.json](verification.json). These are integrity checks, not a browser,
storage-adapter, or Graph Lang test suite. JSON/schema handling is deliberately
limited to this fixed fixture; a general untrusted-input loader needs a later
implementation and validation tests. Blob hashes check exact UTF-8 preservation;
the creation review separately compared each declared blob SHA against the
pinned GitHub tree. They are not an authentication mechanism for modified fixtures.

## Reviewed prerequisite manifest

IDs are objective directory paths; root is `.`. `path` resolves the corresponding
objective document. Parent IDs follow directory containment. This explicit
prerequisite set is separate from ordinary Markdown navigation:

| Dependent ID | Required IDs | Source |
| --- | --- | --- |
| graphbrowser/02-editor-prototype | graphbrowser/01-workflow-contract | Dependency paragraph |
| graphbrowser/03-runtime-environment | graphbrowser/01-workflow-contract | Dependency paragraph |
| graphbrowser/04-release-validation | graphbrowser/02-editor-prototype; graphbrowser/03-runtime-environment | Dependency paragraph |
| graphlang/02-minimal-semantics | graphlang/01-source-baseline | Dependency paragraph |
| graphlang/03-conformance-handoff | graphlang/02-minimal-semantics | Dependency paragraph |
| graphlang/04-documentation-consistency | graphlang/02-minimal-semantics; graphlang/03-conformance-handoff | Dependencies paragraph |
| meta/02-experiment-design | meta/01-baseline | Dependency paragraph |
| meta/03-evaluate-allocation | meta/01-baseline; meta/02-experiment-design | Dependency paragraph |

These are manually reviewed whole-objective prerequisites, not automatic link
inference or a complete semantic model of milestone eligibility. In particular,
real runtime verification also requires an available documented executable Graph
Lang runtime; that external capability is unresolved, not an invented completed
node. Coordination links between chiefs are navigation, not reciprocal blocking
edges. A future browser must show unmet capability gates separately.

`evidence_paths` includes adjacent status logs present in the pinned input. No
adjacent log means an empty list, not proof of no evidence elsewhere. Links inside
raw Markdown stay byte-for-byte; artifacts outside the included 21-document
catalog require explicit fetching and must otherwise display “not included”.
The snapshot copies source for an isolated experiment and grants no sibling write
authority. It is not an attempt to update or supersede source records.

## Acceptance review, 2026-10-28

| Objective criterion | Evidence and verification class |
| --- | --- |
| Initial user/task/benefit stated as assumptions | Contract user/hypothesis and unrun experiment; planning review |
| Stable identity, hierarchy, prerequisites, metadata, raw preservation | Fixture + manifest above; offline checks and source/tree comparison |
| Open → inspect → propose → test save → reload → compare | Contract end-to-end task; specification review, not executed behavior |
| Deterministic acceptance, bad/missing input, usability implications | Contract scenarios + integrity rejection checks; UI cases and usability session remain unrun |
| Interfaces, unresolved runtime/storage/hosting/customer boundaries | Contract adapter table and deferred dependencies; planning review |

All five criteria concern a specification and checked fixture. Completion does not
claim the later editor or adapters exist. The next eligible objective is
[02-editor-prototype](../02-editor-prototype/objective.md); implement a local,
fixture-only explorer and disposable status overlay, then run the contract's
behavioral checks. No deployment or live-repository editor is authorized here.
