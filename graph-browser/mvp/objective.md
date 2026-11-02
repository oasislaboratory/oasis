# MVP

## Desired outcome
Run Oasis's objective tree as a recursive, editable SvelteKit application with stable URLs and Git persistence.

## Implementation guidance
Use TypeScript and a recursive ObjectiveWindow component. Read objective.md files through filesystem-derived routes. Expand multiple branches without collapsing siblings; navigate into a child to focus. Edit Markdown inline and save on the server. Make Git commits explicit. No Python.

## Acceptance test
Open the root, expand two branches, edit an objective, commit, reload, and verify the change.
