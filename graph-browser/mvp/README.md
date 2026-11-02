# Graph Browser MVP

A local SvelteKit + TypeScript workspace over Oasis's real objective directories. Expand sibling windows independently, focus an objective by URL, edit working Markdown inline, save to disk, and explicitly commit or push.

## Run

Install Node.js 22.12+ (or Node.js 24 LTS) and Git. From the repository root:

```sh
npm run setup
npm run dev
```

Open the local URL Vite prints (normally http://127.0.0.1:5173). On Windows PowerShell these commands are the same. Git commits use your existing `git config user.name` and `user.email`. Push uses the current branch's configured upstream and your normal Git credentials; set an upstream in your terminal first if needed.

## Use

1. Expand Graph Browser and PMF: both stay open.
2. Open MVP to focus `/graph-browser/mvp`.
3. Click **Edit inline**, enter observations/evidence/next actions, and **Save working state**.
4. Open **Git workspace**, inspect the changes, enter a message, and **Commit objectives**.
5. Reload: the saved state remains. **Push upstream** is a separate explicit operation.

Existing objective content is treated conservatively as protected founder intent. Editable content starts after the exact `<!-- oasis:working-state -->` line (with surrounding newlines). Save changes only that section of `objective.md`; the UI cannot modify intent or directives. Creating objectives, changing protected text, moving directories, or resolving Git conflicts is currently done in your editor/terminal.

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

## Production Node process (local)

```sh
cd graph-browser/mvp
npm run build
```

Set `HOST=127.0.0.1` and `ORIGIN=http://127.0.0.1:3000` using your shell's environment syntax, then `npm start`. Run from this directory, or set `OASIS_REPO` to an absolute Git checkout path. Keep the application source and objective checkout together for the default `../..` repository path.
