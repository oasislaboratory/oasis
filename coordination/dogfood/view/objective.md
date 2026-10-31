## Current
A [manual exporter](export.py) generates one expanded HTML page from the repository’s objective files. Run `python3 coordination/dogfood/view/export.py` from the repository root, then open `oasis.html`. Structural checks passed for all four objectives, nesting, evidence links, blocker and permission sections, and safe text rendering. Visual layout and usefulness in founder use remain unverified.

## Desired
One page expands the repository’s objective tree, preserving its nesting and showing each objective’s current and desired states, with evidence links where available. Blockers and required permissions receive explicit attention.
