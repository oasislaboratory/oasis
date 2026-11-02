# MVP

## Desired outcome
Run Oasis's objective tree as a minimal, recursive inline editing environment with fast Git persistence and enforced root-user/agent authority.

## Implementation guidance
Use SvelteKit and TypeScript with server-side filesystem operations. Experiment with actual nested iframes and plain HTML with minimal styling and no extra copy. Put the full objective.md in a textarea inside each window. Keep independent expansion and stable filesystem-derived URLs. The root user can edit across the graph; agents can update only within their permissions and must catch user changes before writing. Build fast real-time local commits; remote push stays separate. No Python.

## Acceptance criteria
- Open the root and expand two branches as actual nested iframe windows; both remain open and usable without decorative UI.
- Edit the full objective.md inline as the root user, including desired outcomes, and verify persistence after reload without navigating to a file page.
- Persist authorized edits through fast local commits; report save/commit errors without losing the draft. Measure edit-to-commit latency and select a debounce/batching policy from the experiment rather than inventing a founder threshold.
- Give an agent a bounded scope. Permit an allowed edit; reject writes outside its scope and changes to protected intent without authority. A request cannot grant itself root authority.
- Start agent work, then change the objective, an inherited directive, or its permissions as root. Reject the stale agent update at the write/commit boundary; require rereading and reconciliation before an authorized retry. Preserve the user edit and unrelated work.
- Demonstrate the combined edit → commit → concurrent root change → agent reconciliation → reload flow before declaring the MVP complete.

<!-- oasis:working-state -->
## Status
Partially complete. Founder revision recorded 2026-11-02. The initial build works on the founder's machine and is a good first step; it does not satisfy the revised full MVP criteria.

## Next moves
1. [Minimal iframe windows and inline Markdown](iframe-editor/objective.md).
2. [Root-user and scoped-agent authority](authority/objective.md).
3. [Fast commits and fresh agent updates](live-commits/objective.md).

## Prior baseline evidence
The evidence below describes the first implementation and its original acceptance test, not completion of the revised MVP.

## Observed state
Implemented the local SvelteKit MVP: recursive windows, independent branch expansion, stable URLs, inline working-state saves, inherited directives, and explicit Git commit/push.

## Evidence
Type checking passes with zero errors or warnings. Six automated tests pass, including save/commit/reload in disposable Git repositories. Production build passes. Browser inspection confirms Graph Browser and PMF can remain expanded together and the MVP opens at its filesystem-derived URL.

## Next action
Use this browser to operate Oasis during a real work session, then observe a prospective user doing the same. Customer retention and payment remain unverified.

Browser acceptance completed: saved this working state through the UI, committed it with **Commit objectives**, reloaded `/graph-browser/mvp`, and verified that the evidence and commit persisted. This verifies the local MVP acceptance flow, not customer demand.
