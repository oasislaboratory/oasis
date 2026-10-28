# Proposed passages and example outlines

Editorial proposals for founder review, based on graph-lang commit `6e575510ea5346dad35d75b41d4492b05ed75548`. None has been applied to the textbook or source. P0 and T0 remain candidates; the author's mathematical direction and existing quotation remain unchanged. Section IDs match [the review protocol](review.md).

## D1 — Introduction: representation and execution

Target: docs/0-Introduction.md, after the thesis paragraph.

> Our current source explores a graph by linking its vertices. The next experiment asks whether a graph can also specify a computation. We must say what its edges mean, how to supply an input, and how to recognize a result or failure. A picture or data file can describe this experiment before a working evaluator exists.

Example outline: show the same three vertices first as the existing null/1 adjacency data, then as a separately labeled proposed program with inc and neg edges. Walk the path 0→1→2 from input 2: inc gives 3, then neg gives −3. Label this a hand calculation against P0, not a screenshot or output of the current application. Expected candidate result: value −3, steps 2 (P1).

## D2 — Graphs: make direction an explicit choice

Target: docs/1-Graphs.md, a bridge after the existing definition/discussion. Preserve the Bondy–Murty quotation and attribution verbatim.

> The definition above uses unordered endpoints. For the computation experiment we will consider a directed representation: an edge has a source and a destination. In the proposed matrix convention, row i and column j record an edge from i to j. This choice supplies an orientation; it does not follow automatically from drawing a line between two points.

Example outline: compare cell (0,1) with (1,0) in the same asymmetric matrix. Explain that a null reverse cell means no reverse edge, even when the forward edge exists. P0 is a simple directed representation with possible loops; it does not implement every graph admitted by the quoted definition, including independent parallel edges.

## D3 — Arrows: composition and its limits

Target: docs/3-Arrows.md, proposed expansion; leave the requested Spivak citation pending verification rather than fabricate a quotation.

> Suppose an edge names a function and a path tells us which functions to apply in order. Starting with 2, an increment edge followed by a negation edge yields −3. A path with no edges leaves the value unchanged. This is a small way to make composition visible, but it does not yet define the whole language.

Example outline: compare P1 composition, P2 zero-edge identity and P4 an explicit id edge. P2 and P4 have the same value action but different step counts; they are not identical execution records. P0's bounded integer increment can fail on overflow, so it is not a total endofunction on that bounded carrier. Do not claim category laws for the entire error/budget protocol. A precise categorical interpretation must state whether it models partial functions, successful value mappings, paths, or resource-aware executions, and prove the relevant laws separately. This is a limit on the candidate's claim, not a rejection of the founder's broader thesis.

## D4 — Representation example: data is preserved

Targets: a proposed explanation in docs/6-Syntax.md accompanying src/lib/graph.json; do not rewrite the sample data automatically.

> The current sample stores vertex labels and adjacency entries. An entry of 1 records a connection in that sample; it does not name an executable function. The proposed program format adds a version and explicit edge names. Converting between these representations requires a deliberate choice of meaning for each edge.

Example outline: show the original tuple and a separate P0 envelope side by side. An execution request using the original tuple has expected error invalid_graph (N9). The existing graph remains available for navigation. Never present a guessed 1→id conversion as source behavior or an approved migration.

## D5 — Navigation and numeric syntax

Targets: proposed interface note in docs/6-Syntax.md; source reference src/routes/[vertex]/+page.js.

> Selecting a vertex and invoking a computation are different operations. The current route loader checks the spelling of a vertex index in the URL. The proposed transport profile instead reads JSON numbers exactly, so input spellings 2, 2.0 and 2e0 can denote the same integer. That proposal does not change which URLs the browser accepts.

Example outline: inspect the route's intended rejection of /01 and /2e0 without claiming a rendered browser test. Separately show the T0 byte cases integer-2.0 and integer-2e0, each expecting identity value 2 and steps 0. A fractional input such as 2.5 expects invalid_request. Runtime/parser checks remain not_run.

## D6 — Placeholder chapters: bounded outlines

Targets: docs/4-Recursion.md through docs/7-Semantics.md, currently newline-only files.

- Recursion: distinguish a finite path that revisits a vertex (P3) from recursive function definition and unbounded evaluation. P0 supports only the former; leave recursion as an open experiment.
- Primitives: introduce proposed id, inc and neg, the inclusive integer carrier, and overflow. Contrast input at the upper endpoint on an identity path with inc at that endpoint (N6); identity succeeds while inc expects evaluation_error.
- Syntax: define graph version, labels, matrix, path, input, environment and budget with one complete P1 request. Explain graph identity by index, not label; preserve the legacy data example separately. Introduce T0 as an optional candidate wire profile, not an existing implementation.
- Semantics: hand-trace value/steps, then error precedence with N3 (missing edge before exhausted budget), N4-budget (budget before unknown function) and N5 (one successful step before exhaustion). Explain that a finite step limit is not a wall-clock guarantee. End with the evidence labels: proposal, source inspected, checker tested, runtime not_run.

All proposed excerpts require author review before insertion. Applying them in graph-lang requires separate write authorization; acceptance of these editorial deliverables does not grant it.
