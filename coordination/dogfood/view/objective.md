## Current
A [manual exporter](export.py) generates one expanded HTML page from the repository’s objective files. [Run instructions](README.md) include a [PowerShell helper](refresh.ps1) that finds Python, pulls with `--ff-only`, regenerates the page, and opens it after successful export. Six [automated exporter tests](test_export.py) pass for nesting, evidence links, blocker and permission sections, safe text rendering, and failure cases; a repository export includes all four objectives. PowerShell execution, visual layout, and usefulness in founder use remain unverified.

## Desired
One page expands the repository’s objective tree, preserving its nesting and showing each objective’s current and desired states, with evidence links where available. Blockers and required permissions receive explicit attention.

