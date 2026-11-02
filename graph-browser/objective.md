# Graph Browser

## Desired outcome
Users can open any objective by URL, expand multiple branches at once, edit inline, and save to Git, all in TypeScript.

## Implementation guidance
- Use SvelteKit and TypeScript, mapping repository objective directories to stable filesystem-derived routes.
- Every objective is a webpage and a window into its descendants.
- Experiment with actual nested iframes, plain HTML, and minimal styling. Remove extra branding and copy.
- Expand children without collapsing siblings; navigate to a child to focus it as the new root.
- Edit the full `objective.md` directly in a textarea in each window. Support fast real-time local commits.
- Enforce root-user editing across the graph and scoped agent writes, with fresh-state checks before accepting agent updates. Keep remote push separate.
- No Python, graph database, or GraphLang runtime required for MVP.

## Immediate priority
[Ship the MVP](mvp/objective.md).

<!-- oasis:working-state -->
## Observed state — 2026-11-02
The founder ran the initial build successfully and called it a good first step. The MVP is partially complete. Recursive components, styled presentation, working-state-only edits, and manual commits are a baseline, not the full accepted product.

## Next move
Run the minimal iframe and full-text editing experiment, then complete permission enforcement and concurrent user/agent commit tests. See the MVP child objectives.
