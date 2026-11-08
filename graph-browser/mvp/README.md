# Graph Browser — partial MVP baseline

Status: partially complete. The founder verified this baseline runs locally. The revised full MVP requires minimal actual iframe windows, full inline objective editing, fast commits, and enforced root-user/scoped-agent authority with fresh-state reconciliation. See [objective.md](objective.md) and its children; the iframe experiment is implemented; authority and fast commits remain pending.

A local SvelteKit + TypeScript workspace over Oasis's real objective directories. Expand sibling windows independently, focus an objective by URL, edit full Markdown drafts inline, save to disk, and explicitly commit or push.

## Run

Install Node.js 22.12+ (or Node.js 24 LTS) and Git. From the repository root:

```sh
npm run setup
npm run dev
```

Open the local URL Vite prints (normally http://127.0.0.1:5173). On Windows PowerShell these commands are the same. Git commits use your existing `git config user.name` and `user.email`. Push uses the current branch's configured upstream and your normal Git credentials; set an upstream in your terminal first if needed.

## Use

1. Immediate children appear as open tiles in a responsive grid. Deeper branches start collapsed; expand them independently.
2. Click a window’s path to focus that objective as the outer page.
3. Edit the inline `objective.md` textarea and **Save**. Only changes after the working-state marker can persist; protected-intent edits remain experimental drafts. For files without working state, append a newline, `<!-- oasis:working-state -->`, another newline, and your observations.
4. Open `/_workspace` for Git status, commit, and push; the objective dashboard has no Git controls.
5. Reload: the saved state remains. **Push upstream** is a separate explicit operation.

Existing objective content is treated conservatively as protected founder intent. Editable content starts after the exact `<!-- oasis:working-state -->` line (with surrounding newlines). Save changes only that section of `objective.md`; the server rejects protected-intent changes and cannot modify directives. Full-text drafts stay in per-tab session storage across navigation/reload; a collapsed iframe remains mounted. After a stale or failed save, **Reload saved version** explicitly discards a draft after confirmation. After a conflict, copy the draft, reload the saved version, and reconcile before retrying. Storage failures are reported; in that case keep the window open and copy the draft before navigating. Creating objectives, changing protected text, moving directories, or resolving Git conflicts is currently done in your editor/terminal.

## Guarantees and limits

- Inherited directives are displayed root-to-leaf; a content revision includes both the objective and its directives. Stale saves fail with a conflict and retain the draft.
- Server checks reject traversal and symlink paths; Markdown HTML is sanitized. Mutating requests require same-origin JSON.
- Commit validates intent against HEAD, refuses a pre-staged index, and commits only tracked objective files. Unrelated changes stay out. Push requires a clean working tree.
- This is a single-user, local development MVP. Run on loopback; there is no login or multi-user authorization. Do not expose the server publicly. Anyone with direct filesystem/Git access can bypass app protections.
- The in-process write queue does not lock out external editors or Git processes. Avoid concurrent external writes while saving/committing. No autonomous agent execution or account integration is included.
- Tree discovery follows immediate child directories containing `objective.md`. Hidden directories, node_modules, and build output are ignored. No graph database or GraphLang runtime is required.

## Verify

From the repository root:

```sh
npm run check
npm test
npm run build
```

Tests use disposable Git repositories: save/commit/reload, inherited directives, stale edits, traversal/symlinks, protected intent, staged-file isolation, and HTML sanitization.

The optional browser acceptance script uses an externally installed Playwright (no project dependency added):

```sh
node graph-browser/mvp/tests/iframe-browser.mjs
```

Set `PLAYWRIGHT_MODULE` to its absolute module entry if not resolvable locally, and `CHROMIUM_PATH` for an existing Chromium binary if needed. It starts Vite on port 5174 with a disposable Git repository and checks two siblings plus a grandchild, focus/scrolling, collapse/reopen, navigation/reload drafts, rejected writes, and save/commit/reload.

Iframe limitations: each window scrolls separately at a fixed initial height; nested windows reduce usable width, and loaded frames remain resident when collapsed. Expansion state resets on top-level reload. Draft recovery depends on session storage and is not a durable backup. Only Chromium has been exercised; root authorization and automatic commits are separate objectives.

## Production Node process (local)

```sh
cd graph-browser/mvp
npm run build
```

Set `HOST=127.0.0.1` and `ORIGIN=http://127.0.0.1:3000` using your shell's environment syntax, then `npm start`. Run from this directory, or set `OASIS_REPO` to an absolute Git checkout path. Keep the application source and objective checkout together for the default `../..` repository path.

## Round 001 experiment (unverified branch)
The latest `rounds/NNN.md` under each objective appears as a compact, collapsed experimental-state disclosure. It shows the recorded hypothesis, frozen prediction, observations, constraints, and comparison. These are read-only; editing round records is not implemented. Uncertainty is explicitly unresolved while a round comparison is pending; no numeric entropy or risk score is invented. PR #7's tiled view and separate `/_workspace` have been reconciled onto the Round 001 branch. Run `npm run check`, `npm test`, `npm run build`, and the optional Chromium acceptance test before accepting the reconciliation. These commands have **not** been run against this branch.
