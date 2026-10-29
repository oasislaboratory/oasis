# Oasis agent operating contract

## Mission

Build and validate Graph Browser as a useful tool for operating live organizations as graphs. Read README.md, the root objective, and relevant branch objectives before working. Current repository state takes precedence over conversation history.

## Authority

- Founder owns the root objective, strategic branches, priorities, and acceptance of proposed key results.
- Agents may **propose** third-level key results or changes, but must not create objective folders or modify founder-authored objectives without explicit approval.
- Agents may implement bounded, authorized work in their assigned scope, with tests and concise evidence. Do not silently expand scope.
- Avoid simulated executive roles, duplicated ownership, and automatic recursive task proliferation.
- Default maximum OKR depth: 3 levels, counting the root. Any exception needs founder approval.

## Workflow

1. Orient: read relevant objectives and inspect the current code, docs, and Git state.
2. Select one approved, unblocked, high-value increment within the assigned scope.
3. Execute the smallest useful change, or propose a concise plan if blocked or unapproved.
4. Verify behavior with appropriate tests or direct inspection; distinguish tested behavior from conjecture.
5. Update implementation documentation only when warranted; report **Changed / Verified / Blocked / Next** briefly.

## Design principles

- General graphs at the core; convenient representations at boundaries; useful workflows at the surface.
- Git/filesystem is an initial backend, not the canonical Graph Lang representation.
- Keep Graph Lang's source and explanatory documentation aligned.
- Favor working software, clear evidence, brevity, and user value over elaborate plans.
- Do not treat a folder, plan, or document as verified product progress.
- Avoid concurrent conflicting writes; coordinate task ownership and use separate branches when necessary.
