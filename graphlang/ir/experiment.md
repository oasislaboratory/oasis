# Sparse indexed IR: first executable experiment

Session: 2026-10-29, America/Chicago. Objective: [Define Graph IR and reference syntax](objective.md).
Base inspected: `7ada987e53737319fd29e9911c57cfb34c4a27f2`.
Status: experiment verified; candidate semantics await founder review. The approved objective and its status are unchanged.

## Question and falsifiable hypothesis

Can a sparse collection at each ordered-pair address preserve enough information to distinguish objects, identities, parallel arrows, cycles, and empty addresses?

Hypothesis: a three-object fixture can be serialized to JSON and decoded with label-preserving structural equivalence, including identity selection and multiplicity at every address. Any lost arrow, changed endpoint/value, mistaken identity, or fabricated arrow falsifies the hypothesis for this fixture. This is a bounded example, not a proof for arbitrary graphs or a performance result.

## Established mathematics

A category has a collection of arrows for each ordered pair of objects, composition, and an identity arrow at each object satisfying unit laws. Identity arrows lie on the diagonal, but other endomorphisms can share that address. See [Stacks Project, Definition 4.2.1](https://stacks.math.columbia.edu/tag/0014).

Our distinguished loops supply candidate identity *data*. Without composition and its laws, this prototype is an indexed directed multigraph with distinguished loops, not a verified category. Neither a directed cycle nor a self-loop is evidence of recursive evaluation.

## Experimental implementation decisions

These rules are local to `oasis-ir-experiment-1`, not ratified Graph Lang semantics. JavaScript is a dependency-free test vehicle usable at a browser boundary; it does not select the production runtime.

- A graph is `{format: "oasis-ir-experiment-1", cells: [...]}`.
- Each occupied cell is `{i, j, arrows: [...]}`. Source is `i`; target is `j`. Indices are nonnegative JavaScript safe integers and need not be contiguous. Only occupied addresses are stored; no logical square is allocated.
- Each arrow is `{id, identity, value}`. IDs are nonempty strings, unique within each graph. A parallel arrow has a distinct ID even if its value matches another arrow.
- Exactly one arrow at each participating diagonal address has `identity: true`. Objects are derived from these distinguished arrows. Every endpoint must have one. Nonidentity diagonal arrows are allowed. Explicit empty cells, duplicate addresses, duplicate IDs, and unknown fields are rejected.
- `value` is either `{kind: "json", data: ...}` or `{kind: "graph", graph: ...}`. The latter recursively contains the same format with a local index/ID namespace. Values are inert data, not executable functions. JSON data is limited to ordinary JSON trees, with finite numbers and no negative zero. Dates, undefined, sparse arrays and containment cycles are rejected. Host objects, accessors and symbol properties are outside the intended input domain.
- `at(G, i, j)` returns a collection, including `[]` for a missing address between known objects. Unknown objects throw `RangeError`; malformed graphs throw `TypeError`. `identityAt(G, i)` selects by the marker rather than taking the first diagonal arrow.
- `encode` validates and sorts cells, arrows and JSON object keys. `decode` parses and validates. `equivalent` compares these normal forms: cell/arrow ordering and JSON key ordering do not matter, but indices, arrow IDs, markers, values and JSON array order do. This is label-preserving structural equality, not graph isomorphism, alpha-equivalence, or semantic equivalence.
- Normalization scans the stored representation. This first API has no optimized lookup index, resource limits, or benchmark claim. Deep containment can reach the JavaScript call-stack limit. Shared host references serialize as repeated values; reference sharing is not preserved.

## Runnable example and candidate reference syntax

From the repository root, with Node.js (verified using v24.22.1):

```sh
node --test graphlang/ir/ir.test.mjs
node --input-type=module <<'JS'
import {readFileSync} from 'node:fs';
import {decode, encode, at, identityAt, parseAddress, equivalent} from './graphlang/ir/ir.mjs';
const original = decode(readFileSync('graphlang/ir/three-object.json', 'utf8'));
const restored = decode(encode(original));
console.log('equivalent:', equivalent(original, restored));
console.log('identity:', identityAt(restored, 0).id);
console.log('0[1]:', at(restored, ...parseAddress('0[1]')).map(a => a.id));
console.log('0[2]:', at(restored, ...parseAddress('0[2]')));
JS
```

`i[j]` is an experimental address spelling, parsed into `(i, j)`, not a language evaluator, filesystem layout, or JavaScript indexing operation. `0[1]` denotes the entire arrow collection, never an arbitrary first arrow. Canonical numeric spelling rejects leading zeroes, whitespace, unsafe integers, and extra bracket segments. A future URL adapter must handle escaping separately.

`G[i][j][k]` is deliberately undefined. To inspect a nested graph in the current API, select an arrow by ID, then use `arrow.value.graph`; a browser path syntax for that sequence is still open.

## Observed verification

`node --test graphlang/ir/ir.test.mjs`: **11 tests passed, 0 failed**.
The runnable example above printed:

```text
equivalent: true
identity: id_0
0[1]: [ 'f', 'g' ]
0[2]: []
```

| Check | Observed result |
| --- | --- |
| Three objects, nine logical addresses | Six occupied cells; all nine address collections preserved |
| Identities and endomorphism | `id_0`, `id_1`, `id_2` selected; `loop_0` remains nonidentity |
| Parallel arrows | `f` and `g` remain distinct at `(0,1)` |
| Direction and cycle | `0 -> 1 -> 2 -> 0` preserved; reverse addresses stay empty |
| Empty addresses | `(0,2)`, `(1,0)`, `(2,1)` return empty collections |
| Structural comparison | Reordering is equal; removing, redirecting, renaming, or changing an arrow is unequal |
| Recursive values | Finite graph containment survives; nested storage order is irrelevant |
| Sparse labels | Replacing index `2` with `1000000` still stores six cells |
| Invalid inputs | Duplicate identities/IDs/addresses, dangling endpoints, malformed syntax, invalid nested graph, and lossy values rejected |
| Cycles versus containment | Edge cycle accepted; graph/data containment cycles rejected explicitly |

No unexpected test failures occurred. Browser navigation, filesystem persistence, composition, evaluation, and general graph isomorphism were not tested or implemented. No earlier runnable source or tests existed in the inspected tree; this adds the first local harness.

## Founder review: open questions and recommendation

1. **Identity designation:** explicit marker per arrow versus a separate identity table versus reserved arrow IDs. Recommend retaining explicit markers for the next experiment: they distinguish identities from other loops without imposing a naming convention. Algebraic validity remains unproved until composition exists.
2. **Object addressing:** stable numeric labels versus string IDs versus positional indices. Recommend testing relabeling and edits before ratifying either IDs or browser URLs; positional indices risk changing address meaning after edits.
3. **Recursive values:** finite tagged containment versus shared graph references. Recommend finite containment for the next fixture, with explicit arrow selection before descent. Shared or cyclic containment needs a reference scheme and separate equality rules.
4. **Composition:** free paths over generating arrows versus an explicit composition table/rewrite system. Neither is selected. Free completion can add infinitely many paths when cycles exist, changing what a finite address collection means.

Conjecture: the address/collection distinction can give Graph Browser uniform navigation without constraining graph structure to a tree. This session tests address parsing and data access only; a UI experiment is needed to assess that claim.

## Acceptance and next increment

The representative encode/decode/structural-comparison test now passes and the experimental syntax and assumptions are documented. The approved objective remains open pending founder review of the candidate contract; this experiment does not establish a final IR or reference language.

Next smallest experiment: relabel one object, serialize again, and verify all incident addresses and nested namespaces update consistently while unrelated arrow IDs and values remain unchanged. Use that result to choose stable labels and the reference syntax before implementing browser routes or composition.
