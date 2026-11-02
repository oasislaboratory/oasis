# Graph Browser

## Desired outcome
Users can open any objective by URL, expand multiple branches at once, edit inline, and save to Git, all in TypeScript.

## Implementation guidance
- Use SvelteKit and TypeScript, mapping repository objective directories to stable filesystem-derived routes.
- Build a recursive `ObjectiveWindow` component: every objective is a webpage and a window into its descendants.
- Use nested iframe-like windows as the visual model, but prefer recursive components over literal iframes unless isolation is necessary.
- Expand children without collapsing siblings; navigate to a child to focus it as the new root.
- Edit `objective.md` inline, with server-side TypeScript handling filesystem writes and explicit Git commit/push actions.
- No Python, graph database, or GraphLang runtime required for MVP.

## Immediate priority
[Ship the MVP](mvp/objective.md).
