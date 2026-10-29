# Define Graph IR and reference syntax

**Parent:** [graphlang](../objective.md)  
**Owner:** Founder  
**Approval:** Approved  
**Status:** Not started  
**Depth:** 3 of 3  
**Priority:** 1 — first implementation priority

## Objective

Specify a general graph intermediate representation and readable reference syntax, with documented examples and round-trip tests.

## Acceptance criteria

A representative graph can be encoded, decoded, and compared for structural equivalence; syntax and assumptions are documented.

## Dependencies and boundaries

First implementation priority; begin here.

## Evidence

No implementation or verification evidence recorded yet. Update only when work is actually inspected or tested.

## Agent instructions

Agents may execute bounded authorized work and propose changes. Do not create deeper OKR folders or rewrite this approved objective without founder approval.

## Proposed IR experiment — founder review pending

### Representation

Explore a full square, ordered-pair-indexed graph `G[i][j]`, with the diagonal `G[i][i]` identifying objects via their identity morphisms and off-diagonal entries addressing morphisms from source `i` to target `j`. Treat the square as a **logical address space**, not a requirement to allocate a dense matrix: a sparse implementation should be acceptable.

An identity morphism `id_i: i -> i` represents object `i`; it is not literally the object. Because `G[i][i]` may also contain nonidentity endomorphisms, specify how the identity is distinguished from other arrows at the same address.

Prefer, subject to review, `G[i][j]` returning a collection of morphisms even when it contains exactly one. This supports parallel arrows, cycles, absent arrows, and uniform indexing. Decide how object identity, stable indices, and recursive graph-valued entries work. In particular, do not assume `G[i][j][k]` is unambiguous until nested indexing semantics are defined.

### Smallest falsifiable test

1. Define a three-object graph with identity morphisms, one pair of parallel arrows, one cycle, and at least one empty off-diagonal address.
2. Encode and decode it with a sparse indexed representation.
3. Verify that identity selection, arrow multiplicity, source/target direction, and graph structure survive round-trip serialization.
4. Document unresolved questions about composition, endomorphisms, and recursive access without requiring composition or self-hosting for this experiment.

**Decision status:** Candidate design only. The founder has requested exploration, not ratification of these semantics. Do not mark the objective complete on the strength of this proposal.
