# Oasis

Oasis develops **Graph Browser**, a browser-based environment for exploring, editing, and operating live organizations as graphs. The goal is to iterate toward product-market fit with startups, research labs, and AI-native teams.

The repository is organized as a founder-governed OKR tree. Read [the root objective](objective.md) and [agent instructions](AGENTS.md).

## Objectives

- [Graph Lang](graphlang/objective.md): general graph computation foundation.
- [Graph Browser](graphbrowser/objective.md): filesystem-backed browser interface, routing, rendering, and editing.
- [Product validation](validation/objective.md): dogfooding, hosting, user feedback, and PMF evidence.

Git and the filesystem are convenient initial storage and routing mechanisms, **not** Graph Lang's canonical graph model. Graph Lang should remain independent of any particular storage backend or UI.

## Governance

The founder owns strategic objectives. Agents may propose key results but require founder review before adding objective nodes or changing strategic scope. Implementation work should be small, testable, and documented with evidence. Three levels of objectives are the default maximum.
