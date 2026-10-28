# Minimal semantics — candidate P0

Disposition: proposed, not adopted or implemented. This specifies one small experiment, not the complete language or a proof of the research thesis. Source baseline remains [6e57551](https://github.com/oasislaboratory/graph-lang/tree/6e575510ea5346dad35d75b41d4492b05ed75548), checked unchanged on 2026-10-28. No source/textbook edits are authorized here.

## Rules

Every normative rule below is a proposed change. Evidence motivates it but does not establish existing runtime behavior.

| Rule | Candidate definition | Evidence / change rationale |
| --- | --- | --- |
| R1 Representation | A program graph is `{version:"p0", labels:[string…], matrix:[[null or string…]…]}`. For n labels the matrix has exactly n rows of n cells. Empty graphs are valid data. Maximum n=64; labels and nonempty edge names have at most 128 Unicode scalar values. Unknown fields, duplicate JSON keys, invalid Unicode and other cell types are rejected. | `src/lib/graph.json` contains a label vector and square matrix; envelope, names, validation and limits are new. |
| R2 Direction and identity | Cell (i,j) denotes one directed edge i→j, identified by its ordered index pair within this immutable graph version. Vertex identity is its index, not its label; duplicate labels are allowed. Self-loops and cycles are allowed; parallel edges at a cell are not. Reordering creates a new graph identity and requires reference remapping. | Routes use indices; matrix is asymmetric. Direction, loops and snapshot identity are proposed interpretations, not conclusions from the unordered incidence definition in `docs/1-Graphs.md`. |
| R3 Meaning | A non-null cell names a unary function in an immutable environment. Each vertex carries the same carrier type: integers from −9007199254740991 to 9007199254740991. This homogeneous subset postpones heterogeneous typing. A null cell means no edge, not an identity function. Identity is the empty path at a vertex; an explicit `id` edge has the same value action but consumes a step. | `docs/3-Arrows.md` proposes functions as edges; no carrier, lookup or identity semantics currently exist. A graph alone is not asserted to be a category: composable paths and their identities are additional structure. |
| R4 Invocation | Request contains exactly `{graph, path, input, budget, environment}`. `path` is a nonempty list of vertex indices, at most 1025 items; `input` is an integer in the carrier (booleans excluded); `budget` is an integer 0…1024. `environment` must be `p0-int-v1`. Read-only loading/navigation is never invocation. | Existing routes only retrieve labels. All evaluation machinery is proposed. |
| R5 Lookup | Environment `p0-int-v1` is a closed map: `id(x)=x`, `inc(x)=x+1`, `neg(x)=−x`. No host code, network, I/O, mutation, nested environment or user-defined functions. Unknown names are allowed as graph data but error when their edge is invoked. Resolve from this map alone; never from labels or ambient globals. | Source contains no environment. Closed bounded primitives make the first experiment deterministic. |
| R6 Execution | Validate graph and request first, then all path indices. Set value=input, steps=0. For each consecutive pair in order: reject a null cell; if steps==budget return budget_exhausted; resolve its name or return unknown_reference; compute its primitive or return evaluation_error on an out-of-carrier result; assign result and increment steps. Return success after the final pair. A one-vertex path returns input with zero steps. | Proposed operational meaning for edge composition; follows the functions-as-edges direction without implying implicit traversal. |
| R7 Errors | Return `{ok:false, code, steps, at}`; steps counts successful applications only; at is the zero-based failing edge position, or null for validation/index failures. Codes: invalid_graph, invalid_request, unknown_reference, missing_edge, budget_exhausted, evaluation_error. Success is `{ok:true,value,steps}`. No partial value, graph changes or environment changes escape on error. | Source route 404 is navigation behavior, not a runtime error protocol. These codes are new. |
| R8 Precedence and bounds | Check R1 before request fields; request shape/types/environment before path-index range; indices before execution. During execution use exactly R6 order, so a null cell precedes budget failure and budget failure precedes unknown function. Reject transport inputs above 1 MiB before parsing as invalid_request. Finite paths plus finite primitive operations bound execution; the step budget is not a wall-clock SLA. | No resource policy exists in source. Transport limit and shape bounds also constrain validation work. |

Strings are compared exactly, case sensitively; no normalization or coercion. JSON numeric inputs must represent mathematical integers exactly within the specified range. NaN and infinity are not JSON values. Unknown environment is invalid_request. A correctly typed but out-of-range path index is unknown_reference with at=null. A wrong-type path item is invalid_request. All pre-execution errors have steps=0. Error messages may be added by a future adapter; code/steps/at are normative for this candidate.

Finite paths may revisit vertices; no cycle detection is needed to terminate a request. Branching graphs require the caller to select a path; no traversal ordering is implied. Recursion, automatic scheduling, arbitrary function definitions, multigraphs, diagonal-only vertex representation, effects and persistent environments are explicitly unresolved, not ruled out for Graph Lang.

## Hand-worked examples

Let G have labels `["a","b","c"]` and matrix `[[null,"inc",null],[null,null,"neg"],["id",null,null]]`. Unless stated, use version p0, environment p0-int-v1, input 2 and budget 3. Each row is a specification calculation, not a runtime result.

| Case | Change / invocation | Expected outcome and derivation |
| --- | --- | --- |
| P1 composition | path [0,1,2] | inc(2)=3, neg(3)=−3; `{ok:true,value:-3,steps:2}` (R5–R6). |
| P2 identity | path [1], budget 0 | No edges applied; `{ok:true,value:2,steps:0}` (R3,R6). |
| P3 cycle | path [0,1,2,0] | 2→3→−3→−3; `{ok:true,value:-3,steps:3}`. Revisit is finite (R6,R8). |
| P4 explicit self-loop | set matrix[0][0]="id"; path [0,0], budget 1 | `{ok:true,value:2,steps:1}`; explicit identity consumes a step (R3). |
| N1 malformed | remove last cell from first row; path [0] | invalid_graph, steps 0, at null: row length differs from n (R1). |
| N2 unknown vertex | path [0,3] | unknown_reference, steps 0, at null, before edge access (R8). |
| N3 missing edge | path [0,2], budget 0 | missing_edge, steps 0, at 0; absence checked before budget (R6). |
| N4 unknown function | matrix[0][1]="double"; path [0,1] | unknown_reference, steps 0, at 0 (R5). Same request with budget 0 yields budget_exhausted instead (R8). |
| N5 exhausted | path [0,1,2], budget 1 | First step gives 3; second fails budget_exhausted, steps 1, at 1; no partial value returned (R6–R7). |
| N6 primitive failure | path [0,1], input 9007199254740991 | inc leaves carrier: evaluation_error, steps 0, at 0 (R3,R6). |
| N7 empty graph | labels [], matrix [], path [0] | Graph is valid; unknown_reference, steps 0, at null (R1,R8). |
| N8 invalid request | path [], or budget true, or environment "other" | invalid_request, steps 0, at null; no execution (R4,R8). |
| N9 data is not code | legacy source tuple with cells null/1 supplied as graph | invalid_graph; no silent conversion of 1 into id or an instruction (R1,R4). |

The existing tuple can remain a browser data fixture. Any converter must label its output as a new candidate representation and request explicit edge functions; it cannot infer them from adjacency alone. Duplicate labels do not alter these outcomes because lookup uses indices and edge names.

## Integration and decisions

The [CTO boundary draft](../../graphbrowser/03-runtime-environment/boundaries.json) has entry/budget but lacks path, input and environment. Its storage validator only accepts null/1 cells. This candidate therefore is **not compatible** with that draft as-is. Local request to CTO: keep the data/storage fixture independent; after acceptance, add an explicit execution adapter for a versioned program envelope and map candidate errors without converting adjacency into code. `unavailable` belongs to the browser adapter when no runtime exists; it is not a successful candidate evaluation.

Founder review requested: adopt this finite-path, homogeneous-integer subset for the first conformance experiment, or prioritize another representation/evaluation model first. Recommendation: use P0 as a disposable experiment because its composition and failure behavior are small enough to verify. Tradeoff: explicit paths test composition but do not yet deliver a general graph evaluator, recursive language or OKR scheduler. In particular, row→column direction and index identity are candidate conventions; the diagonal-identity/arrow-only representation remains an alternative, not silently rejected.

Pending that decision, the next leaf may prepare a **candidate-only** conformance package against P0. Production adoption, source implementation and textbook changes remain gated on accepted choices and separate write authorization. No founder approval is inferred from completion of this specification objective.

## Acceptance review

1. R1–R3 cover representation, directedness, identity and data/executable separation; R4 makes invocation explicit.
2. R4–R8 specify input/output, lookup, error precedence and termination/resource bounds.
3. P1–P4 and N1–N9 provide derived positive/negative outcomes including the budget/lookup precedence collision.
4. Every rule identifies source motivation or absence; all normative additions remain proposed. Integration mismatch and consequential founder choices are stated above.

Verification: manual rule-to-example review plus local document/link/metadata checks recorded in [status](status.md). No evaluator, application, build, performance or customer behavior was tested. Executable conformance remains the next objective.
