# MVP

## Desired outcome
Run Oasis's objective tree as a recursive, editable SvelteKit application with stable URLs and Git persistence.

## Implementation guidance
Use TypeScript and a recursive ObjectiveWindow component. Read objective.md files through filesystem-derived routes. Expand multiple branches without collapsing siblings; navigate into a child to focus. Edit Markdown inline and save on the server. Make Git commits explicit. No Python.

## Acceptance test
Open the root, expand two branches, edit an objective, commit, reload, and verify the change.

<!-- oasis:working-state -->
## Observed state
Implemented the local SvelteKit MVP: recursive windows, independent branch expansion, stable URLs, inline working-state saves, inherited directives, and explicit Git commit/push.

## Evidence
Type checking passes with zero errors or warnings. Six automated tests pass, including save/commit/reload in disposable Git repositories. Production build passes. Browser inspection confirms Graph Browser and PMF can remain expanded together and the MVP opens at its filesystem-derived URL.

## Next action
Use this browser to operate Oasis during a real work session, then observe a prospective user doing the same. Customer retention and payment remain unverified.

Browser acceptance completed: saved this working state through the UI, committed it with **Commit objectives**, reloaded `/graph-browser/mvp`, and verified that the evidence and commit persisted. This verifies the local MVP acceptance flow, not customer demand.
