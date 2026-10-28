# Graph Lang source baseline

Inspected all 20 tracked files at [6e57551](https://github.com/oasislaboratory/graph-lang/tree/6e575510ea5346dad35d75b41d4492b05ed75548). [Snapshot](source-snapshot.json) records exact content, Git blob identities and the complete tree. Paths below refer to that pinned snapshot, not a moving branch.

## Entry points and policies

README.md directs readers to docs/0-Introduction.md and links docs/ and src/. No AGENTS.md exists in the complete source tree. LICENSE is BSD-3-Clause; docs/LICENSE.md applies CC BY 4.0 to original prose and BSD-3-Clause to code snippets, retaining third-party rights. Inspection grants no permission to modify the implementation repository.

package.json declares npm run dev (vite dev), npm run build (vite build), and npm run preview (vite preview). It declares Svelte, SvelteKit, adapter-auto and Vite as latest; no lockfile, test script, test/spec files, or CI workflow is present in this pinned tree. vite.config.js configures SvelteKit and adapter-auto; src/app.html is the application shell. Dependency resolution and build compatibility are unverified. No installation, build, browser session, or evaluator was run.

## Foundation evidence matrix

| Claim | Pinned source path | Classification and limit |
| --- | --- | --- |
| Scientific literate programming joins research docs and source | README.md; docs/0-Introduction.md | Documented aim, not a verified consistency property |
| Graphs may represent programs homoiconically | docs/0-Introduction.md | Documented thesis; executable semantics unsupported by inspected source |
| Graph definition uses unordered endpoint pairs and permits equal endpoints | docs/1-Graphs.md | Documented mathematical starting point; implementation conformance unestablished |
| Representations are themselves objects of study | docs/1-Graphs.md; docs/2-Notation.md | Documented viewpoint; Notation includes unfinished research prompts |
| Edges might be functions or morphisms | docs/3-Arrows.md | Documented research proposal; no composition/evaluation rule specified |
| Recursion, primitives, syntax and semantics are defined | docs/4-Recursion.md through docs/7-Semantics.md | Unsupported: each contains only a newline |
| Sample graph contains a,b,c and three off-diagonal entries equal to 1 | src/lib/graph.json | Inspected; offline fixture check verifies exact positions (0,1), (1,2), (2,0), not their meaning |
| Home view links vertices by numeric index | src/routes/+page.svelte | Inspected code; rendered navigation untested |
| Vertex loader accepts canonical nonnegative decimal indices within array length, otherwise invokes 404 | src/routes/[vertex]/+page.js | Inspected code; framework error handling and route behavior untested |
| Vertex view displays label and index | src/routes/[vertex]/+page.svelte | Inspected template; rendering untested |
| Program evaluation, environment, persistence and resource limits work | Entire src/ tree | Unsupported in this snapshot: no corresponding runtime contract or implementation identified |

The checker tests snapshot integrity and static fixture facts only. None of these results is evidence of Graph Lang program execution or customer validation. Bibliography currently lists Bondy/Murty; the Arrows note's requested Spivak citation is not supplied there.

## Ambiguities to resolve in the semantics objective

1. The unordered incidence definition and asymmetric matrix need an explicit relationship: directed edges, an encoding convention, or a different abstraction. Do not infer row-to-column direction as accepted semantics.
2. Array position identifies route targets, while labels name vertices. Stable identity, duplicate labels and reordering behavior are unspecified.
3. The pair of arrays does not document the meaning of null versus 1, edge values, parallel edges, self-loops, shape validation or dangling references.
4. Navigation retrieves a label; it does not apply a function, compose morphisms or evaluate a program. Data/executable distinction, inputs/results, lookup, errors and termination remain open.

## Prioritized implementation requests (proposed, not authorized)

| Priority | Request and concrete acceptance cases | Prerequisite / owner |
| --- | --- | --- |
| P0 | Freeze minimal representation and evaluation contract; give one worked successful computation plus malformed-shape, missing-reference and resource-bound examples with explicit outcomes | [Minimal semantics](../02-minimal-semantics/objective.md); founder review of consequential choices |
| P1 | Establish reproducible build and navigation checks: clean install with locked versions, build, /0 and /2 show a and c; /3, /-1, /01 and /abc reject as specified | Implementation owner; separate source-write authorization; verify actual SvelteKit behavior |
| P1 | Implement representation validation after contract acceptance: valid sample accepted, non-square matrix and dangling endpoint rejected; record diagnostics | Accepted semantics and implementation authorization |
| P2 | Provide documented execution API with deterministic success, unknown-reference, evaluation-error and budget-exhaustion fixtures; run actual implementation against them | [Conformance handoff](../03-conformance-handoff/objective.md), accepted contract, implementation authorization |
| P2 | Pair foundational text and examples with executable cases; replace placeholders only after rules are accepted | [Documentation consistency](../04-documentation-consistency/objective.md); documentation-write authorization |

The [browser runtime dependency](../../graphbrowser/03-runtime-environment/objective.md) can use this absence-of-evidence inventory now; its execution integration remains unverified.

## Reproduce and acceptance review

Run `python3 graphlang/01-source-baseline/verify_baseline.py` from the Oasis repository root (Python standard library only). Compare [verification.json](verification.json). To independently refresh, fetch the pinned source Git tree and each blob via GitHub, compare hashes, then explicitly assess any newer commit before updating the baseline.

- Criterion 1: commit, policies, entry points, commands and test availability recorded above and in snapshot.
- Criterion 2: evidence matrix maps each foundation claim to source and separates inspection from tested behavior.
- Criterion 3: four unresolved model/representation questions and absent executable evidence recorded without adopting semantics.
- Criterion 4: prioritized requests include acceptance cases, dependencies and authorization boundaries.

Completion means the bounded baseline inventory is complete, not that the language or build works.
