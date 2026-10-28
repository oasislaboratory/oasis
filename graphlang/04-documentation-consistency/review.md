# Repeatable docs/source consistency review

This completes a review plan, not a verification of the language implementation. Inputs: source snapshot `6e575510ea5346dad35d75b41d4492b05ed75548`; Oasis baseline `757cf1fa80b5f969b129444c47fdc9a6fde3d768`; [P0](../02-minimal-semantics/contract.md), [T0](../03-conformance-handoff/transport.md), [value fixtures](../03-conformance-handoff/fixtures.json), [byte fixtures](../03-conformance-handoff/transport-fixtures.json). Freeze exact commits and contract/suite hashes in every future review record.

## Procedure

1. Fetch the current source and Oasis default branches. If either relevant content changed, pin new commits and review the diff before reusing an earlier finding. Read applicable AGENTS policies. Preserve source/doc wording and quotation unless edits are separately authorized.
2. For every row below, read the source, proposed passage and named fixtures. Check the value, steps, error code and representation claims manually against the candidate rules. Mark editorial consistency pass/fail with a concise reason. A missing rule or changed premise is a failure requiring revision, not a guessed result.
3. Run the baseline/package/evidence checks below. Record exact commands, environment, exits and failures. Their success means artifacts are internally checkable; it does not change runtime evidence from not_run.
4. Once an accepted implementation exists, invoke its public API on the named fixtures (raw bytes for T0). Preserve raw outputs, source revision, contract/suite hashes and execution command. Run capture comparison and inspect adapter provenance, input/environment immutability, deterministic repeats and error paths. Any output mismatch fails executable consistency. Missing execution remains not_run, never pass.
5. Before publication, confirm proposed versus adopted labels, matching source/example versions, complete citations and no claims broader than evidence. Apply only separately authorized source/doc edits. Recheck after changes. Keep failed reviews and previous records rather than rewriting history.

## Example acceptance

| ID | Required editorial check | Executable pass condition / current state |
| --- | --- | --- |
| D1 | Thesis distinguished from implemented navigation; complete P1 graph/input/path described | P1 value=-3, steps=2; not_run |
| D2 | Unordered quotation preserved; directed convention explicitly introduced; reverse edge not assumed | P0 N3 gives missing_edge with steps=0, at=0; not_run |
| D3 | Value identity separated from operational step counts; overflow/partiality caveat retained | P1=-3/2 steps; P2=2/0; P4=2/1; N6 evaluation_error/0/at 0; not_run |
| D4 | Legacy adjacency not silently interpreted as program; migration remains proposed | N9 invalid_graph/0/at null; source data unchanged; not_run |
| D5 | URL spelling and JSON numeric value rules separated | T0 integer-2.0 and integer-2e0 → 2/0 steps; range-2.5 → invalid_request/0/at null; URL behavior needs a separate browser test; not_run |
| D6 | Four placeholders acknowledged; finite cycle not called recursion; error ordering documented | P3=-3/3; carrier-identity-9007199254740991 succeeds/0; N6 evaluation_error; N3 missing_edge; N4-budget budget_exhausted/0/at 0; N5 budget_exhausted/1/at 1; not_run |

Slash-separated values above abbreviate result fields, not informal tolerance: compare the full result objects in the fixtures. Runtime evidence cannot be inferred from the editorial pass recorded in [verification.json](verification.json).

```sh
python3 graphlang/01-source-baseline/verify_baseline.py
python3 graphlang/03-conformance-handoff/verify.py
python3 graphlang/03-conformance-handoff/verify_transport.py
python3 -m unittest discover -s graphlang/03-conformance-handoff -p 'test_*.py' -v
```

## Requests and acceptance of this planning objective

- Founder: review P0/T0 as a bounded experiment, including partial-function/resource semantics and transport tradeoffs, before adoption. No acceptance is inferred from this plan.
- Implementation owner: after separate authorization, implement the accepted rules, expose a reproducible public invocation command and supply real captures. Pinned source currently demonstrates no evaluator entry point. The concrete request remains [the conformance handoff](../03-conformance-handoff/README.md).
- Documentation owner/founder: review [six proposed passages/outlines](passages.md); preserve the direct quotation and author's voice. Verify any added external citation before inclusion. Source/textbook changes require separate authorization.
- CTO: continue to distinguish navigation, execution and storage; use the candidate adapter requests in the conformance handoff when a runtime becomes available. No sibling write requested as already authorized.

The four planning criteria are satisfied by matrix.md (traceability), passages.md (gaps and proposed text), this protocol/table (repeatable pass/fail review), and the requests above with verification.json (evidence classes). The bounded planning leaf can complete while conformance/adoption remain blocked. No observed customer evidence exists in this package.
