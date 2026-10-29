# Implement filesystem-backed routing

**Parent:** [graphbrowser](../objective.md)  
**Owner:** Founder  
**Approval:** Approved  
**Status:** Not started  
**Depth:** 3 of 3  
**Priority:** Unranked

## Objective

Load Oasis organizational graph data from the filesystem and navigate graph resources through browser routes.

## Acceptance criteria

Reproducible demo resolves filesystem-backed objects and relationships through browser navigation.

## Dependencies and boundaries

Filesystem and Git are adapters, not the canonical graph model.

## Evidence

No implementation or verification evidence recorded yet. Update only when work is actually inspected or tested.

## Agent instructions

Agents may execute bounded authorized work and propose changes. Do not create deeper OKR folders or rewrite this approved objective without founder approval.

## Proposed indexed routing experiment — founder review pending

Use the Graph Lang candidate `G[i][j]` as the conceptual access operation. Explore URL forms such as `/graph/0[0]` for a diagonal object address and `/graph/0[1]` for a source-to-target morphism collection. The `i[j]` spelling is a human-readable **route encoding**, not a requirement on the canonical IR or physical directory layout.

### Minimal routing demonstration

1. Resolve a three-object test graph from a filesystem-backed adapter.
2. Navigate a diagonal address and an off-diagonal address through the browser.
3. Preserve multiple morphisms at one address rather than arbitrarily selecting the first.
4. Demonstrate that route parsing and serialization do not change the graph's underlying semantics.
5. Record how URL escaping, stable IDs versus numeric indices, missing addresses, and recursive graph navigation will be handled.

**Dependency:** Coordinate with [Graph Lang IR](../../graphlang/ir/objective.md). The route grammar is provisional until the IR contract is reviewed.
