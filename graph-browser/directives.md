# Graph Browser — Directives

These directives apply to Graph Browser and its descendants, in addition to inherited Oasis directives.

- Implement the MVP with SvelteKit and TypeScript, including server-side filesystem operations.
- Treat objective directories and Markdown files in Git as the source of truth. Give objectives stable filesystem-derived URLs.
- Render objectives as recursive, independently expandable windows. Expanding one branch must not collapse siblings; navigating into a child may focus it as the root.
- Show concise objective Markdown directly in expanded windows, with inline editing and persistence.
- Preserve Git history; make commit and push explicit operations.
- Do not introduce Python, a graph database, or a custom GraphLang runtime as prerequisites for the MVP.
- Keep ordinary objective changes live. Enforce inherited protected directives and founder-defined outcomes separately from editable working state.
