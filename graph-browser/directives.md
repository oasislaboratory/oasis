# Graph Browser — Directives

These directives apply to Graph Browser and its descendants, in addition to inherited Oasis directives.

- Implement the MVP with SvelteKit and TypeScript, including server-side filesystem operations.
- Treat objective directories and Markdown files in Git as the source of truth. Give objectives stable filesystem-derived URLs.
- Render objectives as recursive, independently expandable windows. Expanding one branch must not collapse siblings; navigating into a child may focus it as the root.
- During MVP experiments, use plain HTML with minimal styling and no decorative branding or extra product copy. Experiment with actual nested iframes.
- Place the full objective.md in an inline textarea within each window. Editing must not require navigating to a separate document.
- Preserve Git history. Build fast real-time local commits for authorized edits; keep pushing to a remote a separate explicit operation. Commit timing/debounce remains an implementation experiment.
- Do not introduce Python, a graph database, or a custom GraphLang runtime as prerequisites for the MVP.
- Keep ordinary objective changes live. The root user can edit across the graph, including protected intent. Agents may write only within their granted scope and protected-field permissions. Enforce identity and permissions server-side.
- Before accepting agent work, revalidate the current objective, inherited directives, permissions, and relevant repository revision. Stale work must pause and reconcile with user changes before retrying; no silent overwrite or permission expansion.
