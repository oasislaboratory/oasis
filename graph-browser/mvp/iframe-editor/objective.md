# Minimal iframe editor

## Desired outcome
Experiment with real nested iframe windows containing full objective.md textareas, using plain HTML and minimal styling.

## Acceptance criteria
- Remove decorative styling, slogans, branding, and redundant copy from the experimental interface.
- Expand two sibling iframes and a grandchild independently; verify focus, scrolling, editing, and stable objective URLs.
- Edit full Markdown inside the window without opening a document route. Preserve drafts when errors or conflicts occur.
- Record observed iframe behavior and limitations before deciding whether to retain the approach.

<!-- oasis:working-state -->
## Status
Iframe experiment implemented and verified. Protected-intent persistence remains dependent on the authority objective; the full MVP is not complete.

## Observed state — 2026-11-03
Each filesystem-derived objective URL renders its full objective.md in an inline textarea. Native details elements contain actual lazy-loaded child iframes, recursively. Collapsing a branch retains its iframe document. Decorative UI and copy were removed; Git commit and explicit push controls remain.

Full-text drafts are experimental: the server compares protected intent with the current file and accepts only working-state changes through the existing revision-checked save path. No request-provided root authority is accepted. Draft text and its original revision are retained in per-tab session storage across navigation/reload; failed saves do not clear them. Reload saved version explicitly discards the draft after confirmation. Conflict reconciliation is manual.

## Evidence
- npm run check: zero errors and warnings; npm test: eight passing repository tests; npm run build: passes.
- Chromium browser acceptance in a disposable Git repository: two sibling iframes and a nested grandchild remain open independently; textarea focus and scrolling, resized-editor document scrolling, collapse/reopen, stable top-level navigation, and draft recovery after navigation/reload pass.
- Browser tests preserve drafts on protected-intent rejection, network failure, and stale inherited directives. Explicit reload/reconciliation followed by a working-state save, local commit, and reload passes. Protected root content remains unchanged.
- tests/iframe-browser.mjs records the repeatable browser experiment, using externally supplied Playwright/Chromium without new project dependencies.

## Limitations and next action
Nested frames have separate scroll areas and fixed initial heights, consume width at deeper levels, and remain resident after collapse. Expansion state resets on top-level reload. Draft storage is session-only, may be unavailable, and is not a durable backup. Only Chromium was exercised; Firefox, Safari, mobile ergonomics, and large trees remain unverified.

Keep the iframe approach experimental pending founder use. Root/scoped-agent authority, automatic fast commits, and external-writer race protection remain separate work; existing manual Git persistence and its safeguards are preserved. Protected outcomes and inherited directives were not changed.

## Founder-use refinement
The founder found the nested frames but reported excessive menus, duplicate root slashes, and Git controls competing with the prompt. Simplified the view to one path heading, the textarea, children, and a footer. Immediate children open automatically; embedded pages keep their descendants collapsed. Removed the saved-version panel and redundant Open links. Recovery and directives live under footer Options; manual Git controls appear only in the outer page. The embedded query parameter controls presentation only, not authorization.

Validation: type checking has zero errors/warnings, all eight repository tests pass, and the production build passes. Existing save validation and Git safeguards are unchanged. Updated Chromium acceptance passes: one root link, auto-open siblings, initially collapsed grandchild, no Git controls in child frames, independent collapse/reopen, navigation, scrolling, editing, protected/stale/network failures, draft recovery, and save/commit/reload.

## Tile-density refinement
Following the founder's sketch, the dashboard now has a compact path and prompt above a responsive grid of child iframes. Removed Options, directive panels, and Git controls from objective pages. Git persistence controls moved to /_workspace; dashboard loading no longer runs Git status. Save appears beside the path only for unsaved drafts, and recovery appears only on errors. Server-side protected-content and revision checks are unchanged.

The layout keeps 14px text, a 9rem outer prompt, 7rem embedded prompts, and 20rem child frames. Tiles use an 18rem minimum where space permits, stacking on narrow screens. Deeper children remain independently expandable inside their parent tiles. These dimensions are experimental, not acceptance thresholds. Nested scrolling and session-only draft storage remain limitations; automatic saving, root authority, and live filesystem refresh are still pending.

Validation: npm run check passes with zero errors/warnings; all eight repository tests and the production build pass. Updated Chromium acceptance and screenshot inspection verify three sibling tiles plus the parent prompt fit at 1280×800 with 14px text; 390px-wide layout stacks without horizontal overflow. Independent grandchild expansion, focus, scrolling, collapse/reopen, protected/stale/network rejection, draft recovery, and save → separate Git page → commit → reload all pass. Broader usability and other browsers remain unverified.
