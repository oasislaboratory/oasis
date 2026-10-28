# Candidate P0 conformance handoff

Disposition: candidate only. [P0 rules](../02-minimal-semantics/contract.md) at Oasis commit `4fc03a76c8f4faa7014173deba86c348b08c3ab0` are not founder-approved. Source head remains [6e57551](https://github.com/oasislaboratory/graph-lang/tree/6e575510ea5346dad35d75b41d4492b05ed75548) as of 2042-10-28. This package tests its own evidence machinery, not a Graph Lang runtime.

## Input and output boundary

[fixtures.json](fixtures.json) contains 42 authored request/expected-result pairs and rule mappings. Requests have exactly graph/path/input/budget/environment. Graph version is `p0`; immutable environment is `p0-int-v1`. Responses have either ok/value/steps or ok/code/steps/at, with the meanings and precedence in P0. No environment mutation, ambient lookup, implicit adjacency conversion or persistence is permitted by this candidate.

Each fixture has a derivation independent of any implementation. Positive cases cover composition, zero-edge identity, finite cycles, explicit identity and duplicate labels. Negative cases cover malformed representation, unknown vertex/function, primitive overflow, exhausted budget, invalid requests and error-precedence collisions. R1–R8 all have mapped cases; rule coverage does not imply exhaustive boundary coverage.

The fixture builder is a reproducible authoring script with literal expected outcomes, not an evaluator. The checker validates package structure/hash and compares captured results with strict JSON types. Evidence files reject duplicate JSON keys and non-JSON NaN/Infinity constants. Captures must pin both the contract and the canonical suite digest printed by verify.py; changing requests, expected results, rule mappings or derivations invalidates an older capture, even if IDs stay the same. This digest detects mismatch, not malicious fabrication. It does not establish that authored expectations are mathematically correct, run a runtime, attest provenance, or detect hidden side effects.

## Reproduce

From the Oasis repository root, Python 3 standard library only:

```sh
python3 graphlang/03-conformance-handoff/verify.py
python3 -m unittest discover -s graphlang/03-conformance-handoff -p test_verify.py -v
```

Optional regeneration: `python3 graphlang/03-conformance-handoff/build_fixtures.py`. Review any resulting diff. Do not regenerate a changed contract's digest and assume previous review still holds.

For a future authorized implementation, run every fixture request through its public invocation API, once in original order and once reversed in a fresh environment. Capture raw output and confirm inputs/environment are unchanged, repeated calls agree, and effects are absent. Report the exact source revision, command and runtime versions. Never generate runtime captures by copying `expected`.

A capture file must contain:

```json
{
  "evidence_kind": "runtime_capture",
  "implementation": "repository and entry point",
  "revision": "full tested commit SHA",
  "command": "exact invocation command",
  "environment": "OS and runtime versions",
  "contract_sha256": "copy the pinned contract digest",
  "suite_sha256": "copy suite_sha256 printed by verify.py",
  "results": [{"id": "P1", "result": {"ok": true, "value": -3, "steps": 2}}]
}
```

The illustrative single result is incomplete: include each of the 42 IDs exactly once. Then run `python3 graphlang/03-conformance-handoff/verify.py --responses capture.json`. Exit zero means captured results match; it does not independently attest that a runtime produced them. Attach raw logs and inspect the adapter. Self-tests use `mock_harness_test` and retain runtime=`not_run`.

## Remaining acceptance gaps

- No accepted contract or actual runtime capture exists. The leaf remains in progress, with progress percentage unset; candidate preparation is useful but does not meet the accepted-contract wording of criterion 2.
- Byte-level cases remain to specify: duplicate keys, malformed JSON, Unicode decoding/scalar validity, oversized transport and parser-depth exhaustion. P0 does not assign every parse/envelope failure an unambiguous code; resolve this before freezing a transport oracle.
- Exact/over-limit graph sizes (64/65), label and edge lengths (128/129), non-BMP scalar counting, path/budget limits (1025 vertices/1024 steps), both carrier endpoints and invalid booleans/empty edge names now have fixtures. Integer lexical forms and byte-level cases remain open. The suite is bounded, not exhaustive conformance.
- External cancellation, wall-clock deadlines, adapter unavailability, persistent state and UI error rendering are separate integration tests. No hosting, storage durability or customer outcome follows from these checks.

## Implementation request and CTO handoff

After founder acceptance and separate authorization, the owner of oasislaboratory/graph-lang should implement a pure P0 invocation entry point with shape/type/index validation, fixed environment lookup, ordered composition, exact step accounting and structured errors. Acceptance: all candidate fixtures match via captured public-API output; no graph/environment mutation; repeated results stable; raw-input/resource gaps above resolved and tested before claiming full conformance. Add a reproducible source-repository test command and pinned dependencies. No source change is requested as an already-approved action.

Local request to CTO: [the current boundary draft](../../graphbrowser/03-runtime-environment/boundaries.json) cannot directly execute these requests. Preserve the existing null/1 data/storage fixture. If P0 is accepted, add path/input/environment, permit budget zero, retain graph version `p0`, and preserve invalid_request/missing_edge plus steps/at diagnostics. Existing E1–E4 can map to P1/N1/N2/N5; E5 requires a real browser test that an absent runtime reports unavailable, never canned success. These are requests to the owner, not sibling edits or integration results.

## Acceptance evidence

| Objective criterion | Evidence and limit |
| --- | --- |
| Versioned I/O and environment | P0 plus concrete fixtures; candidate only |
| Required behavioral cases | 42 expected outcomes; adoption and runtime evidence absent; raw-input coverage incomplete; value-level boundaries expanded |
| Reproducible checks and mapping | verify.py, 17 harness self-tests, fixture rules/derivations; no evaluator executed |
| Implementation handoff | Scoped request above with explicit gates and missing capabilities |

[verification.json](verification.json) records executed package/harness checks. It is not runtime conformance evidence.

## Evidence reader versus language transport

Strict JSON reading here applies to fixture/capture evidence files only. It does not settle P0 transport semantics or test a runtime parser. Python integers and typed JSON comparison are evidence conventions, not a decision about whether wire inputs such as `2.0` or `2e0` denote valid language integers. A future transport proposal must resolve duplicate keys at different nesting levels, malformed/oversized input, Unicode failures, top-level envelope failures and exact numeric lexical handling before freezing their expected error codes. Do not silently promote evidence-reader behavior into language rules.
